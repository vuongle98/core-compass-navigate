export interface Notification {
  id: number;
  title: string;
  channel: string;
  audience: string;
  scheduledFor: string;
  status: string;
  selected?: boolean;
  content?: string;
  priority?: "low" | "medium" | "high";
}