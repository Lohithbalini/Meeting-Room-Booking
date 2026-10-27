export function SuccessMessage({ message }) {
  if (!message) return null;
  return (
    <div className="banner banner-success" role="status">
      {message}
    </div>
  );
}
