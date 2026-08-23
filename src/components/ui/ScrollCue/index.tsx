export function ScrollCue() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 flex justify-center sm:bottom-10">
      <div className="flex flex-col items-center gap-1.5 text-gold drop-shadow-[0_1px_4px_rgba(0,0,0,0.65)]">
        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] sm:text-xs">
          Scroll to explore
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5 motion-safe:animate-bounce"
        >
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}
