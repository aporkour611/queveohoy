import { createClient } from "../lib/supabase/server";

export const metadata = {
  title: "Mi cuenta — queveohoy.es",
};

export default async function CuentaResumenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, created_at")
    .eq("id", user!.id)
    .maybeSingle();

  const { count: favoritesCount } = await supabase
    .from("favorites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <>
      <h1>Resumen</h1>
      <p className="fh-auth-lead">
        Gestiona tu perfil, favoritos y preferencias de queveohoy.es.
      </p>

      <dl className="fh-account-details">
        <div>
          <dt>Correo</dt>
          <dd>{user?.email}</dd>
        </div>
        {memberSince ? (
          <div>
            <dt>Miembro desde</dt>
            <dd>{memberSince}</dd>
          </div>
        ) : null}
        <div>
          <dt>Favoritos guardados</dt>
          <dd>{favoritesCount ?? 0}</dd>
        </div>
      </dl>

      <div className="fh-account-soon">
        <h2>Consejo</h2>
        <p>
          Pulsa el corazón gris en los Destacados de la home para guardar
          eventos aquí en Favoritos.
        </p>
      </div>
    </>
  );
}
