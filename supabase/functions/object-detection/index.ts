
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { ipAddress } = await req.json()
    
    // Validate IP address format
    if (!ipAddress || !/^(\d{1,3}\.){3}\d{1,3}$/.test(ipAddress)) {
      return new Response(
        JSON.stringify({ error: 'Invalid IP address format' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Detect if the request is coming from HTTPS
    const requestScheme = req.headers.get("x-forwarded-proto") || "http";
    const wsProtocol = requestScheme === "https" ? "wss" : "ws";

    // Instructions on how to connect to the WebSocket server
    const instructions = `
To start the object detection WebSocket server, run:
python object_detection_websocket.py ${ipAddress}
    `.trim();

    // Add security note for HTTPS environments
    const securityNote = requestScheme === "https" 
      ? "Note: Your app is running in a secure context (HTTPS). For WebSocket connections to work properly, your WebSocket server must use secure WebSockets (wss://) or be accessed through a secure proxy." 
      : "";

    // Return success response with instructions
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'IP address validated', 
        ipAddress,
        instructions,
        wsPort: 8765, // Default WebSocket port
        wsProtocol,
        securityNote
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error in object-detection function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
