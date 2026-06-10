import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { skillName, subSkillName, searchQuery } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a life skills coach. When asked about a skill, return exactly 5 YouTube video recommendations that are REAL, popular, and highly-rated videos from well-known creators. Focus on actionable, practical content.

Return ONLY a JSON array of objects with these fields:
- title: The video title
- channel: The YouTube channel name
- description: A brief 1-sentence description of what you'll learn
- searchUrl: A YouTube search URL that would find this video (format: https://www.youtube.com/results?search_query=encoded+search+terms)
- duration: Approximate video duration
- difficulty: "beginner" | "intermediate" | "advanced"

Popular channels to recommend from: Charisma on Command, Thomas Frank, Ali Abdaal, Jordan Peterson, Chris Williamson, Andrew Huberman, Matt D'Avella, Improvement Pill, Practical Psychology, Better Ideas, Hamza, The Art of Improvement, Einzelgänger, Academy of Ideas.

Return ONLY the JSON array, no other text.`
          },
          {
            role: "user",
            content: `Give me the 5 best YouTube videos to learn "${subSkillName}" which is part of "${skillName}". Search context: ${searchQuery}`
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits needed. Add funds in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "[]";
    
    // Clean markdown code fences if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    let videos;
    try {
      videos = JSON.parse(content);
    } catch {
      videos = [];
    }

    return new Response(JSON.stringify({ videos }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("skill-videos error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
