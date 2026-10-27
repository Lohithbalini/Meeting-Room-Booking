import { useEffect, useState } from "react";
import { api } from "../api/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { MyBookingsSection } from "../components/MyBookingsSection";
import { RoomCard } from "../components/RoomCard";

export function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .rooms()
      .then((data) => setRooms(data.rooms))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading rooms..." />;

  return (
    <div className="rooms-layout">
      <section className="rooms-panel">
        <div className="page-heading">
          <h1>Rooms</h1>
        </div>
        <ErrorMessage message={error} />
        {!error && rooms.length === 0 ? <p>No rooms are available yet.</p> : null}
        <div className="room-grid">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </section>
      <MyBookingsSection />
    </div>
  );
}
