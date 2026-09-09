export function validateNewPassword(currentPassword: string, newPassword: string) {
  if (!currentPassword) return 'Enter your current password.'
  if (newPassword.length < 10) return 'Use at least 10 characters for your new password.'
  if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return 'Include uppercase, lowercase, and a number.'
  }
  if (currentPassword === newPassword) return 'Choose a password you have not just used.'
  return null
}
