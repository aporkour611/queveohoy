import Link from "next/link";
import { Logo } from "./Logo";
import { AdminNavLink } from "./AdminNavLink";
import { AuthNavLink } from "./AuthNavLink";

type Props = {
  title: string;
  children: React.ReactNode;
};

export function AuthPageShell({ title, children }: Props) {
  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner fh-navbar-inner-auth">
          <Logo />
          <div className="fh-nav-links">
            <AuthNavLink />
            <AdminNavLink />
          </div>
        </div>
      </nav>

      <main className="fh-auth-page">
        <div className="fh-container">
          <div className="fh-auth-card">
            <h1>{title}</h1>
            {children}
            <p className="fh-auth-back">
              <Link href="/">← Volver al inicio</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
