export interface BotConfiguration {
  webhookUrl?: string;
  pollingInterval?: number;
  allowedUpdates?: string[];
  maxConnections?: number;
  ipAddress?: string;
  secretToken?: string;
  dropPendingUpdates?: boolean;
  maxThreads?: number;
  updateMethod?: "LONG_POLLING" | "WEBHOOK";
}
export interface Bot {
  id: number;
  name: string;
  apiToken?: string;
  status: "RUNNING" | "STOPPED" | "ERRORED" | "CREATED"; // STARTING, RUNNING, STOPPING, STOPPED, ERRORED
  pollingInterval?: number;
  configuration?: BotConfiguration;
  description?: string;
  scheduled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BotScheduledMessage {
  id: number;
  botId: number;
  chatId: string;
  messageText: string;
  description?: string;
  isRecurring: boolean;
  recurrencePattern: string;
  isSent: boolean;
  scheduledTime: string;
  sentAt: string;
  isCancelled: boolean;
  createdAt: string;
}

export interface BotCommand {
  id: number;
  command: string;
  description?: string;
  responseTemplate?: string;
  handlerMethod?: string;
  createdAt?: string;
}

export interface BotHistory {
  id: number;
  botId: number;
  botName: string;
  newStatus: string;
  previousStatus: string;
  timestamp: string;
  message: string;
  errorDetails?: string;
  notes?: string;
}
