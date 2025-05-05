import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type EventPriority = "high" | "medium" | "low";
type EventStatus = "pending" | "in-progress" | "completed" | "cancelled";

interface Event {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  priority?: EventPriority;
  status?: EventStatus;
}

interface UpcomingEventsWidgetProps {
  className?: string;
}

export function UpcomingEventsWidget({ className }: UpcomingEventsWidgetProps) {
  // In a real app, this would come from an API
  const [events] = useState<Event[]>([
    {
      id: 1,
      title: "Team Meeting",
      description: "Weekly sprint planning",
      startTime: new Date(Date.now() + 2 * 60 * 60000).toISOString(), // 2 hours from now
      endTime: new Date(Date.now() + 3 * 60 * 60000).toISOString(), // 3 hours from now
      priority: "high",
      status: "pending",
    },
    {
      id: 2,
      title: "Database Maintenance",
      description: "Scheduled downtime for database updates",
      startTime: new Date(Date.now() + 5 * 60 * 60000).toISOString(), // 5 hours from now
      endTime: new Date(Date.now() + 6 * 60 * 60000).toISOString(), // 6 hours from now
      priority: "medium",
      status: "pending",
    },
    {
      id: 3,
      title: "User Research Call",
      description: "Interview with new users",
      startTime: new Date(Date.now() + 24 * 60 * 60000).toISOString(), // 24 hours from now
      endTime: new Date(Date.now() + 25 * 60 * 60000).toISOString(), // 25 hours from now
      priority: "medium",
      status: "pending",
    },
    {
      id: 4,
      title: "Deploy Version 2.0",
      description: "Major release deployment",
      startTime: new Date(Date.now() + 48 * 60 * 60000).toISOString(), // 48 hours from now
      priority: "high",
      status: "pending",
    },
  ]);

  function formatEventTime(event: Event): string {
    const start = new Date(event.startTime);
    const startFormatted = format(start, "MMM d, h:mm a");

    if (event.endTime) {
      const end = new Date(event.endTime);
      // If same day, only show time for end
      if (start.toDateString() === end.toDateString()) {
        return `${startFormatted} - ${format(end, "h:mm a")}`;
      } else {
        return `${startFormatted} - ${format(end, "MMM d, h:mm a")}`;
      }
    }

    return startFormatted;
  }

  function getEventTimeFromNow(timestamp: string): string {
    const eventTime = new Date(timestamp);
    const now = new Date();
    const diffMs = eventTime.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `in ${diffMins} min`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `in ${diffHours} hr`;

    const diffDays = Math.floor(diffHours / 24);
    return `in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
  }

  function getPriorityBadge(priority?: EventPriority) {
    if (!priority) return null;

    const classes = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-amber-100 text-amber-800 border-amber-200",
      low: "bg-green-100 text-green-800 border-green-200",
    };

    return (
      <Badge variant="outline" className={cn(classes[priority])}>
        {priority}
      </Badge>
    );
  }

  function getStatusBadge(status?: EventStatus) {
    if (!status) return null;

    const classes = {
      pending: "bg-blue-100 text-blue-800 border-blue-200",
      "in-progress": "bg-purple-100 text-purple-800 border-purple-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <Badge variant="outline" className={cn(classes[status])}>
        {status}
      </Badge>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>Upcoming Events</span>
          <Badge variant="outline" className="bg-primary/10">
            {events.length} events
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {events.map((event) => (
            <li key={event.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center pt-1">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div className="mt-1 h-full w-0.5 bg-border"></div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 items-center mb-1">
                    <h4 className="font-medium">{event.title}</h4>
                    <div className="flex flex-wrap gap-2">
                      {getPriorityBadge(event.priority)}
                      {getStatusBadge(event.status)}
                    </div>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatEventTime(event)}</span>
                    <span className="font-medium">
                      ({getEventTimeFromNow(event.startTime)})
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
