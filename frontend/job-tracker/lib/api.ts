const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// types
export type Application = {
  id: string;
  companyName: string;
  roleTitle: string;
  status: string;
  jobUrl?: string;
  location?: string;
  workType?: string;
  createdAt: string;
};


// auth
export async function registerUser(name: string, email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "registration failed");
  }

  return data;
}

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "login failed");
  }

  return data; // { success, accessToken, refreshToken }
}

//  applications 
// every func needs the access token to authenticate the request

export async function getApplications(accessToken: string): Promise<Application[]> {
  const response = await fetch(`${API_URL}/applications`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "failed to fetch applications");
  }

  return data.applications;
}

export async function createApplication(
  accessToken: string,
  application: { companyName: string; roleTitle: string; status?: string }
) {
  const response = await fetch(`${API_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(application),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "failed to create application");
  }

  return data.application;
}

export async function updateApplicationStatus(
  accessToken: string,
  id: string,
  status: string
) {
  const response = await fetch(`${API_URL}/applications/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "failed to update application");
  }

  return data.application;
}

export async function deleteApplication(accessToken: string, id: string) {
  const response = await fetch(`${API_URL}/applications/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "failed to delete application");
  }

  return data;
}