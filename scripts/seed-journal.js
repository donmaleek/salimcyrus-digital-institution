#!/usr/bin/env node
// One-off migration: carries the one journal entry that existed as static
// data (before the DB-backed journal system) into the JournalEntry table,
// so its URL keeps working. Its "body" is seeded from the summary/thesis
// that already existed — no full essay text existed anywhere in the
// codebase before this, so there is nothing further to migrate. Salim
// should open this entry in /dashboard/admin/journal and replace the body
// with the actual essay.

const { PrismaClient } = require('@prisma/client')

async function main() {
  const db = new PrismaClient()
  try {
    const slug = 'people-vent-on-social-media-because-they-arent-heard-in-person'
    const existing = await db.journalEntry.findUnique({ where: { slug } })
    if (existing) {
      console.log('Already migrated, skipping.')
      return
    }

    await db.journalEntry.create({
      data: {
        slug,
        title: "People Vent on Social Media Because They Aren't Heard in Person",
        subtitle: 'A reflection on silence, attention, and the digital cry for help',
        category: 'Relationships and Society',
        summary:
          'What looks like online oversharing can begin with a quieter failure: people do not feel heard in their homes, friendships, workplaces, or faith communities. This essay asks what attentive listening could repair before pain moves into public view.',
        thesis:
          'Digital expression is often a symptom of offline disconnection. Healthier communities are built when people learn to listen before they judge the way pain is expressed.',
        body:
          'What looks like online oversharing can begin with a quieter failure: people do not feel heard in their homes, friendships, workplaces, or faith communities. This essay asks what attentive listening could repair before pain moves into public view.\n\n' +
          'Digital expression is often a symptom of offline disconnection. Healthier communities are built when people learn to listen before they judge the way pain is expressed.\n\n' +
          '[This entry was migrated from a placeholder summary — edit it in /dashboard/admin/journal to add the full essay.]',
        readingTime: '8 minute overview',
        status: 'published',
        publishedAt: new Date('2025-09-04'),
      },
    })

    console.log('Migrated the existing journal entry into the database.')
  } finally {
    await db.$disconnect()
  }
}

main()
