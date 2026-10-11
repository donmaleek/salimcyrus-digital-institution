# Book Now card images

The coaching format cards previously constrained uploaded photos to 48px circles.
Photos now occupy the full card width in a 16:10 header above the name,
description and price. `object-cover` preserves image proportions while cropping
edges to fill the frame. Categories without photos reserve the same space using
initials. The one/two/three-column responsive grid and selection behavior remain.

Verification:

```bash
npx jest src/components/payments/CoachingCategoryPicker/images.test.tsx --runInBand
node tests/evals/book-now-content.eval.js
```

The render regression tests cover uploaded and missing photos; the content eval
checks header geometry and booking flow contracts. The regression tests fail
against the former circular layout.

When uploading category images, use landscape photos and keep the subject near
the center so the cover crop works on mobile and desktop. Deploy the change and
restart the `salimcyrus` PM2 process to update production.
