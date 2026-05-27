import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAdminConfigured, isAdminCookieValid } from "@/app/lib/admin-auth";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  "1": "Clave incorrecta. Debe coincidir exactamente con ADMIN_SECRET en Vercel (no uses CRON_SECRET).",
  "2": "ADMIN_SECRET no está configurado en producción. Añádelo en Vercel → Environment Variables → Production y redeploy.",
  "3": "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const jar = await cookies();
  if (isAdminCookieValid(jar.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin");
  }

  const { error } = await searchParams;
  const configured = isAdminConfigured();
  const errorMessage = error ? ERROR_MESSAGES[error] : null;

  return (
    <main className="p-6 text-white bg-black min-h-screen">
      <div className="max-w-md">
        <h1 className="text-3xl font-bold mb-2">Admin queveohoy</h1>
        <p className="mb-6 text-sm text-neutral-400">
          Acceso restringido. La clave es el valor de{" "}
          <code className="text-neutral-300">ADMIN_SECRET</code> en Vercel.
        </p>

        {!configured ? (
          <p
            className="mb-4 rounded border border-amber-800 bg-amber-950/40 px-3 py-2 text-sm text-amber-100"
            role="alert"
          >
            El servidor no tiene ADMIN_SECRET. Configúralo en Vercel (entorno
            Production) y vuelve a desplegar.
          </p>
        ) : null}

        {errorMessage ? (
          <p
            className="mb-4 rounded border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-200"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        <form
          action="/api/admin/login"
          method="post"
          className="flex flex-col gap-3"
        >
          <label className="flex flex-col gap-1 text-sm">
            <span>Clave de administrador</span>
            <input
              type="password"
              name="secret"
              required
              autoComplete="current-password"
              className="p-2 text-black rounded"
              disabled={!configured}
            />
          </label>

          <button
            type="submit"
            className="bg-[#5d5fef] p-2 rounded font-semibold hover:bg-[#7476ff] disabled:opacity-50"
            disabled={!configured}
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-sm text-neutral-500">
          <Link href="/" className="underline hover:text-neutral-300">
            Volver al inicio
          </Link>
        </p>
      </div>
    </main>
  );
}
