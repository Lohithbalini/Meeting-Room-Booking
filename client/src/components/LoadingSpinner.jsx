export function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="status-block" role="status">
      <div className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}
