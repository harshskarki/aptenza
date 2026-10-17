const { withSentryConfig } = require('@sentry/nextjs')

const nextConfig = {
  // your existing config here
}

module.exports = withSentryConfig(nextConfig, {
  org: 'your-sentry-org',
  project: 'aptenza',
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
})