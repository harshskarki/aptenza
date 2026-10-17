'use client'

import ErrorBoundary from '@/components/ErrorBoundary'

export default function Error({ error, reset }) {
  return <ErrorBoundary error={error} reset={reset} />
}