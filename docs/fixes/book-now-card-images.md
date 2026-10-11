# Book Now card images

The coaching format cards previously constrained uploaded photos to 48px circles.
Photos now occupy the full card width in a 16:9 panel below the name,
description and price. `object-cover` preserves image proportions while cropping
edges to fill the frame. An upper-center focal point gives portraits more headroom. Categories without photos reserve the same space using
initials. Prices align at the bottom of the text panel; photos align along each
row. A subtle hover zoom respects reduced-motion preferences. The one/two/three-column responsive grid and selection behavior remain.

Verification:

```bash
npx jest src/components/payments/CoachingCategoryPicker/images.test.tsx --runInBand
node tests/evals/book-now-content.eval.js
```

The render regression tests cover uploaded and missing photos; the content eval
checks image geometry and text-first order and booking flow contracts. The regression tests fail
against the former circular layout.

When uploading category images, use landscape photos and keep the subject near
the upper center so the cover crop works on mobile and desktop. Deploy the change and
restart the `salimcyrus` PM2 process to update production.

A browser preview using the rendered component and compiled Tailwind CSS passed
geometry checks at 390px, 768px and 1440px: photos below text, full card width,
16:9 proportions, and no horizontal overflow. Preview photos were local samples;
production uploads are not accessed by this check.
