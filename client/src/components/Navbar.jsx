import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="navbar">
      <Link to="/rooms" className="navbar-brand">
        Meeting rooms
      </Link>
      <div className="navbar-user">
        <span>{user?.name}</span>
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
