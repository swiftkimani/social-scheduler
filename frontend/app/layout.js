import "./globals.css"

export const metadata = {
  title: "Social Scheduler",
  description: "Schedule and manage social media posts",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
