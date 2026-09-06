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

## Two complete, unlisted books discovered while checking the above

Reading through `Books/` turned up two finished PDFs that were never in the
catalog at all:

- `THE DECEPTION - By SALIM CYRUS.pdf` — "A Brutal Accounting of the Lies
  You Live By, and the Truth That Will Set You Free." 10 chapters, distinct
  from "The Great Deception."
- `MARRIAGE & KNOWING THE RIGHT PARTNER- By SALIM CYRUS.pdf` — "Discerning
  Love, Character, Compatibility, Covenant and Purpose." A partner-discernment
  framework book.

Not added to the catalog yet — that's a new-product decision (title,
description, cover art, pricing), not a mapping fix, so it wasn't done
without asking. Add them the same way as any other title once confirmed.

## To re-add a confirmed title

Add a `book(...)` entry back to `src/lib/data/books.ts` with its `fileName`
set, then update the counts that assert the total: `src/lib/data/data-integrity.test.ts`,
`tests/evals/books-content.eval.js`, and the FAQ copy in
`src/app/(site)/books/page.tsx`.
