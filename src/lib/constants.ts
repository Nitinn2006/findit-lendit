export const ITEM_CATEGORIES = [
  "ID Card",
  "Books",
  "Notebooks",
  "Wallet",
  "Water Bottle",
  "Charger",
  "Calculator",
  "Lab Coat",
  "Notes",
  "Sports Equipment",
  "Umbrella",
  "Electronics",
  "Other",
] as const;

export const DEPARTMENTS = [
  "Computer Science",
  "BCA",
  "BBA",
  "Commerce",
  "Electronics",
  "Mechanical",
  "Civil",
  "Science",
  "Arts",
  "Other",
] as const;

export const CATEGORY_ICON: Record<string, string> = {
  "ID Card": "🪪",
  Books: "📚",
  Notebooks: "📒",
  Wallet: "👛",
  "Water Bottle": "🧴",
  Charger: "🔌",
  Calculator: "🧮",
  "Lab Coat": "🥼",
  Notes: "📝",
  "Sports Equipment": "🏸",
  Umbrella: "☂️",
  Electronics: "💻",
  Other: "📦",
};
export const ITEM_SYNONYMS: Record<string, string[]> = {
  headphone: ["earphone", "earbud", "earbuds", "headset"],
  earphone: ["headphone", "earbud", "earbuds", "headset"],
  wallet: ["purse"],
  charger: ["cable", "adapter"],
  bottle: ["flask"],
};

export function wordsMatch(wordA: string, wordB: string): boolean {
  if (wordA === wordB) return true;
  if (wordA.includes(wordB) || wordB.includes(wordA)) return true;
  const synonymsA = ITEM_SYNONYMS[wordA] ?? [];
  return synonymsA.includes(wordB);
}

export function matchScore(lostName: string, foundName: string, lostLocation: string, foundLocation: string): number {
  const lostWords = lostName.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const foundWords = foundName.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

  let score = 0;

  const exactWordMatch = lostWords.some((lw) => foundWords.includes(lw));
  const synonymMatch = lostWords.some((lw) => foundWords.some((fw) => wordsMatch(lw, fw)));

  if (exactWordMatch) score += 3;
  else if (synonymMatch) score += 2;

  if (lostLocation && foundLocation) {
    const locMatch =
        foundLocation.toLowerCase().includes(lostLocation.toLowerCase()) ||
        lostLocation.toLowerCase().includes(foundLocation.toLowerCase());
    if (locMatch) score += 1;
  }

  return score;
}
