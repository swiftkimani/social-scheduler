import "../globals.css"
import AppSidebar from "../components/AppSidebar"

export const metadata = {
  title: "Dashboard — Social Scheduler",
}

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <AppSidebar />
      <main className="app-main">{children}</main>
    </div>
  )
}
