import { RequestHandler } from "express";
import { DemoResponse } from "@shared/api";

export const handleDemo: RequestHandler = (req, res) => {
  const response: DemoResponse = {
    message: "Hello from Express server! 🚀 Emojis work perfectly: 🎯🌟✨",
    emojiTest: {
      basic: "😀 🎉 ❤️ 🚀",
      complex: "👨‍💻 👩‍🎨 🏳️‍🌈",
      recent: "🫠 🫡 🫥 🫶",
      skinTones: "👋🏻 👋🏽 👋🏿",
      educational: "📚 🎯 🌟 ✨ 🎮 💡"
    }
  };
  res.status(200).json(response);
};
