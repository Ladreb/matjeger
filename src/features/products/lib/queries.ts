import { Prisma } from "@prisma/client";
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
const INSIDE_WORD_MIN_TERM_LENGTH = 3;

type SearchResult = { id: string; name: string; brand: string | null };

// Short terms (is, te, øl) have too few trigrams to tell a typo from noise, so they only match whole words and word starts.
// The separators here must stay the same as in the SQL translate(), so "0,5" matches "0,5 l" on both sides.
export function searchProducts(term: string): Promise<SearchResult[]> {
  const lowered = term
    .toLowerCase()
    .replace(/[,.\-/()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_SEARCH_TERM_LENGTH);
  if (!lowered) return Promise.resolve([]);
  const pattern = lowered.replace(/[\\%_]/g, "\\$&");

  return db.$queryRaw<SearchResult[]>(Prisma.sql`
    SELECT id, name, brand FROM (
      SELECT p.id, p.name, p.brand, w.score,
        CASE
          WHEN w.words LIKE '% ' || ${pattern}::text || ' %' THEN 0
          WHEN w.words LIKE '% ' || ${pattern}::text || '%' THEN 1
          WHEN length(${lowered}::text) >= ${INSIDE_WORD_MIN_TERM_LENGTH}
            AND w.words LIKE '%' || ${pattern}::text || '%' THEN 2
          WHEN length(${lowered}::text) >= ${INSIDE_WORD_MIN_TERM_LENGTH}
            AND lower(p.description) LIKE '%' || ${pattern}::text || '%' THEN 3
          WHEN length(${lowered}::text) >= ${FUZZY_MIN_TERM_LENGTH}
            AND w.score >= ${FUZZY_MIN_SIMILARITY} THEN 4
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
  `);
}
