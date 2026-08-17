const API_BASE_URL = import.meta.env.VITE_DASHBOARD_API_BASE_URL || "";

async function request(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error("Dashboard API base URL is not configured.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Dashboard API request failed: ${response.status}`);
  }

  return response.json();
}

export const dashboardApi = {
  getOwnerSummary() {
    return request("/owner/summary");
  },
  getPortfolio() {
    return request("/owner/portfolio");
  },
  getEcosystemAccess() {
    return request("/owner/ecosystem-access");
  },
  getWalletSession() {
    return request("/wallet/session");
  },
};
