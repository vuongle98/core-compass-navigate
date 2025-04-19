
import React from "react";
import { Bot, CheckCircle2, Calendar, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BotStatsCardsProps {
  totalBots: number;
  activeBots: number;
  totalUsers?: number;
  totalMessages?: number;
}

export function BotStatsCards({ 
  totalBots, 
  activeBots, 
  totalUsers, 
  totalMessages 
}: BotStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Bots</CardTitle>
          <CardDescription>Active and inactive</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Bot className="h-5 w-5 mr-2 text-primary" />
            <div className="text-2xl font-bold">{totalBots}</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
          <CardDescription>Currently running</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
            <div className="text-2xl font-bold">{activeBots}</div>
          </div>
        </CardContent>
      </Card>
      
      {/* <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <CardDescription>Across all bots</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          <CardDescription>Processed by bots</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-purple-500" />
            <div className="text-2xl font-bold">{totalMessages.toLocaleString()}</div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
