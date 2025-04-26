
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Play, WifiOff } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [ipAddress, setIpAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const handleStartSession = async () => {
    try {
      // Validate IP address format
      if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ipAddress)) {
        toast({
          variant: "destructive",
          title: "Invalid IP address format",
          description: "Please enter a valid IP address (e.g., 192.168.1.100)",
        });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to start a session",
        });
        return;
      }

      // Connect to the object detection function
      const { data, error } = await supabase.functions.invoke('object-detection', {
        body: { ipAddress }
      });

      if (error) throw error;

      setIsConnected(true);
      toast({
        title: "Connection established",
        description: "Successfully connected to camera stream",
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: error.message || "Failed to connect to camera stream",
      });
    }
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
                  placeholder="Enter Camera IP Address (e.g., 192.168.1.100)"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  pattern="^(\d{1,3}\.){3}\d{1,3}$"
                />
              </div>
              <Button 
                className="w-full"
                onClick={handleStartSession}
                disabled={isConnected}
              >
                {isConnected ? (
                  <>
                    <WifiOff className="mr-2 h-4 w-4" />
                    Connected
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Session
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
