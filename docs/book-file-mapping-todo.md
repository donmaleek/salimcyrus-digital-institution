# Book-to-file mapping: needs confirmation

Instant download only works for a book once its `fileName` is set in
`src/lib/data/books.ts`, pointing at a real file under `BOOKS_STORAGE_DIR`
(see README). 11 of 14 catalog titles are wired up. Three are not, because
the mapping from catalog slug to the PDF filenames in `Books/` is genuinely
ambiguous or missing — guessing wrong means a paying customer receives the
wrong book. Confirm these, then fill in the `fileName` argument for the
affected `book(...)` entries.

## 1. `the-unhealed-traumas-of-our-parents` — no file found

The catalog lists this title with no corresponding PDF anywhere in `Books/`.
Meanwhile, `Books/` contains `MARRIAGE & KNOWING THE RIGHT PARTNER- By SALIM
CYRUS.pdf`, which has no catalog entry at all. Two options:

- **A.** These are unrelated: the traumas book doesn't exist yet (mark it
  `status: 'upcoming'` until the file is provided), and the marriage book is
  a 15th title to add to the catalog.
- **B.** They're the same title under two different names — pick one name
  and wire `the-unhealed-traumas-of-our-parents`'s `fileName` to the
  marriage PDF (or rename the slug/title if the marriage title should win).

## 2. `the-great-deception-of-pornography` vs. `the-great-deception`

Two catalog entries, two candidate files with near-identical names:

- `Books/THE GREAT DECEPTION- By SALIM CYRUS.pdf`
- `Books/THE DECEPTION - By SALIM CYRUS.pdf`

Filename similarity alone doesn't resolve which is which — need to confirm
by content (or ask Salim) which PDF is the pornography-focused book and
which is the self-narrative/accountability book, then set both `fileName`s.
