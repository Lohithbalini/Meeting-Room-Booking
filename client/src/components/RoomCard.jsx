import { Link } from "react-router-dom";

export function RoomCard({ room }) {
  return (
    <article className="card room-card">
      <h3>{room.name}</h3>
      <p>
        Floor {room.floor} · {room.capacity} people
      </p>
      <div className="card-actions">
        <Link className="button-secondary" to={`/rooms/${room.id}/schedule`}>
          View schedule
        </Link>
        <Link className="button-primary" to={`/bookings/new?roomId=${room.id}`}>
          Book
        </Link>
      </div>
    </article>
  );
}
