
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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
    // Create a Supabase client with the Auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the session to verify the user is authenticated
    const {
      data: { session },
    } = await supabaseClient.auth.getSession()

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the request URL and params
    const url = new URL(req.url)
    const endpoint = url.searchParams.get('endpoint') || 'market/data'
    const symbols = url.searchParams.get('symbols') || 'AAPL,MSFT,GOOGL'
    const period = url.searchParams.get('period') || '1m'
    
    // FinLab API key from environment variable
    const FINLAB_API_KEY = Deno.env.get('FINLAB_API_KEY')
    
    if (!FINLAB_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build the API URL with all parameters
    let apiUrl = `https://api.finlab.com/v1/${endpoint}?symbols=${symbols}`
    
    // Add period parameter if present and endpoint is for historical data
    if (endpoint === 'stocks/historical' && period) {
      apiUrl += `&period=${period}`
    }
    
    console.log(`Fetching data from FinLab API: ${apiUrl}`)
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${FINLAB_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`FinLab API error (${response.status}): ${errorText}`)
      return new Response(
        JSON.stringify({ error: `FinLab API error: ${response.statusText}`, details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    
    // Return the data to the client
    return new Response(
      JSON.stringify(data),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
