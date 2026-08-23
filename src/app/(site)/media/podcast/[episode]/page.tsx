interface PageProps {
  params: { episode: string }
}

export default function Page({ params }: PageProps) {
  return (
    <main>
      <h1>Podcast Detail</h1>
      <p>{params.episode}</p>
    </main>
  )
}
