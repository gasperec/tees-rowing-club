import type { ReactNode } from "react";
import { Link } from "react-router";
import { Waves, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function MemberShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
              <Waves className="h-4 w-4" />
            </span>
            <span
              className="font-bold tracking-tight"
              style={{ fontFamily: "Sora, sans-serif" }}
            >
              Tees RC · Members
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/booking"
              className="rounded-full px-3 py-2 text-sm font-semibold text-foreground/80 hover:bg-secondary"
            >
              Boat booking
            </Link>
            <Link
              to="/members"
              className="rounded-full px-3 py-2 text-sm font-semibold text-foreground/80 hover:bg-secondary"
            >
              Members
            </Link>
            <Link
              to="/profile"
              className="rounded-full px-3 py-2 text-sm font-semibold text-foreground/80 hover:bg-secondary"
            >
              My profile
            </Link>
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="rounded-full px-3 py-2 text-sm font-semibold text-foreground/80 hover:bg-secondary"
              >
                Admin
              </Link>
            )}
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user?.name ?? user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={logout} className="rounded-full">
              <LogOut className="mr-1 h-3.5 w-3.5" /> Sign out
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {children}
      </main>
    </div>
  );
}
