
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type AlertSeverity = "error" | "warning" | "info" | "success";

interface SystemAlert {
  id: number;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  source: string;
}

interface SystemAlertsWidgetProps {
  className?: string;
}

export function SystemAlertsWidget({ className }: SystemAlertsWidgetProps) {
  const [enabledTypes, setEnabledTypes] = useState<Record<AlertSeverity, boolean>>({
    error: true,
    warning: true,
    info: true,
    success: true
  });
  
  // In a real app, this would come from an API
  const allAlerts: SystemAlert[] = [
    {
      id: 1,
      severity: "error",
      message: "Database connection failed",
      timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
      source: "Database Server",
    },
    {
      id: 2,
      severity: "warning",
      message: "High CPU usage detected",
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
      source: "Monitoring Service",
    },
    {
      id: 3,
      severity: "info",
      message: "Daily backup completed",
      timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
      source: "Backup Service",
    },
    {
      id: 4,
      severity: "success",
      message: "System update successfully applied",
      timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
      source: "Update Service",
    },
  ];
  
  const filteredAlerts = allAlerts.filter(alert => enabledTypes[alert.severity]);

  function getSeverityIcon(severity: AlertSeverity) {
    switch (severity) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  }

  function getSeverityColor(severity: AlertSeverity) {
    switch (severity) {
      case "error": return "text-red-500 border-red-200 bg-red-50";
      case "warning": return "text-amber-500 border-amber-200 bg-amber-50";
      case "info": return "text-blue-500 border-blue-200 bg-blue-50";
      case "success": return "text-green-500 border-green-200 bg-green-50";
    }
  }

  function formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>System Alerts</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">Filter</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={enabledTypes.error}
              onCheckedChange={(checked) => 
                setEnabledTypes(prev => ({ ...prev, error: !!checked }))
              }
            >
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              Errors
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={enabledTypes.warning}
              onCheckedChange={(checked) => 
                setEnabledTypes(prev => ({ ...prev, warning: !!checked }))
              }
            >
              <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
              Warnings
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={enabledTypes.info}
              onCheckedChange={(checked) => 
                setEnabledTypes(prev => ({ ...prev, info: !!checked }))
              }
            >
              <Info className="h-4 w-4 text-blue-500 mr-2" />
              Information
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={enabledTypes.success}
              onCheckedChange={(checked) => 
                setEnabledTypes(prev => ({ ...prev, success: !!checked }))
              }
            >
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              Success
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {filteredAlerts.map((alert) => (
            <li key={alert.id} className="p-4">
              <div className="flex items-center gap-3">
                {getSeverityIcon(alert.severity)}
                <div className="flex-1">
                  <p className="font-medium">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={cn(getSeverityColor(alert.severity))}>
                      {alert.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {alert.source} • {formatTimeAgo(alert.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {filteredAlerts.length === 0 && (
            <li className="p-4 text-center text-muted-foreground">
              No alerts match the selected filters
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
