"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      router.push("/applications");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-6">
      <div className="w-full max-w-sm">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl shadow-blue-900/20 border border-white/20 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-sm text-blue-100 mt-1">Log in to your Job Tracker</p>
          </div>

          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-sm text-white placeholder:text-blue-100/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-sm text-white placeholder:text-blue-100/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all"
            />

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 bg-white text-blue-700 rounded-xl font-medium hover:bg-blue-50 hover:shadow-lg hover:shadow-black/10 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>

            {error && <p className="text-sm text-red-200 text-center">{error}</p>}
          </div>
        </div>

        <p className="text-sm text-blue-100 text-center mt-6">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-white hover:underline font-medium">
            Register
          </a>
        </p>
      </div>
    </main>
  );
}