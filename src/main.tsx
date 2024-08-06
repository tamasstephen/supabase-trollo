import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Routes } from "./routes/routes";
import { AuthContextProvider } from "./components/context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthContextProvider>
      <Routes />
    </AuthContextProvider>
  </React.StrictMode>
);
