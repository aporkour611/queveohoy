import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "../components/Logo";
import { pageMetadata } from "../lib/seo";

export const metadata: Metadata = pageMetadata(
  "/privacidad",
  "Política de privacidad",
  "Información sobre el tratamiento de datos personales, cuentas de usuario y favoritos en queveohoy.es."
);

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
          <p className="qvh-legal-updated">Última actualización: 26 de mayo de 2026</p>

          <section>
            <h2>Responsable</h2>
            <p>
              El sitio queveohoy.es es un proyecto informativo sobre eventos
              deportivos, e-sports y entretenimiento en televisión y plataformas
              de streaming. Para cuestiones relacionadas con tus datos personales
              puedes escribir a{" "}
              <a href="mailto:contacto@queveohoy.es">contacto@queveohoy.es</a>.
            </p>
          </section>

          <section>
            <h2>Datos que tratamos</h2>
            <p>
              <strong>Si navegas sin registrarte</strong>, podemos tratar datos
              técnicos habituales (dirección IP, tipo de dispositivo, páginas
              visitadas) a través del proveedor de alojamiento con fines de
              seguridad y estadísticas agregadas. Las preferencias de filtros,
              zona horaria y caché de favoritos se guardan en tu navegador; no
              identifican por sí solas a una persona concreta.
            </p>
            <p>
              <strong>Si creas una cuenta</strong>, tratamos:
            </p>
            <ul>
              <li>Correo electrónico (necesario para identificarte y acceder).</li>
              <li>
                Nombre de perfil (opcional al registrarte; se muestra en el
                saludo de la cuenta).
              </li>
              <li>
                Contraseña, almacenada de forma cifrada por nuestro proveedor de
                autenticación; queveohoy.es no la guarda en texto claro.
              </li>
              <li>
                Eventos marcados como favoritos, vinculados a tu cuenta para
                mostrarlos en Destacados y en la sección Favoritos.
              </li>
              <li>
                Fecha de alta y datos técnicos de la sesión necesarios para
                mantener el acceso seguro.
              </li>
            </ul>
          </section>

          <section>
            <h2>Finalidad y base legal</h2>
            <ul>
              <li>
                <strong>Gestionar tu cuenta</strong> — registro, inicio de
                sesión, cierre de sesión y acceso a favoritos. Base: ejecución
                de la relación cuando te registras y aceptas estas condiciones.
              </li>
              <li>
                <strong>Recordar preferencias</strong> — filtros, horario y
                caché local de favoritos. Base: interés legítimo en ofrecer una
                experiencia cómoda.
              </li>
              <li>
                <strong>Seguridad y funcionamiento</strong> — logs técnicos del
                hosting y prevención de abusos. Base: interés legítimo.
              </li>
              <li>
                <strong>Avisos internos de registro</strong> — el administrador
                del sitio puede recibir un correo automático cuando alguien crea
                una cuenta, con el nombre y el email indicados en el registro,
                únicamente para conocer el uso del servicio. Base: interés
                legítimo en la gestión del proyecto.
              </li>
            </ul>
          </section>

          <section>
            <h2>Encargados y transferencias</h2>
            <p>
              Utilizamos proveedores que tratan datos en nuestro nombre:
            </p>
            <ul>
              <li>
                <strong>Supabase</strong> — autenticación, perfiles y favoritos.
              </li>
              <li>
                <strong>Vercel</strong> — alojamiento y entrega del sitio.
              </li>
              <li>
                <strong>Resend</strong> — envío de correos técnicos (confirmación
                de cuenta y avisos internos al administrador), solo si está
                configurado.
              </li>
            </ul>
            <p>
              Estos proveedores pueden operar fuera del Espacio Económico Europeo.
              En ese caso, se aplican las garantías habituales de sus condiciones
              de servicio y cláusulas contractuales tipo.
            </p>
          </section>

          <section>
            <h2>Conservación</h2>
            <p>
              Los datos de cuenta y favoritos se conservan mientras mantengas el
              registro activo. Si eliminas la cuenta, se borran los datos
              vinculados en nuestros sistemas salvo obligación legal de
              conservación. Los datos técnicos del hosting se conservan el tiempo
              necesario para seguridad y estadísticas agregadas.
            </p>
          </section>

          <section>
            <h2>Tus derechos</h2>
            <p>
              Puedes acceder, rectificar o suprimir tus datos, limitar u oponerte
              a determinados tratamientos, y solicitar la portabilidad cuando
              corresponda. También puedes retirar el consentimiento cuando el
              tratamiento se base en él, sin afectar a lo ya realizado.
            </p>
            <p>
              Para ejercer estos derechos, escribe a{" "}
              <a href="mailto:contacto@queveohoy.es">contacto@queveohoy.es</a>{" "}
              indicando tu correo de registro. Tienes derecho a reclamar ante la
              Agencia Española de Protección de Datos (
              <a
                href="https://www.aepd.es"
                target="_blank"
                rel="noopener noreferrer"
              >
                aepd.es
              </a>
              ).
            </p>
          </section>

          <section>
            <h2>Cookies</h2>
            <p>
              Detalle de cookies y almacenamiento local en la{" "}
              <Link href="/cookies">política de cookies</Link>.
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
