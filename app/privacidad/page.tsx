import Link from "next/link";
import { Logo } from "../components/Logo";

export const metadata = {
  title: "Política de privacidad — queveohoy.es",
};

export default function PrivacidadPage() {
  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo />
        </div>
      </nav>
      <main className="qvh-legal-page">
        <div className="fh-container">
          <h1>Política de privacidad</h1>
          <p className="qvh-legal-updated">Última actualización: mayo de 2026</p>

          <section>
            <h2>Responsable</h2>
            <p>
              El sitio queveohoy.es es un proyecto informativo sobre eventos
              deportivos, e-sports y entretenimiento en televisión y plataformas
              de streaming.
            </p>
          </section>

          <section>
            <h2>Datos que tratamos</h2>
            <p>
              Esta web no solicita registro ni recoge datos personales mediante
              formularios. Podemos registrar datos técnicos habituales de
              navegación (dirección IP, tipo de dispositivo, páginas visitadas)
              a través del proveedor de alojamiento con fines de seguridad y
              estadísticas agregadas.
            </p>
            <p>
              Los filtros de categoría que elijas se guardan en tu navegador
              (almacenamiento local) para recordar tu preferencia en visitas
              posteriores.
            </p>
          </section>

          <section>
            <h2>Finalidad y base legal</h2>
            <p>
              El tratamiento se limita a permitir el funcionamiento del sitio,
              mejorar su rendimiento y mantener preferencias de visualización,
              sobre la base del interés legítimo en ofrecer un servicio
              informativo accesible.
            </p>
          </section>

          <section>
            <h2>Conservación y derechos</h2>
            <p>
              Los datos técnicos se conservan durante el tiempo necesario para
              las finalidades indicadas. Puedes borrar las preferencias
              guardadas en tu navegador en cualquier momento. Para ejercer
              derechos de acceso, rectificación o supresión sobre datos que
              pudieran existir en los registros del hosting, escribe a través de
              los canales de contacto publicados en el sitio.
            </p>
          </section>

          <p className="qvh-legal-back">
            <Link href="/">← Volver al inicio</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
