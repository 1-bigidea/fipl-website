import webpush from 'web-push'

let configured = false

function ensureConfigured() {
  if (configured) return
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  )
  configured = true
}

export function getWebpush() {
  ensureConfigured()
  return webpush
}
