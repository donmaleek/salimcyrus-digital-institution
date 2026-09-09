'use client'

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface AccountFormProps {
  initialName: string
  email: string
  hasProfileImage: boolean
}

type Status = { tone: 'success' | 'error'; message: string } | null

function Initials({ name }: { name: string }) {
  return <>{(name || 'Member').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</>
}

export function AccountForm({ initialName, email, hasProfileImage }: AccountFormProps) {
  const router = useRouter()
  const fileInput = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(initialName)
  const [preview, setPreview] = useState(hasProfileImage ? '/api/account/avatar' : '')
  const [profileStatus, setProfileStatus] = useState<Status>(null)
  const [passwordStatus, setPasswordStatus] = useState<Status>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setSavingProfile(true)
    setProfileStatus(null)
    const form = new FormData()
    form.set('image', file)
    try {
      const response = await fetch('/api/account/avatar', { method: 'POST', body: form })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not upload your photo.')
      setPreview(URL.createObjectURL(file))
      setProfileStatus({ tone: 'success', message: 'Profile photo updated.' })
      router.refresh()
    } catch (error) {
      setProfileStatus({ tone: 'error', message: error instanceof Error ? error.message : 'Could not upload your photo.' })
    } finally {
      setSavingProfile(false)
      event.target.value = ''
    }
  }

  async function removeImage() {
    setSavingProfile(true)
    const response = await fetch('/api/account/avatar', { method: 'DELETE' })
    setSavingProfile(false)
    if (response.ok) {
      setPreview('')
      setProfileStatus({ tone: 'success', message: 'Profile photo removed.' })
      router.refresh()
    } else setProfileStatus({ tone: 'error', message: 'Could not remove your photo.' })
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingProfile(true)
    setProfileStatus(null)
    try {
      const response = await fetch('/api/account', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not save your profile.')
      setProfileStatus({ tone: 'success', message: 'Profile details saved.' })
      router.refresh()
    } catch (error) {
      setProfileStatus({ tone: 'error', message: error instanceof Error ? error.message : 'Could not save your profile.' })
    } finally { setSavingProfile(false) }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordStatus(null)
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ tone: 'error', message: 'Your new passwords do not match.' })
      return
    }
    setSavingPassword(true)
    try {
      const response = await fetch('/api/account/password', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not change your password.')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      setPasswordStatus({ tone: 'success', message: 'Password changed successfully.' })
    } catch (error) {
      setPasswordStatus({ tone: 'error', message: error instanceof Error ? error.message : 'Could not change your password.' })
    } finally { setSavingPassword(false) }
  }

  const Notice = ({ status }: { status: Status }) => status ? <p role="status" className={`text-sm font-medium ${status.tone === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>{status.message}</p> : null

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)]">
      <section className="border border-navy/10 bg-white p-6 shadow-[0_18px_50px_rgba(15,30,48,0.06)] sm:p-8" aria-labelledby="profile-heading">
        <div className="flex flex-col gap-6 border-b border-navy/10 pb-7 sm:flex-row sm:items-center">
          <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-[#f7f5ef] bg-navy text-2xl font-bold text-gold shadow-sm">
            {preview ? <Image src={preview} alt={`${name || 'Member'} profile`} width={96} height={96} unoptimized className="h-full w-full object-cover" /> : <Initials name={name} />}
          </div>
          <div>
            <h2 id="profile-heading" className="font-heading text-xl font-bold text-navy">Profile identity</h2>
            <p className="mt-1 max-w-lg text-sm leading-6 text-navy-500">Choose a clear headshot so your client experience feels personal across bookings and learning.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} className="sr-only" aria-label="Choose profile photo" />
              <Button type="button" size="sm" variant="outline" loading={savingProfile} onClick={() => fileInput.current?.click()}>Upload Photo</Button>
              {preview && <Button type="button" size="sm" variant="ghost" disabled={savingProfile} onClick={removeImage}>Remove</Button>}
            </div>
            <p className="mt-2 text-xs text-navy-400">JPG, PNG, or WebP. Maximum 2 MB.</p>
          </div>
        </div>
        <form onSubmit={saveProfile} className="mt-7 grid gap-5">
          <Input label="Full name" required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} />
          <Input label="Email address" type="email" disabled value={email} />
          <p className="-mt-3 text-xs text-navy-400">Contact support if you need to change your sign-in email.</p>
          <Notice status={profileStatus} />
          <Button type="submit" loading={savingProfile} className="justify-self-start">{savingProfile ? 'Saving…' : 'Save Profile'}</Button>
        </form>
      </section>

      <section className="border border-navy/10 bg-navy p-6 text-white shadow-[0_18px_50px_rgba(15,30,48,0.12)] sm:p-8" aria-labelledby="security-heading">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300">Account security</p>
        <h2 id="security-heading" className="mt-3 font-heading text-2xl font-bold">Change password</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">Use a unique password with at least 10 characters, uppercase, lowercase, and a number.</p>
        <form onSubmit={changePassword} className="mt-7 grid gap-5 [&_label]:text-slate-200 [&_input]:border-white/20 [&_input]:bg-white/10 [&_input]:text-white">
          <Input label="Current password" type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
          <Input label="New password" type="password" autoComplete="new-password" required minLength={10} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
          <Input label="Confirm new password" type="password" autoComplete="new-password" required minLength={10} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          <Notice status={passwordStatus} />
          <Button type="submit" loading={savingPassword} className="justify-self-start">{savingPassword ? 'Updating…' : 'Update Password'}</Button>
        </form>
      </section>
    </div>
  )
}
