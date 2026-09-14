import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { CourseSalesPage } from '@/components/courses/CourseSalesPage'
export const dynamic = 'force-dynamic'
export async function generateMetadata({ params }: { params: { slug: string } }) { const course = await db.course.findFirst({ where: { slug: params.slug, kind: 'masterclass', status: 'published' } }); return course ? { title: course.title, description: course.subtitle ?? course.description } : { title: 'Masterclass' } }
export default async function MasterclassPage({ params }: { params: { slug: string } }) { const page = await CourseSalesPage({ slug: params.slug, kind: 'masterclass' }); if (!page) notFound(); return page }
