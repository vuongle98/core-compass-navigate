import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MiniToastContainer } from "@/components/ui/mini-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Users from "./pages/Users";
import UserAccountSettings from "./pages/UserAccountSettings";
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
import Bots from "./pages/Bots";
import BotEdit from "./pages/BotEdit";
import BotSchedule from "./pages/BotSchedule";
import Blogs from "./pages/Blog/Blogs";
import BlogNew from "./pages/Blog/BlogNew";
import BlogEdit from "./pages/Blog/BlogEdit";
import BlogDetail from "./pages/Blog/BlogDetail";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ChatButton from "./components/chat/ChatButton";
import { useFeatureFlag } from "./hooks/use-feature-flag";
import EndpointSecures from "./pages/EndpointSecure";
import ServiceManagement from "./pages/ServiceManagement";
import { Sidebar } from "./components/layout/sidebar/Sidebar";

// Create a protected route component using our new useAuth hook
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Component to conditionally render the chat button
const ChatButtonWrapper = () => {
  const isChatEnabled = useFeatureFlag("chat_system");

  if (!isChatEnabled) {
    return null;
  }

  return <ChatButton />;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <MiniToastContainer />
            <Router>
              <div className="flex min-h-screen">
                {/* Sidebar */}
                <ProtectedRoute>
                  <Sidebar />
                </ProtectedRoute>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Index />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/users"
                      element={
                        <ProtectedRoute>
                          <Users />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/account-settings"
                      element={
                        <ProtectedRoute>
                          <UserAccountSettings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/roles"
                      element={
                        <ProtectedRoute>
                          <Roles />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/permissions"
                      element={
                        <ProtectedRoute>
                          <Permissions />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/tokens"
                      element={
                        <ProtectedRoute>
                          <Tokens />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/files"
                      element={
                        <ProtectedRoute>
                          <Files />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/notifications"
                      element={
                        <ProtectedRoute>
                          <Notifications />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/configuration"
                      element={
                        <ProtectedRoute>
                          <Configuration />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/endpoint-secure"
                      element={
                        <ProtectedRoute>
                          <EndpointSecures />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/feature-flags"
                      element={
                        <ProtectedRoute>
                          <FeatureFlags />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/audit-log"
                      element={
                        <ProtectedRoute>
                          <AuditLog />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/user-request-log"
                      element={
                        <ProtectedRoute>
                          <UserRequestLog />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/event-log"
                      element={
                        <ProtectedRoute>
                          <EventLog />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/bots"
                      element={
                        <ProtectedRoute>
                          <Bots />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/bots/:id/edit"
                      element={
                        <ProtectedRoute>
                          <BotEdit />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/bots/:id/schedule"
                      element={
                        <ProtectedRoute>
                          <BotSchedule />
                        </ProtectedRoute>
                      }
                    />
                    {/* Blog routes */}
                    <Route
                      path="/blogs"
                      element={
                        <ProtectedRoute>
                          <Blogs />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/blogs/new"
                      element={
                        <ProtectedRoute>
                          <BlogNew />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/blogs/:id/edit"
                      element={
                        <ProtectedRoute>
                          <BlogEdit />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/blogs/:id"
                      element={
                        <ProtectedRoute>
                          <BlogDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/services"
                      element={
                        <ProtectedRoute>
                          <ServiceManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>

                  {/* ChatButton is conditionally rendered based on feature flag */}
                  <ProtectedRoute>
                    <ChatButtonWrapper />
                  </ProtectedRoute>
                </main>
              </div>
            </Router>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
