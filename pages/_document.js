import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                {/* PWA Meta Tags */}
                <meta name="application-name" content="EduTrack AI" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="EduTrack AI" />
                <meta name="description" content="AI-powered attendance management system for students with comprehensive analytics and study plans" />
                <meta name="format-detection" content="telephone=no" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="msapplication-config" content="/icons/browserconfig.xml" />
                <meta name="msapplication-TileColor" content="#06b6d4" />
                <meta name="msapplication-tap-highlight" content="no" />
                <meta name="theme-color" content="#06b6d4" />

                {/* Manifest */}
                <link rel="manifest" href="/manifest.json" />

                {/* Favicon */}
                <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
                <link rel="shortcut icon" href="/favicon.ico" />

                {/* Apple Touch Icons */}
                <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
                <link rel="apple-touch-icon" sizes="57x57" href="/icons/icon-57x57.png" />
                <link rel="apple-touch-icon" sizes="60x60" href="/icons/icon-60x60.png" />
                <link rel="apple-touch-icon" sizes="72x72" href="/icons/icon-72x72.png" />
                <link rel="apple-touch-icon" sizes="76x76" href="/icons/icon-76x76.png" />
                <link rel="apple-touch-icon" sizes="114x114" href="/icons/icon-114x114.png" />
                <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120x120.png" />
                <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
                <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />

                {/* Apple Splash Screens */}
                <link rel="apple-touch-startup-image" href="/icons/apple-splash-2048-2732.jpg" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
                <link rel="apple-touch-startup-image" href="/icons/apple-splash-1668-2388.jpg" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
                <link rel="apple-touch-startup-image" href="/icons/apple-splash-1536-2048.jpg" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
                <link rel="apple-touch-startup-image" href="/icons/apple-splash-1125-2436.jpg" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
                <link rel="apple-touch-startup-image" href="/icons/apple-splash-1242-2208.jpg" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
                <link rel="apple-touch-startup-image" href="/icons/apple-splash-750-1334.jpg" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
                <link rel="apple-touch-startup-image" href="/icons/apple-splash-640-1136.jpg" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />

                {/* Windows Tiles */}
                <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
                <meta name="msapplication-square70x70logo" content="/icons/icon-70x70.png" />
                <meta name="msapplication-square150x150logo" content="/icons/icon-150x150.png" />
                <meta name="msapplication-wide310x150logo" content="/icons/icon-310x150.png" />
                <meta name="msapplication-square310x310logo" content="/icons/icon-310x310.png" />

                {/* Additional Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content="https://edutrack-ai.vercel.app" />
                <meta name="twitter:title" content="EduTrack AI - Smart Attendance Management" />
                <meta name="twitter:description" content="AI-powered attendance management with comprehensive analytics and personalized study plans" />
                <meta name="twitter:image" content="/icons/twitter-card.png" />
                <meta name="twitter:creator" content="@EduTrackAI" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="EduTrack AI - Smart Attendance Management" />
                <meta property="og:description" content="AI-powered attendance management with comprehensive analytics and personalized study plans" />
                <meta property="og:site_name" content="EduTrack AI" />
                <meta property="og:url" content="https://edutrack-ai.vercel.app" />
                <meta property="og:image" content="/icons/og-image.png" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
