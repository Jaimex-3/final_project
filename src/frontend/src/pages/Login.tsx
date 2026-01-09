import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 w-full max-w-md text-white space-y-4 shadow-xl"
      >
        <h1 className="text-2xl font-semibold text-center">Exam Security</h1>
        {error && <div className="text-red-200 text-sm">{error}</div>}
        <div>
          <label className="text-sm text-slate-200">Email</label>
          <input
            className="w-full mt-1 px-3 py-2 rounded bg-white/20 border border-white/10 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </div>
        <div>
          <label className="text-sm text-slate-200">Password</label>
          <input
            className="w-full mt-1 px-3 py-2 rounded bg-white/20 border border-white/10 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
