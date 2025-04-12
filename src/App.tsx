
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import Permissions from "./pages/Permissions";
import Tokens from "./pages/Tokens";
import Files from "./pages/Files";
import Notifications from "./pages/Notifications";
import Configuration from "./pages/Configuration";
import FeatureFlags from "./pages/FeatureFlags";
import AuditLog from "./pages/AuditLog";
import UserRequestLog from "./pages/UserRequestLog";
import EventLog from "./pages/EventLog";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/users" element={<Users />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/permissions" element={<Permissions />} />
          <Route path="/tokens" element={<Tokens />} />
          <Route path="/files" element={<Files />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/configuration" element={<Configuration />} />
          <Route path="/feature-flags" element={<FeatureFlags />} />
          <Route path="/audit-log" element={<AuditLog />} />
          <Route path="/user-request-log" element={<UserRequestLog />} />
          <Route path="/event-log" element={<EventLog />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
