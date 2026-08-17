import { useLayoutEffect } from "react";
import dashboardMarkup from "./dashboard/dashboardMarkup.js";
import { initializeDashboard } from "./dashboard/initializeDashboard.js";

export default function App() {
  useLayoutEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;

    root.innerHTML = dashboardMarkup;
    initializeDashboard();
  }, []);

  return null;
}
