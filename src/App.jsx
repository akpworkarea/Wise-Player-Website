import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import PaymentRedirectHandler from "./pages/PaymentRedirectHandler";
import { Toaster } from "react-hot-toast";

import 'react-toastify/dist/ReactToastify.css';
function App() {
  const isMobile = window.innerWidth < 768;
  return (
    <Router>
    <Toaster
  position="top-right"
  toastOptions={{
    duration: 4000,
    style: {
      background: "#fff",
      color: "#dc2626",
      fontWeight: "700",
      fontSize: "14px",
      padding: "14px 18px",
      borderRadius: "12px",
      border: "1px solid #fecaca",
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.12)",
    },
    error: {
      style: {
        background: "#fef2f2",
        color: "#dc2626",
        fontWeight: "700",
        border: "1px solid #fca5a5",
      },
      iconTheme: {
        primary: "#dc2626",
        secondary: "#fff",
      },
    },
  }}
/>
      <PaymentRedirectHandler />
      <AppRoutes />
    </Router>
  );
}

export default App;