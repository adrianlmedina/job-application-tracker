"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
  Application,
} from "@/lib/api";

const STATUS_OPTIONS = [
  "WISHLIST",
  "APPLIED",
  "PHONE_SCREEN",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
];

const STATUS_STYLES: Record<string, string> = {
  WISHLIST: "bg-gray-100 text-gray-600",
  APPLIED: "bg-blue-100 text-blue-700",
  PHONE_SCREEN: "bg-purple-100 text-purple-700",
  INTERVIEW: "bg-amber-100 text-amber-700",
  OFFER: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-600",
  WITHDRAWN: "bg-gray-100 text-gray-500",
};

export default function ApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
    loadApplications(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadApplications(token: string) {
    try {
      const apps = await getApplications(token);
      setApplications(apps);
    } catch (err) {
      setError("Failed to load applications. Try logging in again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddApplication() {
    const token = localStorage.getItem("accessToken");
    if (!token || !companyName.trim() || !roleTitle.trim()) return;

    setSubmitting(true);
    try {
      const newApp = await createApplication(token, { companyName, roleTitle });
      setApplications((prev) => [newApp, ...prev]);
      setCompanyName("");
      setRoleTitle("");
    } catch (err) {
      setError("Failed to add application.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const updated = await updateApplicationStatus(token, id, newStatus);
      setApplications((prev) => prev.map((app) => (app.id === id ? updated : app)));
    } catch (err) {
      setError("Failed to update status.");
    }
  }

  async function handleDelete(id: string) {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      await deleteApplication(token, id);
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (err) {
      setError("Failed to delete application.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading your applications...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Job Applications
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {applications.length} {applications.length === 1 ? "application" : "applications"} tracked
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-900 font-medium px-4 py-2 rounded-full hover:bg-white hover:shadow-sm transition-all"
          >
            Log out
          </button>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Add new application form */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm shadow-slate-200/50 border border-slate-100">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
            Add a new application
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all"
            />
            <input
              type="text"
              placeholder="Role title"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all"
            />
            <button
              onClick={handleAddApplication}
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:hover:shadow-none transition-all active:scale-95"
            >
              {submitting ? "Adding..." : "Add"}
            </button>
          </div>
        </div>

        {/* Applications list */}
        {applications.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-400">No applications yet. Add your first one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="group bg-white rounded-xl p-5 flex justify-between items-center shadow-sm shadow-slate-200/50 border border-slate-100 hover:shadow-md hover:shadow-slate-200/70 hover:-translate-y-0.5 transition-all"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{app.companyName}</p>
                  <p className="text-sm text-gray-500 truncate">{app.roleTitle}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className={`text-xs font-medium rounded-full px-3 py-1.5 border-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-colors ${STATUS_STYLES[app.status] || "bg-gray-100 text-gray-600"}`}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status.replace("_", " ")}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleDelete(app.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none px-1"
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}