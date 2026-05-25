import "./globals.css";
import Navbar from "./components/Navbar";
import DashboardNavbar from "./components/DashboardNavbar";
import NavbarSwitcher from "./components/NavbarSwitcher";

export const metadata = {
  title: "NEXUS AI — Social Intelligence Platform",
  description: "Your AI-Powered Social Media Command Center. Schedule, create, listen, and optimize across every channel.",
  openGraph: { title: "NEXUS AI", description: "AI-Powered Social Media Command Center" },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <NavbarSwitcher />
        <main>{children}</main>
      </body>
    </html>
  );
}
