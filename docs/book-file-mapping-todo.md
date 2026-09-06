# Books removed pending file confirmation

The catalog in `src/lib/data/books.ts` only lists books with a confirmed,
unambiguous PDF in `Books/` (`BOOKS_STORAGE_DIR` in production). Resolved by
actually reading the PDF content (not just comparing filenames):

## Resolved

- **"The Great Deception"** → `THE GREAT DECEPTION- By SALIM CYRUS.pdf`.
  Confirmed: the PDF's own subtitle ("A Brutal Accounting of How the Stories
  You Tell Yourself Keep Stealing Your Focus") matches the catalog
  description word for word. Restored to the catalog.

## Still unresolved — no matching file exists

- **"The Unhealed Traumas of Our Parents"** — no PDF in `Books/` matches
  this. `MARRIAGE & KNOWING THE RIGHT PARTNER- By SALIM CYRUS.pdf` was
  initially suspected to be the same title under a different name; read in
  full, it's genuinely about partner discernment before marriage (character,
  compatibility, a 5-step framework), not generational trauma. They are
  unrelated. Remains removed until a real file is provided.

- **"The Great Deception of Pornography"** — no PDF matches this either.
  `THE DECEPTION - By SALIM CYRUS.pdf` was the other candidate; read in
  full, it's a 10-chapter book on self-deception across life domains
  (victimhood, social media validation, spiritual performance, leadership,
  discipline) with no chapter on pornography at all. Not a match. Remains
  removed until a real file is provided.

## Two complete, previously-unlisted books added

Reading through `Books/` turned up two finished PDFs that were never in the
catalog at all. Added as `the-deception` and
`marriage-and-knowing-the-right-partner`. Cover art was extracted from each
PDF's own designed first page (`pdftocairo` + ImageMagick crop/pad to the
site's standard 1200x1500), not newly generated.

## To re-add a confirmed title

Add a `book(...)` entry back to `src/lib/data/books.ts` with its `fileName`
set, then update the counts that assert the total: `src/lib/data/data-integrity.test.ts`,
`tests/evals/books-content.eval.js`, and the FAQ copy in
`src/app/(site)/books/page.tsx`.
