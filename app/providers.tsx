'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { PostHogProvider } from 'posthog-js/react'
import posthog from 'posthog-js'
import { useEffect, ReactNode, Suspense } from 'react'

// Initialize PostHog only on the client-side
if (typeof window !== 'undefined') {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

    if (posthogKey && posthogHost) {
        posthog.init(posthogKey, {
            api_host: posthogHost,
            // Enable debug mode in development
            loaded: (ph) => {
                if (process.env.NODE_ENV === 'development') ph.debug()
            },
            // Capture pageviews is set to false because we are handling it manually
            capture_pageview: false,
            // Consider enabling session recording if you want to see user sessions
            // session_recording: {
            //   maskAllInputs: true, // Recommended for privacy
            //   maskTextSelector: ".ph-no-capture", // Add class="ph-no-capture" to sensitive elements
            // },
        })
    } else {
        console.warn("PostHog key or host not found. Please check your .env.local file. Analytics will be disabled.")
    }
}

// Component to handle pageview tracking
// Wrap with Suspense because usePathname and useSearchParams can suspend during pre-rendering
function PostHogPageviewTracker(): null {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (pathname && typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
            let url = window.origin + pathname
            if (searchParams && searchParams.toString()) {
                url = `${url}?${searchParams.toString()}`
            }
            posthog.capture('$pageview', {
                '$current_url': url,
            })
        }
    }, [pathname, searchParams])

    return null
}

// Export the provider component
export function CSPostHogProvider({ children }: { children: ReactNode }) {
    // Ensure PostHog is initialized before rendering the provider
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || !process.env.NEXT_PUBLIC_POSTHOG_HOST) {
        // PostHog is not configured, return children directly
        return <>{children}</>;
    }

    return (
        <PostHogProvider client={posthog}>
            {/* Suspense boundary for pageview tracker */}
            <Suspense fallback={null}>
                <PostHogPageviewTracker />
            </Suspense>
            {children}
        </PostHogProvider>
    )
}