interface PageProps {
  params: { slug: string }
}

export default function Page({ params }: PageProps) {
  return (
    <main>
      <h1>Category Detail</h1>
      <p>{params.slug}</p>
    </main>
  )
}
