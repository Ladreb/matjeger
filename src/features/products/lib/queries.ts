import { Prisma, type Store } from "@prisma/client";
import { currentListIdSql } from "@/features/shopping-list/lib/current-list";
import { db } from "@/lib/db";

export function listProducts() {
  return db.product.findMany({ orderBy: { name: "asc" } });
}

export function findProduct(id: string) {
  return db.product.findUnique({ where: { id } });
}

export function findProductByBarcode(barcode: string) {
  return db.product.findUnique({
    where: { barcode },
    select: { id: true, name: true, brand: true },
  });
}

const SEARCH_RESULT_LIMIT = 50;
const MAX_SEARCH_TERM_LENGTH = 100;
const FUZZY_MIN_TERM_LENGTH = 4;
const FUZZY_MIN_SIMILARITY = 0.4;
const FUZZY_RANK = 4;
const INSIDE_WORD_MIN_TERM_LENGTH = 3;

type SearchResult = {
  id: string;
  name: string;
  brand: string | null;
  onList: boolean;
  isSimilarMatch: boolean;
  cheapestPrice: number | null;
  cheapestStore: Store | null;
};

type SearchRow = Omit<SearchResult, "cheapestStore"> & {
  cheapestStore: string | null;
};

// The cheapest price is the lowest of the latest report per chain (DECISIONS #2), found in the same query so a result row costs no extra round trip.
// Short terms (is, te, øl) have too few trigrams to tell a typo from noise, so they only match whole words and word starts.
// The separators here must stay the same as in the SQL translate(), so "0,5" matches "0,5 l" on both sides.
export async function searchProducts(
  term: string,
  userId: string,
  postalCode: string | null,
): Promise<SearchResult[]> {
  const lowered = term
    .toLowerCase()
    .replace(/[,.\-/()]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, MAX_SEARCH_TERM_LENGTH)
    .trim();
  if (!lowered) return [];
  const pattern = lowered.replace(/[\\%_]/g, "\\$&");

  const rows = await db.$queryRaw<SearchRow[]>(Prisma.sql`
    SELECT found.id, found.name, found.brand, found.rank = ${FUZZY_RANK} AS "isSimilarMatch",
      EXISTS (
        SELECT 1 FROM "ShoppingListItem" i
        WHERE i."listId" = ${currentListIdSql(userId)} AND i."productId" = found.id
      ) AS "onList",
      cheapest.price AS "cheapestPrice",
      cheapest.store AS "cheapestStore"
    FROM (
      SELECT id, name, brand, rank, score
      FROM (
      SELECT p.id, p.name, p.brand, w.score,
        CASE
          WHEN w.words LIKE '% ' || ${pattern}::text || ' %' THEN 0
          WHEN w.words LIKE '% ' || ${pattern}::text || '%' THEN 1
          WHEN length(${lowered}::text) >= ${INSIDE_WORD_MIN_TERM_LENGTH}
            AND w.words LIKE '%' || ${pattern}::text || '%' THEN 2
          WHEN length(${lowered}::text) >= ${INSIDE_WORD_MIN_TERM_LENGTH}
            AND lower(p.description) LIKE '%' || ${pattern}::text || '%' THEN 3
          WHEN length(${lowered}::text) >= ${FUZZY_MIN_TERM_LENGTH}
            AND w.score >= ${FUZZY_MIN_SIMILARITY} THEN ${FUZZY_RANK}
        END AS rank
      FROM "Product" p
      CROSS JOIN LATERAL (
        SELECT
          ' ' || translate(lower(concat_ws(' ', p.name, p.brand)), ',.-/()', '      ') || ' ' AS words,
          word_similarity(${lowered}::text, lower(concat_ws(' ', p.name, p.brand, p.description))) AS score
      ) w
      ) ranked
      WHERE rank IS NOT NULL
      ORDER BY rank, score DESC, name
      LIMIT ${SEARCH_RESULT_LIMIT}
    ) found
    LEFT JOIN LATERAL (
      SELECT latest.store::text AS store, latest.price
      FROM (
        SELECT DISTINCT ON (r.store) r.store, r.price
        FROM "PriceReport" r
        WHERE r."productId" = found.id
          AND r."postalCode" = ${postalCode}
          AND r."priceUnit" = 'PER_UNIT'
        ORDER BY r.store, r."reportedAt" DESC, r.id DESC
      ) latest
      ORDER BY latest.price, latest.store
      LIMIT 1
    ) cheapest ON true
    ORDER BY found.rank, found.score DESC, found.name
  `);
  return rows.map((row) => ({
    ...row,
    cheapestStore: row.cheapestStore as Store | null,
  }));
}
