
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Play, WifiOff, Camera, AlertCircle, Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import VideoStream from "@/components/VideoStream";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Dashboard = () => {
  const [ipAddress, setIpAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const isSecureConnection = window.location.protocol === 'https:';

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
      
      toast({
        title: "Connection established",
        description: `Successfully connected to camera at ${ipAddress}. Starting video stream...`,
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: error.message || "Failed to connect to camera stream",
      });
      setIsConnected(false);
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
      <div className="space-y-6">
        {isSecureConnection && (
          <Alert variant="default" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You're viewing this page over HTTPS. For WebSocket connections to work properly, your Python server must support secure WebSockets (wss://) or be accessed through a secure proxy.
            </AlertDescription>
          </Alert>
        )}

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
                    Run the Python script to start object detection:
                  </p>
                  <code className="block bg-black text-white p-2 rounded mt-2 text-xs overflow-x-auto">
                    python object_detection_websocket.py {ipAddress}
                  </code>
                  {isSecureConnection && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                      <div className="flex items-center gap-1 mb-1">
                        <Shield className="h-4 w-4" />
                        <strong>HTTPS Security Note:</strong>
                      </div>
                      <p>
                        Since you're on HTTPS, you'll need to either:
                      </p>
                      <ol className="list-decimal pl-5 mt-1 space-y-1">
                        <li>Configure SSL certificates on your Python WebSocket server</li>
                        <li>Use a secure WebSocket proxy (like Nginx or ngrok)</li>
                        <li>Access this application over HTTP instead</li>
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Video stream component */}
        {(isConnected || isConnecting) && (
          <VideoStream 
            ipAddress={ipAddress} 
            isConnected={isConnected} 
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
