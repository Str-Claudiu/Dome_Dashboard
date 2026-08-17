import { useEffect } from "react";
import dashboardMarkup from "./dashboard/dashboardMarkup.js";
import { initializeDashboard } from "./dashboard/initializeDashboard.js";

export default function App() {
  useEffect(() => {
    initializeDashboard();
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: dashboardMarkup }} />;
}
