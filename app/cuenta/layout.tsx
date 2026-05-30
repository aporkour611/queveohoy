import "../futbolhoy.css"
import type { Metadata } from "next"
import { Logo } from "../components/Logo"
import { privateAreaMetadata } from "../lib/private-metadata"

export const metadata: Metadata = privateAreaMetadata("Mi cuenta — QueveoHoy")

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
