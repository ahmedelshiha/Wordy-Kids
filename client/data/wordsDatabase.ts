// Comprehensive vocabulary database for Word Adventure
export interface Word {
  id: number;
  word: string;
  pronunciation: string;
  definition: string;
  example: string;
  funFact: string;
  emoji: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  imageUrl?: string;
}

export const wordsDatabase: Word[] = [
  // ANIMALS - Easy Level
  {
    id: 1,
    word: "butterfly",
    pronunciation: "/ˈbʌdərˌflaɪ/",
    definition:
      "A colorful flying insect with large, often brightly colored wings",
    example: "The butterfly landed gently on the bright yellow flower",
    funFact:
      "Butterflies taste with their feet and can see ultraviolet colors!",
    emoji: "🦋",
    category: "animals",
    difficulty: "easy",
    imageUrl: undefined,
  },
  {
    id: 2,
    word: "dolphin",
    pronunciation: "/ˈdɑːlfɪn/",
    definition:
      "A highly intelligent sea mammal known for its playful behavior",
    example: "The dolphin jumped high out of the water and splashed back down",
    funFact:
      "Dolphins have names for each other - they use unique whistle sounds!",
    emoji: "🐬",
    category: "animals",
    difficulty: "easy",
    imageUrl: undefined,
  },
  {
    id: 3,
    word: "penguin",
    pronunciation: "/ˈpeŋɡwɪn/",
    definition: "A black and white bird that cannot fly but swims very well",
    example: "The penguin slid on its belly across the icy ground",
    funFact:
      "Penguins can drink seawater because they have special glands that filter out salt!",
    emoji: "🐧",
    category: "animals",
    difficulty: "easy",
    imageUrl: undefined,
  },
  {
    id: 4,
    word: "chameleon",
    pronunciation: "/kəˈmiːliən/",
    definition:
      "A lizard that can change its skin color to match its surroundings",
    example: "The chameleon turned green to hide among the leaves",
    funFact:
      "Chameleons can move their eyes independently - one can look forward while the other looks backward!",
    emoji: "🦎",
    category: "animals",
    difficulty: "medium",
    imageUrl: undefined,
  },
  {
    id: 5,
    word: "hibernation",
    pronunciation: "/ˌhaɪbərˈneɪʃən/",
    definition:
      "A deep sleep that some animals take during winter to save energy",
    example: "Bears go into hibernation when food becomes scarce in winter",
    funFact:
      "During hibernation, a bear's heart rate drops from 40 beats per minute to just 8!",
    emoji: "🐻",
    category: "animals",
    difficulty: "medium",
    imageUrl: undefined,
  },
  {
    id: 6,
    word: "octopus",
    pronunciation: "/ˈɑːktəpəs/",
    definition: "A sea creature with eight arms and a soft body",
    example: "The octopus used its arms to catch small fish for dinner",
    funFact: "Octopuses have three hearts and blue blood!",
    emoji: "🐙",
    category: "animals",
    difficulty: "medium",
    imageUrl: undefined,
  },

  // NATURE - Easy Level
  {
    id: 7,
    word: "rainbow",
    pronunciation: "/ˈreɪnboʊ/",
    definition:
      "A colorful arc in the sky formed by sunlight and water droplets",
    example: "After the rain, a beautiful rainbow appeared in the sky",
    funFact: "Rainbows always appear in the opposite direction from the sun!",
    emoji: "🌈",
    category: "nature",
    difficulty: "easy",
    imageUrl: undefined,
  },
  {
    id: 8,
    word: "waterfall",
    pronunciation: "/ˈwɔːtərfɔːl/",
    definition:
      "Water falling down from a high place, like a cliff or mountain",
    example:
      "The waterfall created a misty spray as it crashed into the pool below",
    funFact:
      "Angel Falls in Venezuela is the world's tallest waterfall at 3,212 feet high!",
    emoji: "💧",
    category: "nature",
    difficulty: "easy",
    imageUrl: undefined,
  },
  {
    id: 9,
    word: "forest",
    pronunciation: "/ˈfɔːrɪst/",
    definition: "A large area covered with trees and other plants",
    example:
      "We hiked through the quiet forest and listened to the birds singing",
    funFact:
      "Forests produce oxygen for us to breathe - one large tree can provide oxygen for two people!",
    emoji: "🌲",
    category: "nature",
    difficulty: "easy",
    imageUrl: undefined,
  },
  {
    id: 10,
    word: "glacier",
    pronunciation: "/ˈɡleɪʃər/",
    definition:
      "A huge mass of ice that moves very slowly down a mountain or across land",
    example:
      "The glacier sparkled blue in the sunlight as it slowly moved toward the sea",
    funFact: "Glaciers contain about 70% of the world's fresh water!",
    emoji: "🧊",
    category: "nature",
    difficulty: "medium",
    imageUrl: undefined,
  },

  // SCIENCE - Medium Level
  {
    id: 11,
    word: "telescope",
    pronunciation: "/ˈtelɪˌskoʊp/",
    definition:
      "An instrument used to see distant objects, especially stars and planets",
    example: "Through the telescope, we could see the craters on the moon",
    funFact:
      "The first telescope was invented in 1608 and made stars look 20 times closer!",
    emoji: "🔭",
    category: "science",
    difficulty: "medium",
    imageUrl: undefined,
  },
  {
    id: 12,
    word: "volcano",
    pronunciation: "/vɑːlˈkeɪnoʊ/",
    definition: "A mountain that can explode with hot melted rock called lava",
    example: "The volcano erupted, sending ash and lava high into the air",
    funFact:
      "There are about 1,500 active volcanoes in the world, and 80% are underwater!",
    emoji: "🌋",
    category: "science",
    difficulty: "medium",
    imageUrl: undefined,
  },
  {
    id: 13,
    word: "gravity",
    pronunciation: "/ˈɡrævɪti/",
    definition: "The force that pulls objects toward the center of the Earth",
    example:
      "Gravity is why when you drop a ball, it falls down instead of floating up",
    funFact:
      "Without gravity, you would weigh nothing and float around like astronauts in space!",
    emoji: "🪐",
    category: "science",
    difficulty: "medium",
    imageUrl: undefined,
  },
  {
    id: 14,
    word: "laboratory",
    pronunciation: "/ˈlæbrəˌtɔːri/",
    definition: "A special room where scientists do experiments and research",
    example: "The scientist mixed colorful chemicals in the laboratory",
    funFact:
      "The word 'laboratory' comes from Latin meaning 'a place for work'!",
    emoji: "🧪",
    category: "science",
    difficulty: "hard",
    imageUrl: undefined,
  },

  // FOOD - Easy Level
  {
    id: 15,
    word: "strawberry",
    pronunciation: "/ˈstrɔːberi/",
    definition: "A sweet, red fruit with tiny seeds on the outside",
    example: "I picked fresh strawberries from the garden to make jam",
    funFact:
      "Strawberries are the only fruit with seeds on the outside - about 200 seeds per berry!",
    emoji: "🍓",
    category: "food",
    difficulty: "easy",
    imageUrl: undefined,
  },
  {
    id: 16,
    word: "pizza",
    pronunciation: "/ˈpiːtsə/",
    definition:
      "A round, flat bread topped with tomato sauce, cheese, and other toppings",
    example: "We ordered a pizza with pepperoni and extra cheese for dinner",
    funFact:
      "Americans eat about 3 billion pizzas per year - that's 46 slices per person!",
    emoji: "🍕",
    category: "food",
    difficulty: "easy",
    imageUrl: undefined,
  },
  {
    id: 17,
    word: "spaghetti",
    pronunciation: "/spəˈɡeti/",
    definition: "Long, thin pasta that looks like strings",
    example: "Mom made delicious spaghetti with meatballs for lunch",
    funFact: "The word 'spaghetti' means 'little strings' in Italian!",
    emoji: "🍝",
    category: "food",
    difficulty: "easy",
    imageUrl: undefined,
  },

  // EMOTIONS - Easy Level
  {
    id: 18,
    word: "excitement",
    pronunciation: "/ɪkˈsaɪtmənt/",
    definition:
      "A feeling of being very happy and full of energy about something",
    example:
      "The children felt great excitement when they saw the circus performers",
    funFact:
      "When you're excited, your brain releases chemicals called endorphins that make you feel happy!",
    emoji: "🎉",
    category: "emotions",
    difficulty: "easy",
    imageUrl: undefined,
  },
  {
    id: 19,
    word: "curiosity",
    pronunciation: "/ˌkjʊriˈɑːsəti/",
    definition: "The feeling of wanting to learn or know more about something",
    example:
      "Her curiosity about how things work led her to become a scientist",
    funFact:
      "Curiosity helps your brain grow stronger - asking questions creates new connections in your mind!",
    emoji: "🤔",
    category: "emotions",
    difficulty: "medium",
    imageUrl: undefined,
  },
  {
    id: 20,
    word: "compassion",
    pronunciation: "/kəmˈpæʃən/",
    definition: "The feeling of wanting to help someone who is sad or hurt",
    example: "She showed compassion by helping the injured bird",
    funFact:
      "Studies show that being compassionate actually makes you happier and healthier!",
    emoji: "❤️",
    category: "emotions",
    difficulty: "hard",
    imageUrl: undefined,
  },

  // TECHNOLOGY - Medium Level
  {
    id: 21,
    word: "robot",
    pronunciation: "/ˈroʊbɑːt/",
    definition:
      "A machine that can move and do tasks, often controlled by a computer",
    example: "The robot helped clean the house by vacuuming all the floors",
    funFact:
      "The word 'robot' comes from a Czech word meaning 'forced work' or 'labor'!",
    emoji: "🤖",
    category: "technology",
    difficulty: "medium",
    imageUrl: undefined,
  },
  {
    id: 22,
    word: "satellite",
    pronunciation: "/ˈsætəlaɪt/",
    definition:
      "An object that orbits around Earth and sends signals for TV, phones, and GPS",
    example: "The weather satellite took pictures of the storm from space",
    funFact: "There are over 3,000 active satellites orbiting Earth right now!",
    emoji: "📡",
    category: "technology",
    difficulty: "hard",
    imageUrl: undefined,
  },

  // SPORTS - Easy Level
  {
    id: 23,
    word: "soccer",
    pronunciation: "/ˈsɑːkər/",
    definition: "A sport where players kick a ball and try to score goals",
    example: "The soccer player kicked the ball into the goal to score a point",
    funFact:
      "Soccer is called 'football' in most countries - only a few countries call it soccer!",
    emoji: "⚽",
    category: "sports",
    difficulty: "easy",
    imageUrl: undefined,
  },
  {
    id: 24,
    word: "championship",
    pronunciation: "/ˈtʃæmpiənʃɪp/",
    definition: "A competition to decide who is the best at a sport or game",
    example: "Our team won the championship after practicing all season",
    funFact:
      "The word 'champion' comes from an old word meaning 'fighter in the field'!",
    emoji: "🏆",
    category: "sports",
    difficulty: "medium",
    imageUrl: undefined,
  },
  {
    id: 25,
    word: "gymnastics",
    pronunciation: "/dʒɪmˈnæstɪks/",
    definition: "A sport involving exercises like flips, jumps, and balancing",
    example: "The gymnast performed amazing flips and landed perfectly",
    funFact:
      "Gymnastics was one of the original Olympic sports in ancient Greece!",
    emoji: "🤸",
    category: "sports",
    difficulty: "medium",
    imageUrl: undefined,
  },

  // MUSIC - Easy Level
  {
    id: 26,
    word: "melody",
    pronunciation: "/ˈmelədi/",
    definition:
      "A sequence of musical notes that makes a tune you can sing or hum",
    example: "The melody of that song is so catchy, I can't stop humming it",
    funFact:
      "Your brain can remember a melody even if you haven't heard it for years!",
    emoji: "🎵",
    category: "music",
    difficulty: "medium",
    imageUrl: undefined,
  },
  {
    id: 27,
    word: "orchestra",
    pronunciation: "/ˈɔːrkɪstrə/",
    definition:
      "A large group of musicians playing different instruments together",
    example: "The orchestra played beautiful music at the concert hall",
    funFact: "A full orchestra can have over 100 musicians playing together!",
    emoji: "🎼",
    category: "music",
    difficulty: "hard",
    imageUrl: undefined,
  },

  // SPACE - Hard Level
  {
    id: 28,
    word: "constellation",
    pronunciation: "/ˌkɑːnstəˈleɪʃən/",
    definition: "A group of stars that forms a pattern in the night sky",
    example:
      "We looked up and found the Big Dipper constellation in the dark sky",
    funFact:
      "Ancient people named constellations after animals and heroes from their stories!",
    emoji: "⭐",
    category: "space",
    difficulty: "hard",
    imageUrl: undefined,
  },
  {
    id: 29,
    word: "astronaut",
    pronunciation: "/ˈæstrənɔːt/",
    definition: "A person who travels into space in a spacecraft",
    example: "The astronaut floated weightlessly inside the space station",
    funFact:
      "Astronauts grow about 2 inches taller in space because there's no gravity pulling them down!",
    emoji: "👩‍🚀",
    category: "space",
    difficulty: "medium",
    imageUrl: undefined,
  },
  {
    id: 30,
    word: "galaxy",
    pronunciation: "/ˈɡæləksi/",
    definition:
      "A huge collection of billions of stars, planets, and cosmic dust",
    example: "Our Earth is located in a galaxy called the Milky Way",
    funFact:
      "There are over 100 billion galaxies in the universe that we can see!",
    emoji: "🌌",
    category: "space",
    difficulty: "hard",
    imageUrl: undefined,
  },

  // TRANSPORTATION - Easy Level
  {
    id: 31,
    word: "helicopter",
    pronunciation: "/ˈhelɪkɑːptər/",
    definition:
      "An aircraft with spinning blades on top that can fly in any direction",
    example:
      "The helicopter landed on the hospital roof to bring an injured person to safety",
    funFact: "Helicopters can fly backwards, sideways, and even upside down!",
    emoji: "🚁",
    category: "transportation",
    difficulty: "medium",
    imageUrl: undefined,
  },
  {
    id: 32,
    word: "submarine",
    pronunciation: "/ˈsʌbmərin/",
    definition: "A ship that can travel underwater",
    example: "The submarine dove deep beneath the ocean waves",
    funFact:
      "Submarines can stay underwater for months without coming to the surface!",
    emoji: "🚆",
    category: "transportation",
    difficulty: "medium",
    imageUrl: undefined,
  },

  // WEATHER - Easy Level
  {
    id: 33,
    word: "thunderstorm",
    pronunciation: "/ˈθʌndərstɔːrm/",
    definition: "A storm with thunder, lightning, heavy rain, and strong winds",
    example:
      "During the thunderstorm, we saw bright flashes of lightning in the sky",
    funFact: "Lightning is five times hotter than the surface of the sun!",
    emoji: "⛈️",
    category: "weather",
    difficulty: "medium",
    imageUrl: undefined,
  },
  {
    id: 34,
    word: "tornado",
    pronunciation: "/tɔːrˈneɪdoʊ/",
    definition: "A spinning column of air that can be very destructive",
    example:
      "The tornado spun rapidly across the field, picking up dust and debris",
    funFact: "Tornadoes can spin at speeds of over 300 miles per hour!",
    emoji: "🌪️",
    category: "weather",
    difficulty: "hard",
    imageUrl: undefined,
  },

  // ADVENTURE/GENERAL - Mixed Levels
  {
    id: 35,
    word: "adventure",
    pronunciation: "/ədˈven(t)SHər/",
    definition:
      "An exciting or unusual experience, often involving exploration or discovery",
    example: "Reading books takes you on amazing adventures to new worlds",
    funFact:
      "The word 'adventure' comes from Latin 'adventurus' meaning 'about to arrive'",
    emoji: "🗺️",
    category: "adventure",
    difficulty: "medium",
    imageUrl: undefined,
  },
  {
    id: 36,
    word: "magnificent",
    pronunciation: "/mæɡˈnɪfɪsənt/",
    definition: "Extremely beautiful, impressive, or grand in scale",
    example: "The magnificent castle stood tall against the mountain backdrop",
    funFact: "The word comes from Latin 'magnificus' meaning 'great in deed'",
    emoji: "✨",
    category: "adventure",
    difficulty: "hard",
    imageUrl: undefined,
  },
  {
    id: 37,
    word: "treasure",
    pronunciation: "/ˈtreʒər/",
    definition:
      "Something very valuable, like gold, jewels, or something precious to you",
    example: "The pirates buried their treasure on a secret island",
    funFact:
      "The most expensive treasure ever found was worth over 500 million dollars!",
    emoji: "💎",
    category: "adventure",
    difficulty: "easy",
    imageUrl: undefined,
  },
  {
    id: 38,
    word: "exploration",
    pronunciation: "/ˌekspləˈreɪʃən/",
    definition:
      "The act of traveling to new places to learn about and discover them",
    example:
      "Space exploration has taught us amazing things about other planets",
    funFact:
      "Only about 20% of Earth's oceans have been explored - there's still so much to discover!",
    emoji: "🧭",
    category: "adventure",
    difficulty: "hard",
    imageUrl: undefined,
  },

  // COLORS - Easy Level
  {
    id: 39,
    word: "turquoise",
    pronunciation: "/ˈtɜːrkwɔɪz/",
    definition: "A blue-green color like tropical ocean water",
    example:
      "The turquoise water was so clear you could see the fish swimming below",
    funFact:
      "Turquoise is both a color and a precious stone that was treasured by ancient civilizations!",
    emoji: "💎",
    category: "colors",
    difficulty: "medium",
    imageUrl: undefined,
  },
  {
    id: 40,
    word: "crimson",
    pronunciation: "/ˈkrɪmzən/",
    definition: "A deep, rich red color",
    example: "The crimson sunset painted the sky in beautiful shades of red",
    funFact: "Crimson dye originally came from tiny insects called cochineal!",
    emoji: "❤️",
    category: "colors",
    difficulty: "medium",
    imageUrl: undefined,
  },
];

// Helper functions to filter words by category and difficulty
export const getWordsByCategory = (category: string): Word[] => {
  if (category === "all") return wordsDatabase;
  return wordsDatabase.filter((word) => word.category === category);
};

export const getWordsByDifficulty = (
  difficulty: "easy" | "medium" | "hard",
): Word[] => {
  return wordsDatabase.filter((word) => word.difficulty === difficulty);
};

export const getRandomWords = (
  count: number,
  category?: string,
  difficulty?: "easy" | "medium" | "hard",
): Word[] => {
  let filteredWords = wordsDatabase;

  if (category && category !== "all") {
    filteredWords = getWordsByCategory(category);
  }

  if (difficulty) {
    filteredWords = filteredWords.filter(
      (word) => word.difficulty === difficulty,
    );
  }

  // Shuffle and return requested count
  const shuffled = [...filteredWords].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const getAllCategories = (): string[] => {
  const categories = [...new Set(wordsDatabase.map((word) => word.category))];
  return categories.sort();
};
