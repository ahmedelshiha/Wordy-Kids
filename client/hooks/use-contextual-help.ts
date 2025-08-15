import { useMemo } from "react";

export type ContextualPage =
  | "home"
  | "games"
  | "library"
  | "progress"
  | "admin"
  | "vowel-rescue"
  | "word-garden"
  | "flashcard-duel"
  | "quiz-games";

export interface HelpContent {
  tutorial: {
    title: string;
    message: string;
  };
  gameHelp: {
    title: string;
    message: string;
  };
  settings: {
    title: string;
    message: string;
  };
  contact: {
    title: string;
    message: string;
  };
  accessibility: {
    title: string;
    message: string;
  };
  achievements: {
    title: string;
    message: string;
  };
}

export function useContextualHelp(currentPage: ContextualPage): HelpContent {
  return useMemo(() => {
    const helpContent: Record<ContextualPage, HelpContent> = {
      home: {
        tutorial: {
          title: "How to Play 📚",
          message:
            "Welcome! Tap games to play, browse the word library, and track your progress. Use voice commands by saying words out loud!",
        },
        gameHelp: {
          title: "Game Tips 🎮",
          message:
            "• Vowel Rescue: Listen and fill in missing vowels\n• Word Garden: Grow words by spelling correctly\n• Flashcard Duel: Quick vocabulary challenges\n• Adventure Mode: Complete learning quests",
        },
        settings: {
          title: "Settings & Controls ⚙️",
          message:
            "Customize sounds, difficulty levels, and visual preferences to make learning perfect for you!",
        },
        contact: {
          title: "Get Support 💬",
          message:
            "Need help? Check the settings for volume controls, or ask a grown-up to help you with the games!",
        },
        accessibility: {
          title: "Accessibility Features 🔊",
          message:
            "• Voice pronunciation for all words\n• Large touch targets\n• High contrast mode\n• Adjustable volume and sounds\n• Screen reader support",
        },
        achievements: {
          title: "Track Your Progress 🏆",
          message:
            "View your achievements, learning streaks, and see how many words you've mastered!",
        },
      },
      games: {
        tutorial: {
          title: "Game Controls 🎮",
          message:
            "• Tap to select answers\n• Use the speaker button to hear words\n• Watch for visual feedback\n• Take your time - learning is fun!",
        },
        gameHelp: {
          title: "Game Tips 💡",
          message:
            "• Listen carefully to the word pronunciation\n• Look at the picture for clues\n• Try different vowels if you're unsure\n• Use the hint button after 3 tries",
        },
        settings: {
          title: "Game Settings ⚙️",
          message:
            "Adjust game speed, sound effects, and difficulty to match your learning level!",
        },
        contact: {
          title: "Need Game Help? 🤔",
          message:
            "Stuck on a word? That's okay! Try the hint button or ask for help. Learning takes practice!",
        },
        accessibility: {
          title: "Game Accessibility 🎯",
          message:
            "• Audio pronunciation for every word\n• Large, easy-to-tap buttons\n• Visual feedback for correct/incorrect answers\n• No time pressure on easy mode",
        },
        achievements: {
          title: "Game Progress 📈",
          message:
            "Complete games to earn points, unlock achievements, and track your learning journey!",
        },
      },
      "vowel-rescue": {
        tutorial: {
          title: "Vowel Rescue Guide 🎯",
          message:
            "1. Look at the emoji picture\n2. Listen to the word pronunciation\n3. Tap the missing vowel letters (A, E, I, O, U)\n4. Complete the word to rescue it!",
        },
        gameHelp: {
          title: "Vowel Rescue Tips 💡",
          message:
            "• Sound out the word slowly\n• Think about how your mouth moves when saying vowels\n• A = 'ah', E = 'eh', I = 'ih', O = 'oh', U = 'uh'\n• Use the picture as a clue!",
        },
        settings: {
          title: "Vowel Game Settings ⚙️",
          message:
            "Adjust difficulty to change how many vowels are missing, or enable hints for extra help!",
        },
        contact: {
          title: "Vowel Help 🤗",
          message:
            "Remember: vowels are the 'singing' letters! They make the sounds that help words flow together.",
        },
        accessibility: {
          title: "Vowel Game Access 🔊",
          message:
            "• Tap the speaker to hear the word again\n• Each vowel button is large and easy to tap\n• Visual feedback shows correct/incorrect choices\n• Take as much time as you need!",
        },
        achievements: {
          title: "Vowel Mastery 🏆",
          message:
            "Rescue more vowels to earn points! Perfect games unlock special achievements!",
        },
      },
      "word-garden": {
        tutorial: {
          title: "Word Garden Guide 🌱",
          message:
            "Plant and grow words by spelling them correctly! Watch your garden bloom with knowledge!",
        },
        gameHelp: {
          title: "Garden Tips 🌺",
          message:
            "• Start with shorter words\n• Use letter sounds to build words\n• Water your words by spelling correctly\n• Collect flowers as rewards!",
        },
        settings: {
          title: "Garden Settings 🌻",
          message:
            "Choose your garden theme, adjust growth speed, and select word categories to plant!",
        },
        contact: {
          title: "Garden Help 🌿",
          message:
            "Growing words takes practice! Don't worry if some plants take time to bloom.",
        },
        accessibility: {
          title: "Garden Access 🌼",
          message:
            "• Large letter buttons for easy tapping\n• Audio pronunciation for each word\n• Visual growth progress\n• No time limits on planting",
        },
        achievements: {
          title: "Master Gardener 🏅",
          message:
            "Grow different types of words to become a master gardener and unlock new garden themes!",
        },
      },
      "flashcard-duel": {
        tutorial: {
          title: "Flashcard Duel Guide ⚡",
          message:
            "Quick vocabulary challenges! Answer fast to score more points and become a word champion!",
        },
        gameHelp: {
          title: "Duel Tips 🥇",
          message:
            "• Read the word quickly\n• Trust your first instinct\n• Use picture clues\n• Speed improves with practice!",
        },
        settings: {
          title: "Duel Settings ⚔️",
          message:
            "Adjust time limits, difficulty level, and choose specific word categories for your duels!",
        },
        contact: {
          title: "Duel Help 🛡️",
          message:
            "Fast-paced learning can be challenging! Start with easier words and work your way up.",
        },
        accessibility: {
          title: "Duel Access ⚡",
          message:
            "• Clear, large text for quick reading\n• Audio support for every word\n• Pause option available\n• Adjustable time limits",
        },
        achievements: {
          title: "Duel Champion 🏆",
          message:
            "Win duels to earn champion points and unlock faster challenge modes!",
        },
      },
      "quiz-games": {
        tutorial: {
          title: "Quiz Games Guide 📝",
          message:
            "Test your knowledge with fun quizzes! Multiple choice, true/false, and matching games await!",
        },
        gameHelp: {
          title: "Quiz Tips 🧠",
          message:
            "• Read all options carefully\n• Use elimination for multiple choice\n• Picture clues help with meaning\n• Learn from incorrect answers!",
        },
        settings: {
          title: "Quiz Settings 📊",
          message:
            "Choose quiz types, set question counts, and select topics that interest you most!",
        },
        contact: {
          title: "Quiz Help ❓",
          message:
            "Quizzes help reinforce learning! Don't worry about perfect scores - focus on learning new things.",
        },
        accessibility: {
          title: "Quiz Access 📖",
          message:
            "• Large, clear text for all questions\n• Audio reading of questions and answers\n• No rush - take your time\n• Review mode available",
        },
        achievements: {
          title: "Quiz Master 🎓",
          message:
            "Complete quizzes to demonstrate your knowledge and unlock advanced question types!",
        },
      },
      library: {
        tutorial: {
          title: "Word Library Guide 📚",
          message:
            "Explore thousands of words! Search by category, difficulty, or just browse to discover new vocabulary!",
        },
        gameHelp: {
          title: "Library Tips 🔍",
          message:
            "• Use filters to find specific word types\n• Tap words to hear pronunciation\n• Save favorites for later practice\n• Explore different categories",
        },
        settings: {
          title: "Library Settings 📖",
          message:
            "Customize your library view, set pronunciation speed, and choose display preferences!",
        },
        contact: {
          title: "Library Help 📋",
          message:
            "Can't find a word? Try different search terms or browse by category to discover new vocabulary!",
        },
        accessibility: {
          title: "Library Access 🔊",
          message:
            "• Audio pronunciation for every word\n• Large text display options\n• Easy navigation controls\n• Search and filter support",
        },
        achievements: {
          title: "Word Explorer 🗺️",
          message:
            "Discover new words to earn explorer badges and unlock special word collections!",
        },
      },
      progress: {
        tutorial: {
          title: "Progress Tracking 📈",
          message:
            "See your learning journey! Track achievements, view statistics, and celebrate your growth!",
        },
        gameHelp: {
          title: "Progress Tips 📊",
          message:
            "• Check daily for new achievements\n• Review weak areas for practice\n• Celebrate milestones\n• Set learning goals",
        },
        settings: {
          title: "Progress Settings 🎯",
          message:
            "Customize progress views, set goal reminders, and choose which stats to display!",
        },
        contact: {
          title: "Progress Help 📉",
          message:
            "Progress tracking helps you see improvement over time. Every small step counts toward your learning goals!",
        },
        accessibility: {
          title: "Progress Access 📋",
          message:
            "• Visual and audio progress reports\n• Large charts and clear statistics\n• Simple navigation through data\n• Achievement celebrations",
        },
        achievements: {
          title: "Achievement Hunter 🏅",
          message:
            "View all available achievements and track your progress toward earning them!",
        },
      },
      admin: {
        tutorial: {
          title: "Admin Dashboard 👨‍💼",
          message:
            "Manage learning settings, view detailed analytics, and customize the educational experience!",
        },
        gameHelp: {
          title: "Admin Features 🔧",
          message:
            "• Monitor learning progress\n• Adjust difficulty settings\n• Manage content libraries\n• Generate progress reports",
        },
        settings: {
          title: "Admin Settings ⚙️",
          message:
            "Configure system-wide settings, user permissions, and educational parameters!",
        },
        contact: {
          title: "Admin Support 📞",
          message:
            "Access advanced support options and administrative resources for optimal learning management!",
        },
        accessibility: {
          title: "Admin Accessibility 🛠️",
          message:
            "• Advanced accessibility controls\n• System-wide preference management\n• Compliance monitoring tools\n• User assistance features",
        },
        achievements: {
          title: "Admin Analytics 📊",
          message:
            "View comprehensive achievement analytics and learning progress across all users!",
        },
      },
    };

    return helpContent[currentPage] || helpContent.home;
  }, [currentPage]);
}
