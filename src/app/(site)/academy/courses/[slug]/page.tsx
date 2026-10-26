import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { CourseSalesPage } from '@/components/courses/CourseSalesPage'
export const dynamic = 'force-dynamic'
export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const course = await db.course.findFirst({ where: { slug: params.slug, kind: 'course', status: 'published' } });return course ? { title: course.title, description: course.subtitle ?? course.description } : { title: 'Course', robots: { index: false, follow: false } }
}
export default async function CoursePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const page = await CourseSalesPage({ slug: params.slug, kind: 'course' });if (!page) notFound();return page
}
