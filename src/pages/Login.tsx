
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useKeycloak } from "@/contexts/KeycloakContext";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: keycloakLoading, initializationFailed } = useKeycloak();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleKeycloakLogin = async () => {
    setIsLoading(true);
    try {
      await login();
    } catch (error) {
      console.error("Keycloak login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevelopmentMode = () => {
    // In development mode, just navigate to the main app
    navigate("/");
  };

  if (keycloakLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Initializing authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Login</CardTitle>
          <CardDescription className="text-center">
            {initializationFailed 
              ? "Authentication service is currently unavailable"
              : "Sign in to your account using Keycloak"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {initializationFailed && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Keycloak authentication is not available. This might be because:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Keycloak server is not running</li>
                  <li>Configuration is incorrect</li>
                  <li>Network connectivity issues</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {!initializationFailed ? (
            <Button 
              onClick={handleKeycloakLogin} 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in with Keycloak"
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleDevelopmentMode} 
              className="w-full" 
              variant="outline"
            >
              Continue in Development Mode
            </Button>
          )}
          
          {initializationFailed && (
            <div className="text-sm text-muted-foreground text-center">
              <p>Expected Keycloak configuration:</p>
              <ul className="text-xs mt-1">
                <li>URL: http://localhost:8080</li>
                <li>Realm: master (or your realm name)</li>
                <li>Client ID: account (or your client ID)</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
