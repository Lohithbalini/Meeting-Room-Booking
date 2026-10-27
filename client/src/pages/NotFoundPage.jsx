import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="auth-page">
      <div className="card auth-card">
        <h1>Page not found</h1>
        <p>That page does not exist.</p>
        <Link className="button-primary" to="/rooms">
          Go to rooms
        </Link>
      </div>
    </section>
  );
}
