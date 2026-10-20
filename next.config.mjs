import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* your existing config options here */
};

export default withSentryConfig(nextConfig, {
  org: 'your-sentry-org', // Replace with your actual Sentry org slug
  project: 'aptenza',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
});