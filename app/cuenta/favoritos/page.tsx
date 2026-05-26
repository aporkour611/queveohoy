import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import { displayTime } from "../../lib/madrid-time";
import type { EventRow } from "../../components/types";

export const metadata = {
  title: "Favoritos — queveohoy.es",
};

export default async function CuentaFavoritosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("favorites")
    .select("created_at, events(*)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const events = (rows ?? [])
    .map((row) => row.events as unknown as EventRow | null)
    .filter((event): event is EventRow => Boolean(event?.id));

  return (
    <>
      <h1>Favoritos</h1>
      <p className="fh-auth-lead">
        Eventos que has marcado desde Destacados en la home.
      </p>

      {events.length === 0 ? (
        <div className="fh-account-empty">
          <p>Aún no tienes favoritos.</p>
          <p className="fh-account-empty-hint">
            Busca el corazón gris arriba a la derecha en un Destacado y pulsa
            para guardarlo.
          </p>
          <Link href="/" className="fh-btn fh-btn-primary">
            Ir a Destacados
          </Link>
        </div>
      ) : (
        <ul className="fh-fav-list">
          {events.map((event) => (
            <li key={event.id} className="fh-fav-list-item">
              <div className="fh-fav-list-main">
                <strong>{event.title ?? "Evento"}</strong>
                <span>
                  {event.competition ?? event.sport ?? "Evento"}
                  {event.date ? ` · ${event.date}` : ""}
                  {event.time ? ` · ${displayTime(event.time)}` : ""}
                </span>
              </div>
              <span className="fh-fav-list-heart" aria-hidden>
                ♥
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
