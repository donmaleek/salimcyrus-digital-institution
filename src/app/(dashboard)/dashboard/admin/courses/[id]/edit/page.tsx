import { notFound } from 'next/navigation'
import { requireCrmPage } from '@/services/crm/access'
import { db } from '@/lib/db'
import { CourseEditor } from '@/components/dashboard/CourseEditor'
export default async function EditCoursePage({ params }: { params: { id: string } }) { await requireCrmPage('content:write'); const course = await db.course.findUnique({ where: { id: params.id }, include: { sections: { include: { lessons: { orderBy: { position: 'asc' } } }, orderBy: { position: 'asc' } } } }); if (!course) notFound(); return <div className="mx-auto max-w-5xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700">Learning studio</p><h1 className="mt-2 font-heading text-3xl font-bold text-navy">Edit {course.title}</h1><div className="mt-8"><CourseEditor initial={course} /></div></div> }
