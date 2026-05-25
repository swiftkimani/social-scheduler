'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarSwitcher() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/app');
  // Render Navbar only for non-dashboard pages; hide on system/dashboard
  return isDashboard ? null : <Navbar />;
}
