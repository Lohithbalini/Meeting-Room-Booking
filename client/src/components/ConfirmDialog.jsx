export function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="dialog-backdrop" role="presentation">
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h3 id="confirm-title">{title}</h3>
        <p>{message}</p>
        <div className="dialog-actions">
          <button type="button" className="button-secondary" onClick={onCancel}>
            No
          </button>
          <button type="button" className="button-danger" onClick={onConfirm}>
            Yes, cancel
          </button>
        </div>
      </div>
    </div>
  );
}
