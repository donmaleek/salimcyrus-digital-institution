import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: '#0F1B2D',
          padding: '80px',
        }}
      >
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#C9A227',
          }}
        >
          Relationship Coach &middot; Speaker &middot; Author &middot; Kingdom Strategist
        </div>
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 104,
            fontWeight: 700,
            color: '#FAF7F1',
            marginTop: 24,
          }}
        >
          Salim Cyrus
        </div>
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 34,
            color: '#EEF1F5',
            marginTop: 24,
            maxWidth: 900,
          }}
        >
          Empowering minds. Reforming hearts. Restoring purpose through truth and wisdom.
        </div>
      </div>
    ),
    { ...size }
  )
}
