'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

export default function Nav() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  return (
    <nav className="nav">
      <div className="nav-brand">
        <img src="https://crests.football-data.org/60.png" alt="" className="nav-brand-crest" />
        <div>
          <div>FVWL</div>
          <div className="nav-subtitle">Squad Finance · 2026/27</div>
        </div>
      </div>
      <div className="nav-right">
        <Link href="/" className="nav-link">Squad</Link>
        <Link href="/admin" className="nav-link">Admin</Link>
        <span className="nav-user">{user?.email}</span>
        <button className="nav-btn" onClick={handleLogout}>Sign out</button>
      </div>
    </nav>
  );
}