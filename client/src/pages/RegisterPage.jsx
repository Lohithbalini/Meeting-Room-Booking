import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ErrorMessage } from "../components/ErrorMessage";
import { PasswordInput } from "../components/PasswordInput";
import { isValidEmail } from "../utils/ist";

export function RegisterPage() {
  const { user, loginWithResponse } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/rooms" replace />;
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Name, email, and password are required.");
      return;
    }
    if (!isValidEmail(form.email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must contain at least six characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await api.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      await loginWithResponse(data);
      navigate("/rooms", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>Book a meeting room</h1>
        <p className="muted">Create an account to reserve a room.</p>
        <ErrorMessage message={error} />
        <form className="form" onSubmit={handleSubmit} noValidate>
          <label>
            Name
            <input value={form.name} onChange={(event) => update("name", event.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required />
          </label>
          <label>
            Password
            <PasswordInput
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
              required
              autoComplete="new-password"
            />
          </label>
          <label>
            Confirm password
            <PasswordInput
              value={form.confirmPassword}
              onChange={(event) => update("confirmPassword", event.target.value)}
              required
              autoComplete="new-password"
            />
          </label>
          <button type="submit" className="button-primary" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
        <p>
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
