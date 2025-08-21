import { Builder } from "@builder.io/react";
import JungleAdventureNavV2 from "../components/JungleAdventureNavV2";

Builder.registerComponent(JungleAdventureNavV2, {
  name: "JungleAdventureNavV2",
  inputs: [
    { name: "activeId", type: "string", defaultValue: "home" },
    { name: "pauseAnimations", type: "boolean", defaultValue: false },
    { name: "iconSize", type: "number", defaultValue: 52, helperText: "Icon size (px)" },
    { name: "iconLift", type: "number", defaultValue: 18, helperText: "Raise icons above the bar (px)" },
    { name: "mobileBarHeight", type: "number", defaultValue: 64 },
    { name: "desktopBarHeight", type: "number", defaultValue: 72 },
  ],
});
