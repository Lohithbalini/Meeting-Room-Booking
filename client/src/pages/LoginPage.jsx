import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ErrorMessage } from "../components/ErrorMessage";
import { PasswordInput } from "../components/PasswordInput";
import { isValidEmail } from "../utils/ist";

export function LoginPage() {
  const { user, loginWithResponse } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/rooms" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await api.login({ email: email.trim(), password });
      await loginWithResponse(data);
      navigate("/rooms", { replace: true });
    } catch (err) {
      if (err.code === "USER_NOT_FOUND") {
        setError("Please register to login.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>Book a meeting room</h1>
        <p className="muted">Login to reserve a room for your meeting.</p>
        {error === "Please register to login." ? (
          <div className="banner banner-error" role="alert">
            Please register to login. <Link to="/register">Register</Link>
          </div>
        ) : (
          <ErrorMessage message={error} />
        )}
        <form className="form" onSubmit={handleSubmit} noValidate>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Password
            <PasswordInput
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="button-primary" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        <p>
          Need an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
