import React, { useMemo } from "react";

export type OverlayProps = {
  className?: string;
  fireflies?: boolean;
  fog?: boolean;
  glow?: boolean;
  ripples?: boolean;
  seed?: number;
};

export const JungleThemeOverlay: React.FC<OverlayProps> = ({
  className,
  fireflies = true,
  fog = true,
  glow = true,
  ripples = false,
  seed = 0,
}) => {
  // Randomize slight delays to avoid uniform motion if multiple instances
  const style = useMemo(
    () => ({
      ["--seed" as any]: `${(seed % 7) + 0.1}s`,
    }),
    [seed],
  );

  return (
    <div
      className={`jng-overlays ${className || ""}`}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {fireflies && <div className="jng-layer jng-fireflies" style={style} />}
      {fog && <div className="jng-layer jng-fog" />}
      {glow && <div className="jng-layer jng-glow" />}
      {ripples && <div className="jng-layer jng-ripples" />}
    </div>
  );
};

export default JungleThemeOverlay;
