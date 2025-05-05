import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Users, Globe, User } from "lucide-react";
import chatService from "@/services/ChatService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import LoggingService from "@/services/LoggingService";

interface CreateChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateChatDialog = ({ isOpen, onClose }: CreateChatDialogProps) => {
  const [activeTab, setActiveTab] = useState("public");
  const [chatName, setChatName] = useState("");
  const [username, setUsername] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();

  const handleCreateChat = async () => {
    if (!user) return;

    setIsCreating(true);

    try {
      LoggingService.info(
        "chat",
        "chat_creation_started",
        "User initiated chat creation",
        {
          chatType: activeTab,
          chatName: activeTab !== "private" ? chatName : username,
        }
      );

      let newChat;

      if (activeTab === "public") {
        if (!chatName.trim()) {
          toast({
            description: "Please enter a chat name",
            variant: "destructive",
          });
          return;
        }
        newChat = chatService.createPublicChat(chatName);
      } else if (activeTab === "private") {
        if (!username.trim()) {
          toast({
            description: "Please enter a username",
            variant: "destructive",
          });
          return;
        }
        // In a real app, we'd search for the user first
        const userId = `user-${Date.now()}`;
        newChat = chatService.createPrivateChat(userId, username);
      } else if (activeTab === "group") {
        if (!chatName.trim()) {
          toast({
            description: "Please enter a group name",
            variant: "destructive",
          });
          return;
        }
        // In a real app, we'd have a user selection UI
        newChat = chatService.createGroupChat(chatName, ["user1", "user2"]);
      }

      toast({ description: `${activeTab} chat created successfully!` });
      LoggingService.info("chat", "chat_created", "Chat created successfully", {
        chatType: activeTab,
        chatId: newChat?.id,
      });

      // Reset form
      setChatName("");
      setUsername("");
      onClose();
    } catch (error) {
      LoggingService.error(
        "chat",
        "chat_creation_failed",
        "Failed to create chat",
        { error }
      );
      toast({
        title: "Error",
        description: "Failed to create chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Chat</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full mt-2"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="public" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Public</span>
            </TabsTrigger>
            <TabsTrigger value="private" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Private</span>
            </TabsTrigger>
            <TabsTrigger value="group" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Group</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="public" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="publicChatName">Public Chat Name</Label>
                <Input
                  id="publicChatName"
                  placeholder="Enter chat name"
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="private" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="group" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  placeholder="Enter group name"
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                />
              </div>
              {/* In a real app, we'd have user selection here */}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateChat} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Chat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChatDialog;
