export const animeQuotes = [
  { quote: "If you don't take risks, you can't create a future.", anime: "One Piece", character: "Monkey D. Luffy" },
  { quote: "The world isn't perfect. But it's there for us, doing the best it can.", anime: "Fullmetal Alchemist", character: "Roy Mustang" },
  { quote: "Power comes in response to a need, not a desire.", anime: "Dragon Ball Z", character: "Goku" },
  { quote: "Fear is not evil. It tells you what your weakness is.", anime: "Fairy Tail", character: "Gildarts Clive" },
  { quote: "Whatever you lose, you'll find it again. But what you throw away you'll never get back.", anime: "Fullmetal Alchemist", character: "Kimblee" },
  { quote: "A dropout will beat a genius through hard work.", anime: "Naruto", character: "Rock Lee" },
  { quote: "The moment you think of giving up, think of the reason why you held on so long.", anime: "Natsu Dragneel", character: "Fairy Tail" },
  { quote: "I'll leave tomorrow's problems to tomorrow's me.", anime: "One Punch Man", character: "Saitama" },
  { quote: "Being weak is nothing to be ashamed of. Staying weak is.", anime: "Fairy Tail", character: "Makarov" },
  { quote: "If you want to be strong, learn to fight alone.", anime: "Solo Leveling", character: "Sung Jin-Woo" },
  { quote: "I alone level up.", anime: "Solo Leveling", character: "Sung Jin-Woo" },
  { quote: "Those who stand at the top determine what's wrong and what's right!", anime: "Bleach", character: "Sosuke Aizen" },
  { quote: "Reject common sense to make the impossible possible.", anime: "Gurren Lagann", character: "Kamina" },
  { quote: "The only ones who should kill are those prepared to be killed.", anime: "Code Geass", character: "Lelouch" },
  { quote: "Life is not a game of luck. If you wanna win, work hard.", anime: "Sora", character: "No Game No Life" },
  { quote: "Hard work betrays none, but dreams betray many.", anime: "Hachiman Hikigaya", character: "My Teen Romantic Comedy SNAFU" },
  { quote: "Even if we forget the faces of our friends, we will never forget the bonds.", anime: "One Piece", character: "Brook" },
  { quote: "You should enjoy the little detours. Because that's where you'll find things more important.", anime: "Hunter x Hunter", character: "Ging Freecss" },
  { quote: "A lesson without pain is meaningless.", anime: "Fullmetal Alchemist", character: "Edward Elric" },
  { quote: "Knowing what it feels to be in pain, is exactly why we try to be kind to others.", anime: "Naruto", character: "Jiraiya" },
  { quote: "No matter how deep the night, it always turns to day, eventually.", anime: "One Piece", character: "Brook" },
  { quote: "Stand up and walk. Keep moving forward.", anime: "Fullmetal Alchemist", character: "Edward Elric" },
  { quote: "Arise.", anime: "Solo Leveling", character: "Sung Jin-Woo" },
  { quote: "The strong don't win. The winners are the ones who are strong.", anime: "Haikyuu", character: "Kageyama" },
  { quote: "Giving up kills people. When people reject giving up, they finally win.", anime: "Naruto", character: "Naruto Uzumaki" },
];

export const getRandomQuote = () => {
  return animeQuotes[Math.floor(Math.random() * animeQuotes.length)];
};

export const getDailyQuote = () => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return animeQuotes[dayOfYear % animeQuotes.length];
};
