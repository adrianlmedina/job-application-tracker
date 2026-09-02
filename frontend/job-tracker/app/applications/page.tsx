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

export default function ApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // form state for adding a new application
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // runs once when the page first loads
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("/login");
      return;
    }

    loadApplications(token);
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
      setApplications((prev) => [...prev, newApp]);
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
      // replace  old version of this application with the updated one
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? updated : app))
      );
    } catch (err) {
      setError("Failed to update status.");
    }
  }

  async function handleDelete(id: string) {

    const token = localStorage.getItem("accessToken");

    if (!token) return;

    try {
      await deleteApplication(token, id);
      // remove the deleted application from local state
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
        
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Loading your applications...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Job Applications</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Log out
          </button>
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        {/* Add new application form */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-8">
          <h2 className="font-medium mb-3">Add a new application</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Role title"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddApplication}
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        {/* Applications list */}
        {applications.length === 0 ? (
          <p className="text-gray-400 text-center mt-16">
            No applications yet. Add your first one above.
          </p>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{app.companyName}</p>
                  <p className="text-sm text-gray-500">{app.roleTitle}</p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status.replace("_", " ")}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleDelete(app.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Delete
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