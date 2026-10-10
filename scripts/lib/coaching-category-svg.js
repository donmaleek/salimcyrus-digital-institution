// Pure SVG generation for the 8 coaching category card images: one
// abstract, gold-on-navy geometric mark per category (compass, rings,
// protective arc, etc.), all drawn from the same brand palette as
// tailwind.config.js (navy/gold) so they read as one cohesive set rather
// than eight unrelated pictures. Kept separate from
// generate-coaching-category-images.js so the markup itself is testable
// without needing sharp, Prisma, or disk access.

const NAVY_DARK = '#0F1B2D'
const NAVY_MID = '#1B324D'
const GOLD = '#C9A227'
const GOLD_LIGHT = '#DFB74B'
const GOLD_PALE = '#EBCF7D'
const CREAM = '#FAF7F1'

function card(size, iconMarkup) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${NAVY_MID}" />
      <stop offset="100%" stop-color="${NAVY_DARK}" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="38%" r="60%">
      <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.16" />
      <stop offset="100%" stop-color="${GOLD}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)" />
  <rect width="${size}" height="${size}" fill="url(#glow)" />
  <g stroke="${GOLD_PALE}" stroke-opacity="0.25" fill="none">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.42}" stroke-width="1.5" />
  </g>
  <g transform="translate(${size / 2}, ${size / 2})">
    ${iconMarkup}
  </g>
</svg>`
}

/** Returns { [CoachingCategorySlug]: svgMarkup } for all 8 categories in
 * src/lib/data/coaching-offers.ts. `size` is the square canvas size in px;
 * every icon is drawn proportionally to it. */
function coachingCategorySvgs(size) {
  return {
    // Standard Sessions: a compass needle, clarity and direction on one decision.
    standard: card(
      size,
      `
  <circle r="150" fill="none" stroke="${GOLD}" stroke-width="5" />
  <circle r="150" fill="none" stroke="${GOLD}" stroke-width="5" opacity="0.35" transform="rotate(45)" stroke-dasharray="2 14" />
  <path d="M 0 -120 L 28 0 L 0 120 L -28 0 Z" fill="${GOLD_LIGHT}" />
  <path d="M 0 -120 L 28 0 L 0 0 Z" fill="${GOLD}" />
  <path d="M 0 120 L -28 0 L 0 0 Z" fill="${GOLD}" />
  <circle r="14" fill="${CREAM}" />
`
    ),

    // Identity & Life Alignment: concentric rings centered on a single point, clarity and alignment.
    'identity-alignment': card(
      size,
      `
  <circle r="150" fill="none" stroke="${GOLD}" stroke-width="4" opacity="0.9" />
  <circle r="104" fill="none" stroke="${GOLD_LIGHT}" stroke-width="4" opacity="0.75" />
  <circle r="58" fill="none" stroke="${GOLD_PALE}" stroke-width="4" opacity="0.6" />
  <circle r="16" fill="${GOLD}" />
`
    ),

    // Single Motherhood & Life Alignment: a protective arc around a smaller figure, resilience and care.
    'single-motherhood-alignment': card(
      size,
      `
  <path d="M -140 40 A 140 140 0 0 1 140 40" fill="none" stroke="${GOLD}" stroke-width="16" stroke-linecap="round" />
  <circle cx="0" cy="56" r="34" fill="${GOLD_LIGHT}" />
  <circle cx="0" cy="56" r="34" fill="none" stroke="${NAVY_DARK}" stroke-width="3" opacity="0.4" />
`
    ),

    // Individual Coaching: two circles joined by a direct line, one-on-one mentorship.
    individual: card(
      size,
      `
  <line x1="-78" y1="-10" x2="70" y2="18" stroke="${GOLD_PALE}" stroke-width="4" opacity="0.8" />
  <circle cx="-78" cy="-10" r="52" fill="${GOLD}" />
  <circle cx="70" cy="18" r="34" fill="${GOLD_LIGHT}" />
`
    ),

    // Couples Coaching: two overlapping circles, partnership and shared ground.
    couples: card(
      size,
      `
  <circle cx="-54" cy="0" r="92" fill="none" stroke="${GOLD}" stroke-width="7" />
  <circle cx="54" cy="0" r="92" fill="none" stroke="${GOLD_LIGHT}" stroke-width="7" />
`
    ),

    // Group Coaching: a cluster of connected circles, a team moving together.
    group: card(
      size,
      `
  <g stroke="${GOLD_PALE}" stroke-width="3" opacity="0.65">
    <line x1="0" y1="0" x2="-96" y2="-54" />
    <line x1="0" y1="0" x2="96" y2="-54" />
    <line x1="0" y1="0" x2="-70" y2="88" />
    <line x1="0" y1="0" x2="70" y2="88" />
  </g>
  <circle cx="0" cy="0" r="30" fill="${GOLD}" />
  <circle cx="-96" cy="-54" r="20" fill="${GOLD_LIGHT}" />
  <circle cx="96" cy="-54" r="20" fill="${GOLD_LIGHT}" />
  <circle cx="-70" cy="88" r="20" fill="${GOLD_LIGHT}" />
  <circle cx="70" cy="88" r="20" fill="${GOLD_LIGHT}" />
`
    ),

    // VIP Summit & Speaking: a five-point star with radiating spotlight lines, stage presence.
    'vip-summit': card(
      size,
      `
  <g stroke="${GOLD_PALE}" stroke-width="3" opacity="0.5">
    <line x1="0" y1="0" x2="0" y2="-158" />
    <line x1="0" y1="0" x2="150" y2="-49" />
    <line x1="0" y1="0" x2="93" y2="128" />
    <line x1="0" y1="0" x2="-93" y2="128" />
    <line x1="0" y1="0" x2="-150" y2="-49" />
  </g>
  <path d="M 0 -62 L 18 -19 L 64 -19 L 27 8 L 41 52 L 0 25 L -41 52 L -27 8 L -64 -19 L -18 -19 Z" fill="${GOLD}" />
`
    ),

    // Parenting Mentorship: ascending stepping-stone circles along a rising
    // guiding curve, a growth journey walked alongside a mentor.
    'parenting-mentorship': card(
      size,
      `
  <path d="M -130 110 Q -40 110 0 20 Q 40 -70 130 -110" fill="none" stroke="${GOLD_PALE}" stroke-width="4" opacity="0.6" stroke-linecap="round" />
  <circle cx="-130" cy="110" r="18" fill="${GOLD_LIGHT}" />
  <circle cx="-30" cy="46" r="24" fill="${GOLD_LIGHT}" />
  <circle cx="60" cy="-38" r="30" fill="${GOLD}" />
  <circle cx="130" cy="-110" r="38" fill="${GOLD}" />
`
    ),
  }
}

module.exports = { coachingCategorySvgs }
