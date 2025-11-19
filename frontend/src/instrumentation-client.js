import posthog from 'posthog-js'

// Only initialize PostHog on the client side
if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: false, // We'll manually capture pageviews
    capture_pageleave: true,
  });
}

export default posthog;
