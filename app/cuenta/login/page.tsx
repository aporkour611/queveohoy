import { PageMain } from "@/app/components/PageMain"
import { Suspense } from "react"
import { CuentaLoginForm } from "./CuentaLoginForm"
import "../../futbolhoy-feed.css"

const LoginFallback = () => (
  <PageMain className="fh-auth-page">
    <div className="fh-container">
      <div className="fh-auth-card">
        <h1>Iniciar sesión</h1>
        <p className="fh-auth-lead">Cargando…</p>
      </div>
    </div>
  </PageMain>
)

export default function CuentaLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <CuentaLoginForm />
    </Suspense>
  )
}
