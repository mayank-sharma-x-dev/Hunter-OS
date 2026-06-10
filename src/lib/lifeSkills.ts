export interface SubSkill {
  key: string;
  name: string;
  description: string;
  practices: string[];
}

export interface SkillCategory {
  key: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  description: string;
  subSkills: SubSkill[];
}

export const LIFE_SKILL_CATEGORIES: SkillCategory[] = [
  {
    key: "communication",
    name: "Communication",
    icon: "🗣️",
    color: "primary",
    gradient: "from-primary/20 to-primary/5",
    description: "Master the art of expressing yourself clearly and connecting with others",
    subSkills: [
      { key: "clear_speech", name: "Clear Speech", description: "Articulate thoughts with precision and confidence", practices: ["Record yourself speaking for 2 minutes daily", "Practice tongue twisters", "Read aloud for 10 minutes"] },
      { key: "active_listening", name: "Active Listening", description: "Truly hear and understand what others are saying", practices: ["Summarize what someone said back to them", "Practice 30 seconds of silence before responding", "Put phone away during conversations"] },
      { key: "boundaries", name: "Boundaries", description: "Set and maintain healthy communication limits", practices: ["Say 'no' to one request today politely", "Express a need clearly without guilt", "Practice the 'I feel... when... because...' format"] },
      { key: "silence_control", name: "Silence Control", description: "Use strategic pauses and silence for impact", practices: ["Practice 3-second pauses before answering", "Sit in comfortable silence for 5 minutes", "Use silence instead of filler words for a day"] },
      { key: "storytelling", name: "Storytelling", description: "Captivate attention through compelling narratives", practices: ["Tell a 60-second story about your day", "Use the STAR method for one story", "Practice adding sensory details to descriptions"] },
    ],
  },
  {
    key: "social",
    name: "Social Intelligence",
    icon: "🤝",
    color: "secondary",
    gradient: "from-secondary/20 to-secondary/5",
    description: "Navigate social situations with grace, awareness, and genuine confidence",
    subSkills: [
      { key: "reading_rooms", name: "Reading Rooms", description: "Sense the energy and dynamics of any group", practices: ["Observe group dynamics for 5 minutes without speaking", "Note body language of 3 people today", "Identify the leader in a group conversation"] },
      { key: "social_ease", name: "Social Ease", description: "Feel comfortable and natural in any social setting", practices: ["Start one conversation with a stranger this week", "Ask someone an unexpected thoughtful question", "Practice maintaining eye contact for 3 seconds"] },
      { key: "respectful_exit", name: "Respectful Exit", description: "Leave conversations and situations gracefully", practices: ["Practice 3 exit phrases", "Leave a group chat on a high note", "End a call naturally without it being awkward"] },
      { key: "comfort_energy", name: "Comfort Energy", description: "Project warmth that makes others feel at ease", practices: ["Smile genuinely at 5 people today", "Use someone's name 3 times in conversation", "Mirror someone's energy level subtly"] },
      { key: "conflict_resolution", name: "Conflict Resolution", description: "Navigate disagreements toward productive outcomes", practices: ["Acknowledge the other person's point first", "Find common ground before stating your position", "Practice de-escalation with calm tone"] },
    ],
  },
  {
    key: "independence",
    name: "Independence",
    icon: "🦅",
    color: "accent",
    gradient: "from-accent/20 to-accent/5",
    description: "Build the foundation of self-reliance and personal sovereignty",
    subSkills: [
      { key: "personal_responsibility", name: "Personal Responsibility", description: "Own your decisions, actions, and their outcomes", practices: ["Journal about one mistake and what you learned", "Stop blaming others for one day", "Take ownership of a problem you've been avoiding"] },
      { key: "self_reliance", name: "Self-Reliance", description: "Depend on yourself for emotional and practical needs", practices: ["Do something alone that you usually need company for", "Fix something yourself instead of asking for help", "Make a decision without consulting anyone"] },
      { key: "financial_literacy", name: "Financial Literacy", description: "Understand money, investing, and wealth building", practices: ["Track every expense for a week", "Read one article about investing", "Create a simple budget plan"] },
      { key: "life_management", name: "Life Management", description: "Organize and run your life like a well-oiled machine", practices: ["Plan your entire next day the night before", "Organize one area of your living space", "Create a weekly routine and follow it"] },
      { key: "cooking_nutrition", name: "Cooking & Nutrition", description: "Fuel your body with proper nutrition you prepare yourself", practices: ["Cook one meal from scratch today", "Learn to make 3 simple healthy meals", "Meal prep for 3 days ahead"] },
    ],
  },
  {
    key: "discipline",
    name: "Discipline",
    icon: "⚡",
    color: "destructive",
    gradient: "from-destructive/20 to-destructive/5",
    description: "Forge unbreakable habits and unwavering consistency",
    subSkills: [
      { key: "consistency", name: "Consistency", description: "Show up every single day, no matter what", practices: ["Do one small habit for 7 days straight", "Never break a promise to yourself today", "Complete your smallest task immediately"] },
      { key: "time_management", name: "Time Management", description: "Master your hours to master your life", practices: ["Time-block your next 4 hours", "Use the 2-minute rule for quick tasks", "Identify your top 3 priorities for tomorrow"] },
      { key: "follow_through", name: "Follow Through", description: "Finish what you start, every single time", practices: ["Complete one abandoned project this week", "Set a deadline for an open task and hit it", "Track your completion rate for 7 days"] },
      { key: "delayed_gratification", name: "Delayed Gratification", description: "Choose long-term rewards over instant pleasure", practices: ["Skip one impulse purchase today", "Wait 10 minutes before checking your phone", "Choose the harder but more rewarding option once today"] },
      { key: "morning_routine", name: "Morning Routine", description: "Win the first hour, win the day", practices: ["Wake up 30 minutes earlier tomorrow", "No phone for first 30 minutes after waking", "Do 5 minutes of movement immediately after waking"] },
    ],
  },
  {
    key: "physical",
    name: "Physical Presence",
    icon: "🏛️",
    color: "gold",
    gradient: "from-gold/20 to-gold/5",
    description: "Command respect through body language, posture, and physical awareness",
    subSkills: [
      { key: "posture", name: "Posture", description: "Stand tall, project confidence through alignment", practices: ["Wall test: stand against wall for 2 minutes", "Set hourly posture check reminders", "Practice walking with a book on your head"] },
      { key: "presence", name: "Presence", description: "Fill a room with your energy before you speak", practices: ["Pause 3 seconds before entering a room", "Walk 10% slower than usual with purpose", "Practice taking up space comfortably when seated"] },
      { key: "eye_contact", name: "Eye Contact", description: "Connect through steady, confident eye contact", practices: ["Maintain eye contact for 5 seconds during conversation", "Practice the triangle technique (eyes-nose-eyes)", "Look at the speaker's eyes while they talk"] },
      { key: "body_language", name: "Body Language", description: "Speak volumes without saying a word", practices: ["Keep hands visible and relaxed in conversations", "Practice open body language for 1 hour", "Mirror the body language of someone you admire"] },
      { key: "voice_control", name: "Voice Control", description: "Use tone, pace, and volume as instruments of influence", practices: ["Practice speaking at 70% your normal speed", "Record and listen to your voice for pitch variation", "Practice projecting your voice across a room"] },
    ],
  },
  {
    key: "mindset",
    name: "Mindset",
    icon: "🧠",
    color: "primary",
    gradient: "from-primary/15 to-secondary/10",
    description: "Reprogram your thinking patterns for unstoppable growth",
    subSkills: [
      { key: "responsibility_mindset", name: "Radical Responsibility", description: "Everything in your life is your responsibility", practices: ["Write 3 things you're responsible for fixing", "Replace 'I can't' with 'I choose not to' for a day", "Identify one excuse you keep making and eliminate it"] },
      { key: "curiosity", name: "Curiosity", description: "Stay hungry for knowledge and new perspectives", practices: ["Ask 'why?' five times about something today", "Learn one completely new thing outside your field", "Have a conversation with someone who thinks differently"] },
      { key: "resilience", name: "Resilience", description: "Bounce back stronger from every setback", practices: ["Journal about a failure and 3 lessons from it", "Do something that makes you uncomfortable today", "Reframe one negative event as an opportunity"] },
      { key: "strategic_thinking", name: "Strategic Thinking", description: "Think three moves ahead in life", practices: ["Plan the next 3 steps for your biggest goal", "Analyze a past decision: what would you change?", "Map out consequences of a decision before making it"] },
      { key: "emotional_regulation", name: "Emotional Regulation", description: "Master your reactions and emotional responses", practices: ["Pause 10 seconds before reacting to frustration", "Name your emotions out loud when you feel them", "Practice box breathing when stressed (4-4-4-4)"] },
    ],
  },
  {
    key: "influence",
    name: "Influence & Persuasion",
    icon: "🎭",
    color: "secondary",
    gradient: "from-secondary/15 to-accent/10",
    description: "Ethically influence outcomes and inspire action in others",
    subSkills: [
      { key: "first_impressions", name: "First Impressions", description: "Make people remember you within 7 seconds", practices: ["Practice your introduction in the mirror", "Lead with a genuine compliment or observation", "Dress 10% better than the occasion requires"] },
      { key: "negotiation", name: "Negotiation", description: "Find win-win outcomes in any exchange", practices: ["Practice the 'feel-felt-found' technique", "Never accept the first offer (practice politely)", "Ask 'What would it take?' in a negotiation"] },
      { key: "reading_people", name: "Reading People", description: "Understand hidden motivations and intentions", practices: ["Observe someone's micro-expressions for 5 minutes", "Identify what someone values most from conversation", "Notice the gap between words and body language"] },
      { key: "ethical_influence", name: "Ethical Influence", description: "Move people toward positive outcomes without manipulation", practices: ["Use reciprocity: give value before asking", "Practice social proof in conversation naturally", "Lead by example instead of instructing"] },
      { key: "public_speaking", name: "Public Speaking", description: "Command any audience with confidence and clarity", practices: ["Record a 2-minute speech on any topic", "Practice speaking to yourself in the mirror", "Present an idea to 1 person with full structure"] },
    ],
  },
  {
    key: "digital",
    name: "Digital Mastery",
    icon: "💻",
    color: "accent",
    gradient: "from-accent/15 to-primary/10",
    description: "Navigate the digital world with intention and skill",
    subSkills: [
      { key: "digital_detox", name: "Digital Detox", description: "Control technology instead of being controlled by it", practices: ["No social media for 2 hours today", "Turn off all non-essential notifications", "Use phone grayscale mode for one day"] },
      { key: "online_presence", name: "Online Presence", description: "Build a powerful and authentic digital identity", practices: ["Audit your social media profiles", "Post one valuable piece of content", "Clean up your digital footprint"] },
      { key: "focus_tools", name: "Focus Tools", description: "Use technology to amplify your productivity", practices: ["Set up app time limits on your phone", "Use website blockers during focus time", "Organize your digital workspace"] },
      { key: "content_creation", name: "Content Creation", description: "Express ideas through digital media", practices: ["Write a 200-word post about something you learned", "Create a short video explaining a concept", "Design a simple visual for an idea"] },
    ],
  },
];

