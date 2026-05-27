import Link from "next/link";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const showError = error === "1";

  return (
    <main className="p-6 text-white bg-black min-h-screen">
      <div className="max-w-md">
        <h1 className="text-3xl font-bold mb-2">Admin queveohoy</h1>
        <p className="mb-6 text-sm text-neutral-400">
          Acceso restringido. La clave no viaja en la URL.
        </p>

        {showError ? (
          <p
            className="mb-4 rounded border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-200"
            role="alert"
          >
            Clave incorrecta. Revisa ADMIN_SECRET e inténtalo de nuevo.
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
            />
          </label>

          <button
            type="submit"
            className="bg-[#5d5fef] p-2 rounded font-semibold hover:bg-[#7476ff]"
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
