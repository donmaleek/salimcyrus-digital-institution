'use client'

import { signOut } from 'next-auth/react'

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="text-sm font-medium text-navy-500 hover:text-navy"
    >
      Sign Out
    </button>
  )
}
