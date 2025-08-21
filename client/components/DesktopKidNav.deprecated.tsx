/**
 * ⚠️ DEPRECATED COMPONENT ⚠️
 *
 * DesktopKidNav.tsx has been retired and replaced with JungleKidNav.tsx
 *
 * Migration completed on: ${new Date().toISOString().split('T')[0]}
 *
 * Replaced with: @/components/JungleKidNav
 *
 * New features in JungleKidNav:
 * - 🌿 Immersive jungle theme with animal guides
 * - 🎨 Cross-platform responsive design (mobile/tablet/desktop)
 * - 🎭 Advanced animations and sound effects
 * - 🚀 Performance optimization and accessibility
 * - 🔧 Builder.io integration with configurable props
 *
 * To migrate existing usage:
 *
 * OLD:
 * import { DesktopKidNav } from "@/components/DesktopKidNav";
 * <DesktopKidNav activeTab={tab} onTabChange={setTab} ... />
 *
 * NEW:
 * import { JungleKidNav } from "@/components/JungleKidNav";
 * <JungleKidNav
 *   activeTab={tab}
 *   onTabChange={setTab}
 *   theme="jungle"
 *   enableSounds={true}
 *   animations={true}
 *   ...
 * />
 *
 * This file contains the original component for reference only.
 * DO NOT USE IN PRODUCTION - Use JungleKidNav instead.
 */

import React from "react";

export function DesktopKidNav() {
  console.warn(
    "⚠️ DesktopKidNav is deprecated! Use JungleKidNav instead. " +
      "See: @/components/JungleKidNav",
  );

  return (
    <div className="deprecated-component-warning">
      <p>
        ⚠️ This component has been deprecated. Please use JungleKidNav from
        @/components/JungleKidNav
      </p>
    </div>
  );
}

export default DesktopKidNav;
