interface PageProps {
  params: { "course-slug": string }
}

export default function Page({ params }: PageProps) {
  return (
    <main>
      <h1>My Learning Detail</h1>
      <p>{params["course-slug"]}</p>
    </main>
  )
}
