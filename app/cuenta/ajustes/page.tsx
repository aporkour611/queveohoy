export const metadata = {
  title: "Ajustes — queveohoy.es",
};

export default function CuentaAjustesPage() {
  return (
    <>
      <h1>Ajustes</h1>
      <p className="fh-auth-lead">
        Preferencias de tu cuenta. Más opciones llegarán pronto.
      </p>

      <div className="fh-settings-block">
        <h2>Zona horaria</h2>
        <p>
          El huso horario (España, Canarias o LATAM) se guarda en tu
          navegador. Cámbialo desde el selector de la barra superior en la
          home.
        </p>
      </div>

      <div className="fh-settings-block">
        <h2>Notificaciones</h2>
        <p className="fh-settings-muted">Próximamente.</p>
      </div>
    </>
  );
}
