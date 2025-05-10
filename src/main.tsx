
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { initAppServices } from "@/utils/initAppServices";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// Add a global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Initialize services with proper error handling
try {
  initAppServices();
} catch (error) {
  console.error('Failed to initialize app services:', error);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <App />
        <Toaster />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
