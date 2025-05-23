import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";
import "@/styles/tailwind.css";
// This file is the entry point for your React application. It imports the necessary modules and styles, and renders the main App component into the root element of the HTML document.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
