import "./globals.css"
import Navbar from "./components/Navbar"

export const metadata = {
  title: "Social Scheduler — AI-Powered Post Scheduling",
  description: "Schedule and manage social media posts across Twitter and LinkedIn with AI-powered content generation and pattern insights.",
  openGraph: {
    title: "Social Scheduler",
    description: "AI-powered social media scheduling agent",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
