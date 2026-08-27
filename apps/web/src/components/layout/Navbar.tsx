'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { isAuthenticated, isHydrated, logout, user } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Don't render auth-dependent UI until hydrated (prevents SSR mismatch)
  const showAuthUI = isHydrated;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-bold text-xl tracking-tight text-primary">
          CodaScript
        </Link>

        <div className="flex items-center gap-4">
          {showAuthUI && isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                Dashboard
              </Link>
              {user?.role === 'admin' && (
                <Link href="/admin" className="text-sm font-medium transition-colors hover:text-primary text-red-500">
                  Admin
                </Link>
              )}
              <Link href="/leaderboard" className="text-sm font-medium transition-colors hover:text-primary">
                Reyting
              </Link>
              <Link href="/profilee" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-border bg-muted object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="text-sm font-semibold text-muted-foreground hidden sm:inline-block">
                  {user?.name}
                </span>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Chiqish
              </Button>
            </>
          ) : showAuthUI ? (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Kirish</Button>
              </Link>
              <Link href="/login?tab=register">
                <Button size="sm">Ro&apos;yxatdan o&apos;tish</Button>
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
