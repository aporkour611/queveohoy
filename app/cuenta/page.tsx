import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPageShell } from "../components/AuthPageShell";
import { signOutAction } from "../lib/auth-actions";
import { createClient } from "../lib/supabase/server";

export const metadata = {
  title: "Mi cuenta — queveohoy.es",
};

export default async function CuentaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar?next=/cuenta");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.display_name ??
    user.user_metadata?.display_name ??
    user.email?.split("@")[0] ??
    "Usuario";

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <AuthPageShell title="Mi cuenta">
      <div className="fh-account-panel">
        <p className="fh-account-greeting">Hola, {displayName}</p>
        <dl className="fh-account-details">
          <div>
            <dt>Correo</dt>
            <dd>{user.email}</dd>
          </div>
          {memberSince ? (
            <div>
              <dt>Miembro desde</dt>
              <dd>{memberSince}</dd>
            </div>
          ) : null}
        </dl>

        <div className="fh-account-soon">
          <h2>Próximamente</h2>
          <p>
            Aquí podrás marcar partidos, series y eventos como favoritos y
            interactuar con tu contenido.
          </p>
        </div>

        <div className="fh-account-actions">
          <Link href="/" className="fh-btn">
            Ver eventos de hoy
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="fh-btn fh-btn-ghost">
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </AuthPageShell>
  );
}
