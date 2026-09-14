import { db } from '@/lib/db'
import { requireCrmPage } from '@/services/crm/access'
import { CourseManager } from '@/components/dashboard/CourseManager'

export const dynamic = 'force-dynamic'
export default async function AdminCoursesPage() {
  await requireCrmPage('content:write')
  const courses = await db.course.findMany({ include: { sections: { include: { _count: { select: { lessons: true } } } }, _count: { select: { enrollments: true } } }, orderBy: { updatedAt: 'desc' } })
  return <div><div className="rounded-3xl bg-navy px-7 py-9 text-white"><p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Learning studio</p><h1 className="mt-3 font-heading text-3xl font-bold">Courses & Masterclasses</h1><p className="mt-3 max-w-2xl text-white/70">Build the sales page, curriculum, lesson order, pricing, and publishing state in one place.</p></div><div className="mt-8"><CourseManager courses={courses.map((c) => ({ id: c.id, slug: c.slug, title: c.title, kind: c.kind, status: c.status, priceKes: c.priceKes, lessons: c.sections.reduce((n, s) => n + s._count.lessons, 0), enrollments: c._count.enrollments, updatedAt: c.updatedAt.toISOString() }))} /></div></div>
}
