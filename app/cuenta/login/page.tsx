import { Suspense } from "react"
import { CuentaLoginForm } from "./CuentaLoginForm"
import "../../futbolhoy-feed.css"

const LoginFallback = () => (
  <main className="fh-auth-page">
    <div className="fh-container">
      <div className="fh-auth-card">
        <h1>Iniciar sesión</h1>
        <p className="fh-auth-lead">Cargando…</p>
      </div>
    </div>
  </main>
)

export default function CuentaLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <CuentaLoginForm />
    </Suspense>
  )
}
