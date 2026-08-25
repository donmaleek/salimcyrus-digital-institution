# Admin Journal and Availability

## Journal workflow

Open `/dashboard/admin/journal` to see publishing totals and every draft or published essay. Create or edit an essay to upload a JPG, PNG, or WebP cover image up to 4 MB. Every image requires a useful description for readers using assistive technology. The optional caption appears below the image on the public essay.

Images are stored in PostgreSQL with their journal entry, not on the application server filesystem. This keeps media available after application restarts and across deployments. Public images are served from `/api/journal/:id/cover`; unpublished images require an authenticated content editor.

The editor reports word count and an estimated reading time. Use **Preview article** before saving. **Save Draft** keeps an entry private. **Publish** makes the essay and cover image public.

## Availability workflow

Open `/dashboard/admin/availability` to see upcoming capacity, open sessions, and confirmed bookings. Add a date, local time, and session duration, then use the Upcoming, Booked, and Past filters to focus the schedule.

Booked slots cannot be removed from the availability screen. This protects the client commitment and its booking record. Resolve or cancel the booking first through the relevant client workflow.

## Image limits and failure handling

- Accepted formats: JPEG, PNG, and WebP.
- Maximum file size: 4 MB.
- Alternative text: 3 to 180 characters.
- Captions: up to 240 characters.
- Invalid media is rejected before any journal data is written.
