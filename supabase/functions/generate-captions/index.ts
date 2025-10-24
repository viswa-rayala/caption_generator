import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description } = await req.json();
    
    if (!description) {
      return new Response(
        JSON.stringify({ error: "Description is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Generating captions for:', description);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a creative travel caption writer. Generate 5 engaging, unique travel captions based on the user's description. 
            
            Guidelines:
            - Mix different styles: inspirational quotes, witty observations, poetic descriptions
            - Include relevant emojis where appropriate
            - Keep captions between 15-30 words each
            - Make them Instagram-worthy and shareable
            - Capture the emotion and essence of the moment
            
            Return ONLY a JSON array of strings, nothing else. Format: ["caption1", "caption2", "caption3", "caption4", "caption5"]`
          },
          {
            role: 'user',
            content: description
          }
        ],
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Please add credits to your Lovable AI workspace." }),
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to generate captions" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('AI response:', data);

    let captions: string[] = [];
    
    try {
      const content = data.choices[0].message.content;
      // Try to parse JSON from the content
      const jsonMatch = content.match(/\[.*\]/s);
      if (jsonMatch) {
        captions = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: split by newlines and clean up
        captions = content
          .split('\n')
          .filter((line: string) => line.trim() && !line.trim().startsWith('[') && !line.trim().startsWith(']'))
          .map((line: string) => line.replace(/^[0-9]+\.\s*|^[-*]\s*|^["']|["']$/g, '').trim())
          .filter((line: string) => line.length > 0)
          .slice(0, 5);
      }
    } catch (parseError) {
      console.error('Error parsing captions:', parseError);
      // Ultimate fallback
      captions = [
        "Living my best life, one adventure at a time ✈️",
        "Wanderlust and city dust 🌍",
        "Collecting moments, not things 📸",
        "Take only memories, leave only footprints 👣",
        "Adventure awaits, go find it! 🗺️"
      ];
    }

    console.log('Generated captions:', captions);

    return new Response(
      JSON.stringify({ captions }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in generate-captions function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
