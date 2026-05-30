import { CuentaLoginForm } from "./CuentaLoginForm"
import "../../futbolhoy-feed.css"

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>
}

export default async function CuentaLoginPage({ searchParams }: Props) {
  const params = await searchParams
  return (
    <CuentaLoginForm
      nextPath={params.next}
      errorKey={params.error}
    />
  )
}
