import type { Metadata } from 'next'
import { NotPublished } from '@/components/sections/shared/NotPublished'

interface PageProps {
  params: { slug: string }
}

export const metadata: Metadata = {
  title: 'Course',
}

export default function CourseDetailPage({ params }: PageProps) {
  return (
    <NotPublished
      label="Course"
      slug={params.slug}
      backHref="/academy/courses"
      backLabel="Back to Courses"
    />
  )
}
