export function LoadingState({ label = "Cargando eventos..." }: { label?: string }) {
  return (
    <div className="fh-empty fh-loading">
      <div className="qvh-spinner" aria-hidden />
      <p>{label}</p>
    </div>
  );
}
