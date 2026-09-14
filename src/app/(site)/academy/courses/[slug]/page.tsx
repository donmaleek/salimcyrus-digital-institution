import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { CourseSalesPage } from '@/components/courses/CourseSalesPage'
export const dynamic = 'force-dynamic'
export async function generateMetadata({ params }: { params: { slug: string } }) { const course = await db.course.findFirst({ where: { slug: params.slug, kind: 'course', status: 'published' } }); return course ? { title: course.title, description: course.subtitle ?? course.description } : { title: 'Course' } }
export default async function CoursePage({ params }: { params: { slug: string } }) { const page = await CourseSalesPage({ slug: params.slug, kind: 'course' }); if (!page) notFound(); return page }
