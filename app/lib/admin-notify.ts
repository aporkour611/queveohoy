import { Resend } from "resend";

type NewSignupPayload = {
  email: string;
  displayName: string;
  confirmedImmediately: boolean;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSignupEmailHtml(payload: NewSignupPayload, site: string, when: string) {
  const name = escapeHtml(payload.displayName);
  const email = escapeHtml(payload.email);
  const status = payload.confirmedImmediately
    ? "Sesión activa al registrarse"
    : "Pendiente de confirmar correo";
  const statusColor = payload.confirmedImmediately ? "#22c55e" : "#f59e0b";
  const statusHint = payload.confirmedImmediately
    ? "El usuario ya puede usar la cuenta."
    : "Recibirá un enlace de confirmación en su correo.";

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Nuevo registro — queveohoy.es</title>
  </head>
  <body style="margin:0;padding:0;background:#0f0f10;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#e5e7eb;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0f0f10;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 20px;background:linear-gradient(135deg,#18181b 0%,#111827 100%);">
                <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#ef4444;font-weight:700;">
                  queveohoy.es
                </p>
                <h1 style="margin:0;font-size:24px;line-height:1.25;color:#ffffff;">
                  Nuevo registro
                </h1>
                <p style="margin:10px 0 0;font-size:15px;line-height:1.5;color:#a1a1aa;">
                  Alguien acaba de crear una cuenta en el sitio.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:8px 28px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 10px;">
                  <tr>
                    <td style="padding:14px 16px;background:#09090b;border:1px solid #27272a;border-radius:12px;">
                      <p style="margin:0 0 4px;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.06em;">Nombre</p>
                      <p style="margin:0;font-size:17px;color:#fafafa;font-weight:600;">${name}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:14px 16px;background:#09090b;border:1px solid #27272a;border-radius:12px;">
                      <p style="margin:0 0 4px;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.06em;">Correo</p>
                      <p style="margin:0;font-size:17px;color:#fafafa;font-weight:600;">${email}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:14px 16px;background:#09090b;border:1px solid #27272a;border-radius:12px;">
                      <p style="margin:0 0 4px;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.06em;">Estado</p>
                      <p style="margin:0 0 6px;font-size:16px;color:${statusColor};font-weight:600;">${status}</p>
                      <p style="margin:0;font-size:14px;line-height:1.5;color:#a1a1aa;">${statusHint}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:14px 16px;background:#09090b;border:1px solid #27272a;border-radius:12px;">
                      <p style="margin:0 0 4px;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.06em;">Fecha (Madrid)</p>
                      <p style="margin:0;font-size:16px;color:#fafafa;">${escapeHtml(when)}</p>
                    </td>
                  </tr>
                </table>

                <p style="margin:24px 0 0;text-align:center;">
                  <a href="${escapeHtml(site)}" style="display:inline-block;padding:12px 20px;background:#ef4444;color:#ffffff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:700;">
                    Abrir queveohoy.es
                  </a>
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 28px 24px;border-top:1px solid #27272a;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#71717a;text-align:center;">
                  Aviso automático interno · no respondas a este correo
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Aviso interno al administrador cuando alguien se registra (requiere Resend). */
export async function notifyAdminNewSignup(payload: NewSignupPayload) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.ADMIN_NOTIFY_EMAIL?.trim();
  const from = process.env.RESEND_FROM?.trim() || "onboarding@resend.dev";

  if (!apiKey || !to) return;

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://queveohoy.es";
  const when = new Date().toLocaleString("es-ES", {
    timeZone: "Europe/Madrid",
    dateStyle: "full",
    timeStyle: "short",
  });

  const resend = new Resend(apiKey);
  const subject = `Nuevo registro en queveohoy.es · ${payload.displayName}`;

  try {
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: from,
      subject,
      html: buildSignupEmailHtml(payload, site, when),
      text: [
        "Nuevo registro en queveohoy.es",
        "",
        `Nombre: ${payload.displayName}`,
        `Correo: ${payload.email}`,
        `Estado: ${
          payload.confirmedImmediately
            ? "Sesión activa al registrarse"
            : "Pendiente de confirmar correo"
        }`,
        `Fecha (Madrid): ${when}`,
        "",
        site,
      ].join("\n"),
    });

    if (error) {
      console.error("[admin-notify] Resend error", error);
    }
  } catch (error) {
    console.error("[admin-notify] send failed", error);
  }
}
