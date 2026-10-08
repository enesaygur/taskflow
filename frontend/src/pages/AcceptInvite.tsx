import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../api/axios";

function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Invalid invite link");
      return;
    }

    if (!accessToken) {
      setStatus("error");
      setError("You are not logged in");
      return;
    }

    api
      .post("/invites/accept", { token })
      .then(() => {
        setStatus("success");
        setTimeout(() => navigate("/"), 2000);
      })
      .catch((err) => {
        setStatus("error");
        setError(err.response?.data?.error || "Could not accept invite");
      });
  }, [token, accessToken]);

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border border-line rounded text-center">
      {status === "loading" && (
        <p className="text-muted">Joining organization…</p>
      )}

      {status === "success" && (
        <p className="text-accent">
          You've joined the organization! Redirecting…
        </p>
      )}

      {status === "error" && error === "not-logged-in" && (
        <div>
          <p className="text-muted mb-3">
            Please log in or create an account first, then click the invite link
            again.
          </p>
          <Link to="/login" className="text-accent text-sm">
            Go to login
          </Link>
        </div>
      )}

      {status === "error" && error !== "not-logged-in" && (
        <p className="text-red-600">{error}</p>
      )}
    </div>
  );
}

export default AcceptInvite;
