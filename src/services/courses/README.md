# Courses service

Owns self-paced courses and on-demand masterclasses. A product contains ordered sections and lessons. Publishing controls catalog visibility; enrollment controls member access; lesson progress drives resume state and course completion.

Admin route: `/dashboard/admin/courses`. Member route: `/dashboard/my-learning/courses/[courseSlug]`. Free products enroll immediately. Paid products support Paystack, PayPal, and an admin-reviewed M-Pesa Paybill claim. Every online verification checks the signed-in learner, product reference, and exact server-side price before granting access.

Once a product has an enrollment, its curriculum is locked to protect lesson progress. Archive it and create a replacement when the lesson structure must change; catalog copy and pricing should be finalized before the first learner enrolls.

Gate tests run with `npm test -- --runInBand`. Periodic product evals live in `evals/courses/` and verify the author-to-completion journey against the course contract.
