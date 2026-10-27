import { useEffect, useState } from "react";
import { api } from "../api/client";
import { BookingCard } from "./BookingCard";
import { ConfirmDialog } from "./ConfirmDialog";
import { ErrorMessage } from "./ErrorMessage";
import { LoadingSpinner } from "./LoadingSpinner";
import { SuccessMessage } from "./SuccessMessage";

export function MyBookingsSection() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(null);

  async function loadBookings() {
    setLoading(true);
    setError("");
    try {
      const data = await api.myBookings();
      setBookings(data.bookings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function confirmCancel() {
    if (!pending) return;
    try {
      await api.cancelBooking(pending.id);
      setSuccess("Booking cancelled.");
      setPending(null);
      await loadBookings();
    } catch (err) {
      setError(err.message);
      setPending(null);
    }
  }

  return (
    <section id="my-bookings" className="my-bookings">
      <div className="page-heading">
        <h2>My bookings</h2>
      </div>
      {loading ? <LoadingSpinner label="Loading your bookings..." /> : null}
      <ErrorMessage message={error} />
      <SuccessMessage message={success} />
      {!loading && !error && bookings.length === 0 ? <p>You have no upcoming bookings.</p> : null}
      <div className="stack">
        {bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} onCancel={setPending} />
        ))}
      </div>
      <ConfirmDialog
        open={Boolean(pending)}
        title="Are you sure you want to cancel this booking?"
        message={pending ? `Cancel "${pending.title}" on ${pending.date}?` : ""}
        onCancel={() => setPending(null)}
        onConfirm={confirmCancel}
      />
    </section>
  );
}
