#!/usr/bin/env node
// Whole-site kill switch for non-payment: flips APP_SUSPENDED in .env.local
// and restarts the PM2 process so it takes effect immediately. Run this on
// the production server itself (it edits the local .env.local and talks to
// the local PM2 daemon), not from a dev machine.
//
// Usage:
//   node scripts/toggle-site.js on       # suspend the whole site
//   node scripts/toggle-site.js off      # bring it back
//   node scripts/toggle-site.js status   # just report current state, no change

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const PM2_PROCESS_NAME = 'salimcyrus'
const ENV_FILE = path.join(process.cwd(), '.env.local')

function readEnvFile() {
  return fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, 'utf8') : ''
}

function currentlySuspended(content) {
  return /^APP_SUSPENDED=true$/m.test(content)
}

function setSuspended(content, suspended) {
  const line = `APP_SUSPENDED=${suspended}`
  if (/^APP_SUSPENDED=.*$/m.test(content)) {
    return content.replace(/^APP_SUSPENDED=.*$/m, line)
  }
  const needsNewline = content.length > 0 && !content.endsWith('\n')
  return `${content}${needsNewline ? '\n' : ''}${line}\n`
}

module.exports = { currentlySuspended, setSuspended }

function main() {
  const action = process.argv[2]
  if (!['on', 'off', 'status'].includes(action)) {
    console.error('Usage: node scripts/toggle-site.js <on|off|status>')
    process.exit(1)
  }

  const content = readEnvFile()
  const isSuspended = currentlySuspended(content)

  if (action === 'status') {
    console.log(isSuspended ? 'Site is currently SUSPENDED.' : 'Site is currently LIVE.')
    return
  }

  const wantSuspended = action === 'on'
  if (isSuspended === wantSuspended) {
    console.log(`Already ${wantSuspended ? 'suspended' : 'live'}. No change made.`)
    return
  }

  fs.writeFileSync(ENV_FILE, setSuspended(content, wantSuspended))
  console.log(`.env.local updated: APP_SUSPENDED=${wantSuspended}`)

  execSync(`pm2 restart ${PM2_PROCESS_NAME} --update-env`, { stdio: 'inherit' })
  console.log(wantSuspended ? 'Site is now SUSPENDED for every visitor.' : 'Site is now LIVE again.')
}

if (require.main === module) {
  main()
}
