
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Camera, VideoOff } from "lucide-react";

interface VideoStreamProps {
  ipAddress: string;
  wsPort?: number;
  isConnected: boolean;
}

interface Detection {
  class: string;
  confidence: number;
}

const VideoStream = ({ ipAddress, wsPort = 8765, isConnected }: VideoStreamProps) => {
  const [streamActive, setStreamActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>("Waiting for connection...");
  const [latestImage, setLatestImage] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isConnected) {
      setStreamActive(false);
      setError(null);
      setDetections([]);
      setLatestImage(null);
      setStatusMessage("Waiting for connection...");
      
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    // Connect to WebSocket when ipAddress is provided and connection is active
    const ws = new WebSocket(`ws://${ipAddress}:${wsPort}`);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log("WebSocket connection established");
      setStreamActive(true);
      setError(null);
      setStatusMessage("Connected to video stream");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "error") {
          setError(data.message);
          setStreamActive(false);
        } else if (data.type === "status") {
          setStatusMessage(data.message);
        } else if (data.type === "frame") {
          setLatestImage(`data:image/jpeg;base64,${data.image}`);
          setDetections(data.detections || []);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onerror = (event) => {
      console.error("WebSocket error:", event);
      setError("Failed to connect to video stream server");
      setStreamActive(false);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setStreamActive(false);
    };

    return () => {
      ws.close();
    };
  }, [ipAddress, wsPort, isConnected]);

  if (!isConnected) {
    return (
      <Card className="border-dashed border-gray-300 bg-gray-50">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center h-[400px]">
          <VideoOff className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Video Stream Disconnected</h3>
          <p className="text-sm text-gray-500">
            Connect to a camera using the IP address field above to begin streaming
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 relative">
          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : !streamActive ? (
            <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-md">
              <div className="text-center">
                <Camera className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-500">{statusMessage}</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {latestImage ? (
                <img 
                  src={latestImage} 
                  alt="Camera Stream" 
                  className="w-full h-auto rounded-md"
                />
              ) : (
                <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-md">
                  <p className="text-gray-500">Waiting for video frames...</p>
                </div>
              )}
              <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-md text-xs">
                {streamActive ? "Live" : "Connecting..."}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {detections.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-2">Detected Objects</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {detections.map((detection, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 border border-gray-200 rounded-md p-2 flex justify-between"
                >
                  <span>{detection.class}</span>
                  <span className="text-green-600 font-medium">{detection.confidence}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VideoStream;
