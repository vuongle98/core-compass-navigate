
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Profile = () => {
  // Mock user data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Administrator",
    joinDate: "January 15, 2023",
    lastLogin: "April 12, 2025 - 10:45 AM"
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader 
          title="User Profile" 
          description="Manage your account and preferences"
        />
        
        <div className="mt-6 grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{user.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Join Date</p>
                  <p className="text-sm text-muted-foreground">{user.joinDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Last Login</p>
                  <p className="text-sm text-muted-foreground">{user.lastLogin}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
