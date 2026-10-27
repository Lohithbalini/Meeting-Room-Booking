import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { BookingCard } from "../components/BookingCard";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { todayIst } from "../utils/ist";

export function RoomSchedulePage() {
  const { roomId } = useParams();
  const [date, setDate] = useState(todayIst());
  const [room, setRoom] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .roomBookings(roomId, date)
      .then((data) => {
        if (cancelled) return;
        setRoom(data.room);
        setBookings(data.bookings);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [roomId, date]);

  return (
    <section>
      <Link to="/rooms" className="back-link">
        ← Back to rooms
      </Link>
      <div className="page-heading">
        <div>
          <h1>{room ? room.name : "Room schedule"}</h1>
          {room ? (
            <p className="muted">
              Floor {room.floor} · {room.capacity} people
            </p>
          ) : null}
        </div>
        <Link className="button-primary" to={`/bookings/new?roomId=${roomId}&date=${date}`}>
          Book
        </Link>
      </div>

      <label className="inline-field">
        Date
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>

      <ErrorMessage message={error} />
      {loading ? <LoadingSpinner label="Loading schedule..." /> : null}
      {!loading && !error && bookings.length === 0 ? <p>No bookings for this day</p> : null}
      <div className="stack">
        {bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} showRoom={false} />
        ))}
      </div>
    </section>
  );
}
