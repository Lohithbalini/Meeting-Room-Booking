export function BookingCard({ booking, onCancel, showRoom = true }) {
  return (
    <article className="card booking-card">
      <div>
        <h3>{booking.title}</h3>
        {showRoom && booking.room?.name ? <p>{booking.room.name}</p> : null}
        <p>
          {booking.date} · {booking.startTime} – {booking.endTime}
        </p>
        {booking.bookedBy?.name ? <p>Booked by {booking.bookedBy.name}</p> : null}
      </div>
      {onCancel ? (
        <button type="button" className="button-danger" onClick={() => onCancel(booking)}>
          Cancel
        </button>
      ) : null}
    </article>
  );
}
