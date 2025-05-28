
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { initAppServices } from "@/utils/initAppServices";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { KeycloakProvider } from "@/contexts/KeycloakContext";

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

// Keycloak configuration - these should be set as environment variables
const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'master',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'admin-console',
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <KeycloakProvider config={keycloakConfig}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <App />
          <Toaster />
        </ThemeProvider>
      </KeycloakProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
