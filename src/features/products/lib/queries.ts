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
const FUZZY_MIN_TERM_LENGTH = 4;
const FUZZY_MIN_SIMILARITY = 0.4;
const INSIDE_WORD_MIN_TERM_LENGTH = 3;

type SearchResult = { id: string; name: string; brand: string | null };

// Terms under 3 letters (is, te, øl) only match whole words and word starts, and fuzzy matching needs 4 or more letters:
// shorter terms have too few trigrams to tell a typo from noise.
// Ranks run from best to worst: whole word, word start, inside a word, description, fuzzy.
export function searchProducts(term: string): Promise<SearchResult[]> {
  const lowered = term.toLowerCase();
  const pattern = lowered.replace(/[\\%_]/g, "\\$&");

  return db.$queryRaw<SearchResult[]>(Prisma.sql`
    SELECT id, name, brand FROM (
      SELECT p.id, p.name, p.brand,
        CASE
          WHEN w.words LIKE '% ' || ${pattern}::text || ' %' THEN 0
          WHEN w.words LIKE '% ' || ${pattern}::text || '%' THEN 1
          WHEN length(${lowered}::text) >= ${INSIDE_WORD_MIN_TERM_LENGTH}
            AND w.words LIKE '%' || ${pattern}::text || '%' THEN 2
          WHEN length(${lowered}::text) >= ${INSIDE_WORD_MIN_TERM_LENGTH}
            AND lower(p.description) LIKE '%' || ${pattern}::text || '%' THEN 3
          WHEN length(${lowered}::text) >= ${FUZZY_MIN_TERM_LENGTH}
            AND word_similarity(${lowered}::text, lower(concat_ws(' ', p.name, p.brand, p.description))) >= ${FUZZY_MIN_SIMILARITY}
            THEN 4
        END AS rank
      FROM "Product" p
      CROSS JOIN LATERAL (
        SELECT ' ' || translate(lower(concat_ws(' ', p.name, p.brand)), ',.-/()', '      ') || ' ' AS words
      ) w
    ) ranked
    WHERE rank IS NOT NULL
    ORDER BY rank, name
    LIMIT ${SEARCH_RESULT_LIMIT}
  `);
}
