import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./../api/axios";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/auth/register", {
        email,
        password,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };
  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 border rounded">
        <p>Kayıt başarılı! E-postanızı doğrulayın, sonra giriş yapın.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 bg-blue-600 text-white p-2 rounded"
        >
          Go to login
        </button>
      </div>
    );
  }
  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input 
        type="email"
        placeholder="E-posta"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded"
        required
        />
        <input
          type="password"
          placeholder="Sifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