export const getSkillSearchQuery = (category: string, subSkill: string): string => {
  const queries: Record<string, string> = {
    "clear_speech": "how to speak clearly and confidently public speaking tips",
    "active_listening": "active listening skills techniques improve communication",
    "boundaries": "how to set healthy boundaries communication",
    "silence_control": "power of silence in communication strategic pauses",
    "storytelling": "storytelling techniques captivate audience",
    "reading_rooms": "how to read a room social intelligence body language",
    "social_ease": "how to be comfortable in social situations confidence",
    "respectful_exit": "how to leave a conversation gracefully social skills",
    "comfort_energy": "how to make people feel comfortable around you charisma",
    "conflict_resolution": "conflict resolution skills techniques",
    "personal_responsibility": "radical personal responsibility self improvement",
    "self_reliance": "how to be self reliant independent person",
    "financial_literacy": "financial literacy basics money management young adults",
    "life_management": "life organization skills self management",
    "cooking_nutrition": "easy healthy cooking basics meal prep beginners",
    "consistency": "how to build consistency habits discipline",
    "time_management": "time management skills techniques productivity",
    "follow_through": "how to finish what you start follow through discipline",
    "delayed_gratification": "delayed gratification self control discipline",
    "morning_routine": "powerful morning routine habits successful people",
    "posture": "how to improve posture body language confidence",
    "presence": "how to have commanding presence charisma",
    "eye_contact": "eye contact confidence social skills practice",
    "body_language": "body language mastery nonverbal communication",
    "voice_control": "voice training speaking voice deeper confident",
    "responsibility_mindset": "extreme ownership mindset responsibility",
    "curiosity": "how to develop curiosity growth mindset learning",
    "resilience": "mental resilience how to bounce back from failure",
    "strategic_thinking": "strategic thinking skills how to think ahead",
    "emotional_regulation": "emotional regulation techniques self control",
    "first_impressions": "how to make a great first impression charisma",
    "negotiation": "negotiation skills techniques beginners",
    "reading_people": "how to read people body language psychology",
    "ethical_influence": "ethical influence persuasion techniques",
    "public_speaking": "public speaking confidence tips beginners",
    "digital_detox": "digital detox social media addiction phone",
    "online_presence": "building personal brand online presence",
    "focus_tools": "best productivity tools apps focus",
    "content_creation": "content creation beginners tips",
  };
  return queries[subSkill] || `${category} ${subSkill} self improvement tips`;
};
