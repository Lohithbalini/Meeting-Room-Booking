import { useEffect, useState } from "react";
import { todayIst, nowIstMinutes, timeToMinutes } from "../utils/ist";

const EMPTY = {
  roomId: "",
  title: "",
  date: todayIst(),
  startTime: "09:00",
  endTime: "10:00",
};

export function BookingForm({ rooms, initialRoomId, initialDate, submitting, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    ...EMPTY,
    roomId: initialRoomId || "",
    date: initialDate || todayIst(),
  });
  const [error, setError] = useState("");

  useEffect(() => {
    setForm((current) => ({
      ...current,
      roomId: initialRoomId || current.roomId,
      date: initialDate || current.date,
    }));
  }, [initialRoomId, initialDate]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    if (!form.roomId) return "Please select a room.";
    if (!form.title.trim()) return "Title is required.";
    if (!form.date) return "Date is required.";
    if (!form.startTime || !form.endTime) return "Start and end times are required.";
    if (form.endTime <= form.startTime) return "End time must be later than start time.";
    if (form.startTime < "09:00") return "Start time must be at or after 09:00.";
    if (form.endTime > "19:00") return "End time must be at or before 19:00.";

    const today = todayIst();
    if (form.date < today) return "Bookings cannot be created in the past.";
    if (form.date === today && timeToMinutes(form.startTime) < nowIstMinutes()) {
      return "Bookings cannot be created in the past.";
    }
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    setError("");
    await onSubmit({
      roomId: form.roomId,
      title: form.title.trim(),
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
    });
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {error ? (
        <div className="banner banner-error" role="alert">
          {error}
        </div>
      ) : null}

      <label>
        Room
        <select value={form.roomId} onChange={(event) => update("roomId", event.target.value)} required>
          <option value="">Select a room</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name} (Floor {room.floor})
            </option>
          ))}
        </select>
      </label>

      <label>
        Title
        <input
          value={form.title}
          onChange={(event) => update("title", event.target.value)}
          required
        />
      </label>

      <label>
        Date
        <input type="date" value={form.date} onChange={(event) => update("date", event.target.value)} required />
      </label>

      <div className="form-row">
        <label>
          Start time
          <input type="time" value={form.startTime} onChange={(event) => update("startTime", event.target.value)} required />
        </label>
        <label>
          End time
          <input type="time" value={form.endTime} onChange={(event) => update("endTime", event.target.value)} required />
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="button-secondary" onClick={onCancel}>
          Back
        </button>
        <button type="submit" className="button-primary" disabled={submitting}>
          {submitting ? "Booking..." : "Book meeting"}
        </button>
      </div>
    </form>
  );
}
