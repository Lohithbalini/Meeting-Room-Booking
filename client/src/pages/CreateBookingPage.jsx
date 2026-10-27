import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { BookingForm } from "../components/BookingForm";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { SuccessMessage } from "../components/SuccessMessage";

export function CreateBookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialRoomId = searchParams.get("roomId") || "";
  const initialDate = searchParams.get("date") || "";

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api
      .rooms()
      .then((data) => setRooms(data.rooms))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const data = await api.createBooking(payload);
      const booking = data.booking;
      setSuccess(
        `Booked ${booking.room.name}: ${booking.title} on ${booking.date} from ${booking.startTime} to ${booking.endTime}.`
      );
      setTimeout(() => {
        navigate(`/rooms/${booking.room.id}/schedule`);
      }, 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading rooms..." />;

  return (
    <section className="narrow">
      <div className="page-heading">
        <h1>Book a room</h1>
      </div>
      <ErrorMessage message={error} />
      <SuccessMessage message={success} />
      <BookingForm
        rooms={rooms}
        initialRoomId={initialRoomId}
        initialDate={initialDate}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
      />
    </section>
  );
}
