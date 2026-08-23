interface PageProps {
  params: { "booking-id": string }
}

export default function Page({ params }: PageProps) {
  return (
    <main>
      <h1>My Bookings Detail</h1>
      <p>{params["booking-id"]}</p>
    </main>
  )
}
