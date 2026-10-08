import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    logout();
    navigate("/login");
  };
  return (
    <header className="border-b border-line">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-semibold tracking-tight">
          TaskFlow
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm text-muted hover:text-ink"
        >
          Log out
        </button>
      </div>
    </header>
  );
}

export default Navbar;
