
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useState } from "react";

const Dashboard = () => {
  const [ipAddress, setIpAddress] = useState("");

  const handleStartSession = () => {
    // Handle session start logic here
    console.log("Starting session with IP:", ipAddress);
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      <div className="max-w-md">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Enter IP Address"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                />
              </div>
              <Button 
                className="w-full"
                onClick={handleStartSession}
              >
                <Play className="mr-2 h-4 w-4" />
                Start Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
