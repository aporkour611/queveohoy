export default function Page() {
  return (
    <main className="fh-body">
      <div className="fh-content">
        <div className="fh-container fh-main" style={{ padding: "2rem 0" }}>
          <h1 className="fh-page-title">Qué ver hoy en TV y streaming</h1>
          <p className="fh-page-lead">
            Estamos restaurando la agenda. Mientras tanto puedes ver los
            partidos en{" "}
            <a href="/partidos-hoy" style={{ color: "#0d6efd" }}>
              partidos de hoy
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
