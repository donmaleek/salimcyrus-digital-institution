import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Input({ label, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <label htmlFor={inputId} className={`block text-sm font-medium text-navy-700 ${className}`}>
      {label}
      <input
        id={inputId}
        {...props}
        className="mt-1 w-full rounded-lg border border-navy-200 px-4 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
      />
    </label>
  )
}
