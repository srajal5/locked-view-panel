
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Play, WifiOff, Camera } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [ipAddress, setIpAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleStartSession = async () => {
    try {
      setIsConnecting(true);
      
      // Validate IP address format
      if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ipAddress)) {
        toast({
          variant: "destructive",
          title: "Invalid IP address format",
          description: "Please enter a valid IP address (e.g., 192.168.1.100)",
        });
        setIsConnecting(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to start a session",
        });
        setIsConnecting(false);
        return;
      }

      // Connect to the object detection function
      const { data, error } = await supabase.functions.invoke('object-detection', {
        body: { ipAddress }
      });

      if (error) throw error;

      // If we've reached here, the IP address has been validated
      setIsConnected(true);
      
      // Here you would typically establish a WebSocket connection to your Python script
      // For now, we'll just show a success message
      toast({
        title: "Connection established",
        description: `Successfully validated IP address: ${ipAddress}. Set up this IP address in your Python script.`,
      });

      // In a real implementation, you would now:
      // 1. Open a WebSocket to stream video data
      // 2. Process detection results
      // 3. Display the video feed with bounding boxes

    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: error.message || "Failed to connect to camera stream",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    toast({
      title: "Disconnected",
      description: "Camera stream has been disconnected",
    });
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
                  disabled={isConnected}
                />
              </div>
              {!isConnected ? (
                <Button 
                  className="w-full"
                  onClick={handleStartSession}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    "Connecting..."
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Session
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  className="w-full bg-red-500 hover:bg-red-600"
                  onClick={handleDisconnect}
                >
                  <WifiOff className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
              )}
              
              {isConnected && (
                <div className="mt-4 p-4 bg-gray-100 rounded-md">
                  <div className="flex items-center gap-2">
                    <Camera className="text-green-500" />
                    <span>Connected to: {ipAddress}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Run your Python script with this IP address to begin object detection.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
