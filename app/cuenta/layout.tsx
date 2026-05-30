import "../futbolhoy.css"
import { Logo } from "../components/Logo"

export default function CuentaLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner fh-navbar-inner-auth">
          <Logo />
          <span aria-hidden />
          <span />
        </div>
      </nav>
      {children}
    </div>
  )
}
