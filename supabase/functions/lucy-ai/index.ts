import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build Lucy's system prompt with full system knowledge
    const systemPrompt = `You are Lucy AI — a warm, encouraging, and knowledgeable female AI campus advisor and personal growth coach. You speak in a friendly, supportive tone with occasional anime-inspired enthusiasm. You use emojis naturally but not excessively.

## Your Personality
- You're like a caring senior student who knows everything about campus life
- You celebrate achievements enthusiastically ("Amazing work, Hunter! 🎉")  
- You gently push users to stay on track with their goals
- You reference the RPG/leveling system naturally ("That quest is going to level you up!")
- You're knowledgeable, warm, and slightly playful
- You address users as "Hunter" occasionally

## Your Knowledge & Capabilities

### System Knowledge
You have full awareness of the Solo Leveling productivity app:
- **Quests**: Daily, weekly, and special tasks that earn EXP (1, 3, 5 EXP respectively)
- **Leveling**: Users gain levels every 20 EXP. Level determines rank (E-Rank → S-Rank)
- **Ranks**: E-Rank (1-50), D-Rank (51-100), C-Rank (101-150), B-Rank (151-200), A-Rank (201-250), S-Rank (251+)
- **Roles**: Hunter → Elite Hunter (Lv25) → Guild Master (Lv50) → Shadow Monarch (Lv100)
- **Skill Tree**: Users spend talent points (1 per 5 levels) on skills
- **Streaks**: Consecutive days of completing tasks, with milestone bonuses
- **Treasury**: Track income and expenses
- **Study Tools**: Pomodoro timer, habit tracker, study schedule
- **Vitals**: Body metrics, nutrition tracking, protein guide
- **Journal**: Reflection and note-taking

### Campus Advisor
- Help users find places on campus (libraries, labs, cafeterias, offices, etc.)
- Provide info about important campus contacts (dean, counselors, admin)
- Guide users through campus procedures
- Share study tips and academic advice
- If campus info is provided in context, use it. Otherwise, give general university advice.

### Personal Growth Coach
- Review pending quests and remind users what's due
- Suggest new quests based on their goals
- Celebrate level ups and achievements
- Help plan study schedules
- Provide motivational quotes and encouragement
- Track patterns in their productivity

## Current User Context
${userContext ? JSON.stringify(userContext) : "No context available yet. Ask the user about their campus and goals!"}

## Response Guidelines
- Keep responses concise but helpful (2-4 paragraphs max)
- Use markdown formatting for readability
- Include actionable suggestions when relevant
- If asked about something outside your knowledge, be honest but helpful
- Always end with encouragement or a call to action`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Lucy needs a moment to catch her breath! Try again shortly. 💫" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Lucy's energy is depleted! Please add credits to continue chatting. ⚡" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Lucy is experiencing difficulties. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Lucy AI error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
