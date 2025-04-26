
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

    // Start WebSocket connection for video stream
    const { socket, response } = Deno.upgradeWebSocket(req)

    socket.onopen = () => {
      console.log('WebSocket connection established')
    }

    socket.onmessage = (event) => {
      // Handle incoming messages from client
      console.log('Received:', event.data)
    }

    socket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return response
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
