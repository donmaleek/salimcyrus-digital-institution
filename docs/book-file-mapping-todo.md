# Books removed pending file confirmation

The catalog in `src/lib/data/books.ts` only lists books with a confirmed,
unambiguous PDF in `Books/` (`BOOKS_STORAGE_DIR` in production) — buy and
download must work completely for every title on the site, or it doesn't go
on the site. Three titles were removed for this reason and can be added
back once confirmed:

## 1. "The Unhealed Traumas of Our Parents" — no file found

No PDF in `Books/` matches this title. Meanwhile, `Books/` contains
`MARRIAGE & KNOWING THE RIGHT PARTNER- By SALIM CYRUS.pdf`, which was never
in the catalog at all. Two options:

- **A.** Unrelated: the traumas book doesn't exist yet as a file, and the
  marriage book is a title to add to the catalog fresh.
- **B.** Same title under two different names — pick one name and re-add it
  with the marriage PDF as its `fileName` (or rename to match).

## 2. "The Great Deception of Pornography" vs. "The Great Deception"

Two near-identical candidate files:

- `Books/THE GREAT DECEPTION- By SALIM CYRUS.pdf`
- `Books/THE DECEPTION - By SALIM CYRUS.pdf`

Filename similarity doesn't resolve which is which. Confirm by content (or
ask Salim) which PDF is the pornography-focused book and which is the
self-narrative/accountability book, then re-add both `book(...)` entries
with the correct `fileName`s.

## To re-add a confirmed title

Add a `book(...)` entry back to `src/lib/data/books.ts` with its `fileName`
set, then update the two counts that assert 11 titles:
`src/lib/data/data-integrity.test.ts` and `tests/evals/books-content.eval.js`.
