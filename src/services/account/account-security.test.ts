import { validateNewPassword } from './password'
import { validateProfileImage, MAX_PROFILE_IMAGE_BYTES } from './profile-image'

describe('account security contracts', () => {
  it('requires a strong replacement password that differs from the current one', () => {
    expect(validateNewPassword('', 'StrongPass1')).toMatch(/current/i)
    expect(validateNewPassword('OldPass123', 'short')).toMatch(/10 characters/i)
    expect(validateNewPassword('OldPass123', 'alllowercase1')).toMatch(/uppercase/i)
    expect(validateNewPassword('StrongPass1', 'StrongPass1')).toMatch(/not just used/i)
    expect(validateNewPassword('OldPass123', 'NewStrongPass2')).toBeNull()
  })

  it('accepts real supported signatures and rejects spoofed or oversized files', () => {
    expect(validateProfileImage('image/jpeg', Uint8Array.from([0xff, 0xd8, 0xff, 0x01]))).toBeNull()
    expect(validateProfileImage('image/png', Uint8Array.from([0x89, 0x50, 0x4e, 0x47]))).toBeNull()
    expect(validateProfileImage('image/jpeg', Uint8Array.from([1, 2, 3]))).toMatch(/format/i)
    expect(validateProfileImage('image/gif', Uint8Array.from([1]))).toMatch(/JPG/i)
    expect(validateProfileImage('image/png', new Uint8Array(MAX_PROFILE_IMAGE_BYTES + 1))).toMatch(/2 MB/i)
  })
})
