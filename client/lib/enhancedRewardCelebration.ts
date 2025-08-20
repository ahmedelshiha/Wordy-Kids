// Enhanced Reward Celebration System for Jungle Adventure
export interface CelebrationConfig {
  type: "achievement" | "badge" | "milestone" | "level_up" | "streak" | "perfect_score";
  title: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary" | "mythic";
  duration: number; // in milliseconds
  animations: {
    primary: string;
    particles: string[];
    background: string;
    sound: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
  effects: {
    shake: boolean;
    zoom: boolean;
    glow: boolean;
    particles: boolean;
    confetti: boolean;
    fireworks: boolean;
  };
  rewards?: {
    coins: number;
    xp: number;
    items: string[];
  };
}

export interface ParticleConfig {
  type: "sparkles" | "leaves" | "fireflies" | "stars" | "hearts" | "confetti" | "coins" | "lightning";
  count: number;
  duration: number;
  color: string;
  size: "small" | "medium" | "large";
  direction: "up" | "down" | "random" | "spiral" | "explosion";
  physics: {
    gravity: number;
    bounce: number;
    fade: boolean;
  };
}

export interface CelebrationEvent {
  id: string;
  timestamp: Date;
  config: CelebrationConfig;
  context: {
    userId: string;
    sessionId?: string;
    triggeredBy: string;
    metadata: Record<string, any>;
  };
  status: "pending" | "playing" | "completed" | "cancelled";
}

export interface JungleThemeConfig {
  backgroundEffects: {
    canopyLight: boolean;
    rustlingLeaves: boolean;
    animalSounds: boolean;
    vineSwing: boolean;
  };
  creatures: {
    butterfly: boolean;
    firefly: boolean;
    monkey: boolean;
    parrot: boolean;
    tiger: boolean;
  };
  weather: {
    sunbeams: boolean;
    gentle_rain: boolean;
    rainbow: boolean;
    mist: boolean;
  };
  magical: {
    fairy_dust: boolean;
    glowing_flowers: boolean;
    ancient_runes: boolean;
    portal_effects: boolean;
  };
}

class EnhancedRewardCelebration {
  private celebrationQueue: CelebrationEvent[] = [];
  private currentCelebration: CelebrationEvent | null = null;
  private isPlaying: boolean = false;
  private celebrationContainer: HTMLElement | null = null;

  constructor() {
    this.initializeCelebrationContainer();
    this.setupEventListeners();
  }

  // Initialize celebration overlay container
  private initializeCelebrationContainer(): void {
    if (typeof window === "undefined") return;

    this.celebrationContainer = document.createElement("div");
    this.celebrationContainer.id = "celebration-overlay";
    this.celebrationContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 10000;
      overflow: hidden;
    `;
    document.body.appendChild(this.celebrationContainer);
  }

  // Set up event listeners for celebration triggers
  private setupEventListeners(): void {
    if (typeof window === "undefined") return;

    // Listen for achievement unlocks
    window.addEventListener("achievementUnlocked", this.handleAchievementUnlocked.bind(this));
    
    // Listen for badge earned
    window.addEventListener("badgeUnlocked", this.handleBadgeUnlocked.bind(this));
    
    // Listen for level up
    window.addEventListener("levelUp", this.handleLevelUp.bind(this));
    
    // Listen for milestone reached
    window.addEventListener("milestoneReached", this.handleMilestoneReached.bind(this));
    
    // Listen for perfect score
    window.addEventListener("perfectScore", this.handlePerfectScore.bind(this));
    
    // Listen for streak celebration
    window.addEventListener("streakAchieved", this.handleStreakAchieved.bind(this));
  }

  // Trigger a celebration
  public triggerCelebration(config: CelebrationConfig, context?: Partial<CelebrationEvent["context"]>): string {
    const event: CelebrationEvent = {
      id: `celebration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      config,
      context: {
        userId: "current_user",
        triggeredBy: "system",
        metadata: {},
        ...context,
      },
      status: "pending",
    };

    this.celebrationQueue.push(event);
    
    if (!this.isPlaying) {
      this.playNextCelebration();
    }

    return event.id;
  }

  // Play the next celebration in queue
  private async playNextCelebration(): Promise<void> {
    if (this.celebrationQueue.length === 0 || this.isPlaying) return;

    this.isPlaying = true;
    this.currentCelebration = this.celebrationQueue.shift()!;
    this.currentCelebration.status = "playing";

    try {
      await this.executeCelebration(this.currentCelebration);
      this.currentCelebration.status = "completed";
    } catch (error) {
      console.error("Error playing celebration:", error);
      this.currentCelebration.status = "cancelled";
    }

    this.currentCelebration = null;
    this.isPlaying = false;

    // Play next celebration if any
    if (this.celebrationQueue.length > 0) {
      setTimeout(() => this.playNextCelebration(), 500);
    }
  }

  // Execute celebration animations and effects
  private async executeCelebration(event: CelebrationEvent): Promise<void> {
    const { config } = event;

    // Create celebration overlay
    const overlay = this.createCelebrationOverlay(config);
    if (!this.celebrationContainer) return;
    
    this.celebrationContainer.appendChild(overlay);

    // Play sound effect
    this.playSound(config.animations.sound);

    // Trigger visual effects in sequence
    const effects = [];

    // 1. Background effect
    if (config.animations.background) {
      effects.push(this.playBackgroundEffect(overlay, config));
    }

    // 2. Particle effects
    if (config.effects.particles) {
      effects.push(this.playParticleEffects(overlay, config));
    }

    // 3. Main animation
    effects.push(this.playMainAnimation(overlay, config));

    // 4. Additional effects
    if (config.effects.confetti) {
      effects.push(this.playConfettiEffect(overlay, config));
    }

    if (config.effects.fireworks) {
      effects.push(this.playFireworksEffect(overlay, config));
    }

    // Wait for all effects to complete
    await Promise.all(effects);

    // Clean up
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 1000);
  }

  // Create celebration overlay element
  private createCelebrationOverlay(config: CelebrationConfig): HTMLElement {
    const overlay = document.createElement("div");
    overlay.className = "celebration-overlay";
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: ${this.getRarityBackground(config.rarity)};
      backdrop-filter: blur(2px);
      opacity: 0;
      animation: celebrationFadeIn 0.5s ease-out forwards;
    `;

    // Add celebration content
    const content = this.createCelebrationContent(config);
    overlay.appendChild(content);

    return overlay;
  }

  // Create celebration content (title, icon, description)
  private createCelebrationContent(config: CelebrationConfig): HTMLElement {
    const content = document.createElement("div");
    content.className = "celebration-content";
    content.style.cssText = `
      text-align: center;
      color: white;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
      z-index: 10;
      transform: scale(0);
      animation: celebrationContentAppear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards;
    `;

    // Icon
    const icon = document.createElement("div");
    icon.className = "celebration-icon";
    icon.style.cssText = `
      font-size: ${this.getIconSize(config.rarity)};
      margin-bottom: 1rem;
      filter: drop-shadow(0 0 20px ${config.colors.glow});
      animation: celebrationIconFloat 2s ease-in-out infinite;
    `;
    icon.textContent = config.icon;
    content.appendChild(icon);

    // Title
    const title = document.createElement("h1");
    title.className = "celebration-title";
    title.style.cssText = `
      font-size: ${this.getTitleSize(config.rarity)};
      font-weight: bold;
      margin: 0 0 0.5rem 0;
      background: linear-gradient(45deg, ${config.colors.primary}, ${config.colors.secondary});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: celebrationTitleGlow 1.5s ease-in-out infinite alternate;
    `;
    title.textContent = config.title;
    content.appendChild(title);

    // Description
    const description = document.createElement("p");
    description.className = "celebration-description";
    description.style.cssText = `
      font-size: 1.2rem;
      margin: 0 0 1.5rem 0;
      opacity: 0.9;
      max-width: 80%;
      margin-left: auto;
      margin-right: auto;
    `;
    description.textContent = config.description;
    content.appendChild(description);

    // Rewards (if any)
    if (config.rewards) {
      const rewards = this.createRewardsDisplay(config.rewards);
      content.appendChild(rewards);
    }

    return content;
  }

  // Create rewards display
  private createRewardsDisplay(rewards: NonNullable<CelebrationConfig["rewards"]>): HTMLElement {
    const rewardsContainer = document.createElement("div");
    rewardsContainer.className = "celebration-rewards";
    rewardsContainer.style.cssText = `
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
      animation: celebrationRewardsSlideUp 0.8s ease-out 1s forwards;
      opacity: 0;
      transform: translateY(20px);
    `;

    // Coins
    if (rewards.coins > 0) {
      const coinsReward = document.createElement("div");
      coinsReward.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(255, 193, 7, 0.2);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        border: 2px solid #FFC107;
      `;
      coinsReward.innerHTML = `<span style="font-size: 1.5rem;">🪙</span><span>+${rewards.coins}</span>`;
      rewardsContainer.appendChild(coinsReward);
    }

    // XP
    if (rewards.xp > 0) {
      const xpReward = document.createElement("div");
      xpReward.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(76, 175, 80, 0.2);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        border: 2px solid #4CAF50;
      `;
      xpReward.innerHTML = `<span style="font-size: 1.5rem;">⭐</span><span>+${rewards.xp} XP</span>`;
      rewardsContainer.appendChild(xpReward);
    }

    // Items
    rewards.items?.forEach(item => {
      const itemReward = document.createElement("div");
      itemReward.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(156, 39, 176, 0.2);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        border: 2px solid #9C27B0;
      `;
      itemReward.innerHTML = `<span style="font-size: 1.5rem;">🎁</span><span>${item}</span>`;
      rewardsContainer.appendChild(itemReward);
    });

    return rewardsContainer;
  }

  // Play background effect
  private async playBackgroundEffect(overlay: HTMLElement, config: CelebrationConfig): Promise<void> {
    return new Promise((resolve) => {
      const background = document.createElement("div");
      background.className = "celebration-background";
      
      let backgroundStyle = "";
      switch (config.animations.background) {
        case "jungle_canopy":
          backgroundStyle = `
            background: radial-gradient(circle at 30% 20%, rgba(76, 175, 80, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 70% 80%, rgba(255, 193, 7, 0.2) 0%, transparent 50%),
                        radial-gradient(circle at 20% 60%, rgba(139, 69, 19, 0.1) 0%, transparent 50%);
            animation: jungleCanopyAnimation 3s ease-in-out;
          `;
          break;
        case "mystical_glow":
          backgroundStyle = `
            background: radial-gradient(circle, ${config.colors.glow}20 0%, transparent 70%);
            animation: mysticalGlowAnimation 2s ease-in-out infinite alternate;
          `;
          break;
        case "starry_night":
          backgroundStyle = `
            background: radial-gradient(2px 2px at 20px 30px, #eee, transparent),
                        radial-gradient(2px 2px at 40px 70px, white, transparent),
                        radial-gradient(1px 1px at 90px 40px, #eee, transparent);
            animation: starryNightAnimation 4s linear infinite;
          `;
          break;
        default:
          backgroundStyle = `background: ${config.colors.primary}20;`;
      }
      
      background.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        ${backgroundStyle}
      `;
      
      overlay.insertBefore(background, overlay.firstChild);
      
      setTimeout(resolve, config.duration * 0.3);
    });
  }

  // Play particle effects
  private async playParticleEffects(overlay: HTMLElement, config: CelebrationConfig): Promise<void> {
    return new Promise((resolve) => {
      const particleConfigs = this.getParticleConfigs(config);
      
      particleConfigs.forEach((particleConfig, index) => {
        setTimeout(() => {
          this.createParticleSystem(overlay, particleConfig);
        }, index * 200);
      });
      
      setTimeout(resolve, config.duration * 0.8);
    });
  }

  // Create particle system
  private createParticleSystem(container: HTMLElement, config: ParticleConfig): void {
    for (let i = 0; i < config.count; i++) {
      setTimeout(() => {
        const particle = this.createParticle(config);
        container.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, config.duration);
      }, i * 50);
    }
  }

  // Create individual particle
  private createParticle(config: ParticleConfig): HTMLElement {
    const particle = document.createElement("div");
    particle.className = `particle particle-${config.type}`;
    
    const size = config.size === "small" ? "8px" : config.size === "medium" ? "12px" : "16px";
    const startX = Math.random() * window.innerWidth;
    const startY = window.innerHeight + 20;
    
    let particleContent = "";
    switch (config.type) {
      case "sparkles":
        particleContent = "✨";
        break;
      case "leaves":
        particleContent = Math.random() > 0.5 ? "🍃" : "🌿";
        break;
      case "fireflies":
        particleContent = "✨";
        break;
      case "stars":
        particleContent = Math.random() > 0.5 ? "⭐" : "🌟";
        break;
      case "hearts":
        particleContent = "💖";
        break;
      case "confetti":
        particleContent = "🎊";
        break;
      case "coins":
        particleContent = "🪙";
        break;
      case "lightning":
        particleContent = "⚡";
        break;
      default:
        particleContent = "✨";
    }
    
    particle.textContent = particleContent;
    particle.style.cssText = `
      position: absolute;
      left: ${startX}px;
      top: ${startY}px;
      font-size: ${size};
      pointer-events: none;
      z-index: 1000;
      color: ${config.color};
      filter: drop-shadow(0 0 6px ${config.color});
      animation: ${this.getParticleAnimation(config)} ${config.duration}ms ease-out forwards;
    `;
    
    return particle;
  }

  // Get particle animation based on direction
  private getParticleAnimation(config: ParticleConfig): string {
    switch (config.direction) {
      case "up":
        return "particleFloatUp";
      case "down":
        return "particleFloatDown";
      case "spiral":
        return "particleSpiral";
      case "explosion":
        return "particleExplosion";
      default:
        return "particleRandom";
    }
  }

  // Play main animation
  private async playMainAnimation(overlay: HTMLElement, config: CelebrationConfig): Promise<void> {
    return new Promise((resolve) => {
      const content = overlay.querySelector(".celebration-content") as HTMLElement;
      if (!content) {
        resolve();
        return;
      }

      // Apply effects based on config
      if (config.effects.shake) {
        content.style.animation += ", celebrationShake 0.5s ease-in-out";
      }
      
      if (config.effects.zoom) {
        content.style.animation += ", celebrationZoom 1s ease-in-out";
      }
      
      if (config.effects.glow) {
        content.style.boxShadow = `0 0 50px ${config.colors.glow}`;
      }

      setTimeout(resolve, config.duration * 0.6);
    });
  }

  // Play confetti effect
  private async playConfettiEffect(overlay: HTMLElement, config: CelebrationConfig): Promise<void> {
    return new Promise((resolve) => {
      const confettiConfig: ParticleConfig = {
        type: "confetti",
        count: 30,
        duration: 3000,
        color: config.colors.primary,
        size: "medium",
        direction: "explosion",
        physics: {
          gravity: 0.5,
          bounce: 0.3,
          fade: true,
        },
      };
      
      this.createParticleSystem(overlay, confettiConfig);
      setTimeout(resolve, confettiConfig.duration);
    });
  }

  // Play fireworks effect
  private async playFireworksEffect(overlay: HTMLElement, config: CelebrationConfig): Promise<void> {
    return new Promise((resolve) => {
      const colors = [config.colors.primary, config.colors.secondary, config.colors.accent];
      
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const fireworkConfig: ParticleConfig = {
            type: "stars",
            count: 15,
            duration: 2000,
            color: colors[i % colors.length],
            size: "large",
            direction: "explosion",
            physics: {
              gravity: 0.3,
              bounce: 0,
              fade: true,
            },
          };
          
          this.createParticleSystem(overlay, fireworkConfig);
        }, i * 500);
      }
      
      setTimeout(resolve, 3000);
    });
  }

  // Get particle configurations based on celebration type
  private getParticleConfigs(config: CelebrationConfig): ParticleConfig[] {
    const configs: ParticleConfig[] = [];
    
    switch (config.type) {
      case "achievement":
        configs.push({
          type: "sparkles",
          count: 20,
          duration: 2000,
          color: config.colors.primary,
          size: "medium",
          direction: "up",
          physics: { gravity: -0.1, bounce: 0, fade: true },
        });
        break;
        
      case "badge":
        configs.push({
          type: "stars",
          count: 15,
          duration: 2500,
          color: config.colors.accent,
          size: "large",
          direction: "spiral",
          physics: { gravity: 0, bounce: 0, fade: true },
        });
        break;
        
      case "level_up":
        configs.push({
          type: "fireflies",
          count: 25,
          duration: 3000,
          color: "#FFD700",
          size: "small",
          direction: "random",
          physics: { gravity: -0.05, bounce: 0, fade: true },
        });
        break;
        
      case "streak":
        configs.push({
          type: "lightning",
          count: 10,
          duration: 1500,
          color: "#FF5722",
          size: "large",
          direction: "down",
          physics: { gravity: 0.2, bounce: 0, fade: true },
        });
        break;
        
      default:
        configs.push({
          type: "sparkles",
          count: 15,
          duration: 2000,
          color: config.colors.primary,
          size: "medium",
          direction: "up",
          physics: { gravity: 0, bounce: 0, fade: true },
        });
    }
    
    return configs;
  }

  // Event handlers
  private handleAchievementUnlocked(event: CustomEvent): void {
    const { achievement } = event.detail;
    
    const config: CelebrationConfig = {
      type: "achievement",
      title: `Achievement Unlocked!`,
      description: achievement.name,
      icon: achievement.icon,
      rarity: this.mapDifficultyToRarity(achievement.difficulty),
      duration: 4000,
      animations: {
        primary: "zoom_in",
        particles: ["sparkles", "stars"],
        background: "jungle_canopy",
        sound: "achievement_fanfare",
      },
      colors: {
        primary: achievement.jungleTheme?.glowColor || "#4CAF50",
        secondary: "#FFC107",
        accent: "#FF9800",
        glow: achievement.jungleTheme?.glowColor || "#4CAF50",
      },
      effects: {
        shake: false,
        zoom: true,
        glow: true,
        particles: true,
        confetti: true,
        fireworks: achievement.difficulty === "legendary",
      },
      rewards: achievement.reward ? {
        coins: 0,
        xp: achievement.reward.value,
        items: [achievement.reward.item],
      } : undefined,
    };
    
    this.triggerCelebration(config, {
      triggeredBy: "achievement_system",
      metadata: { achievementId: achievement.id },
    });
  }

  private handleBadgeUnlocked(event: CustomEvent): void {
    const { badge } = event.detail;
    
    const config: CelebrationConfig = {
      type: "badge",
      title: `Badge Earned!`,
      description: badge.name,
      icon: badge.icon,
      rarity: badge.rarity,
      duration: 3500,
      animations: {
        primary: "bounce_in",
        particles: ["stars", "sparkles"],
        background: "mystical_glow",
        sound: "badge_unlock",
      },
      colors: {
        primary: badge.jungleTheme?.glowColor || "#2196F3",
        secondary: "#9C27B0",
        accent: "#E91E63",
        glow: badge.jungleTheme?.glowColor || "#2196F3",
      },
      effects: {
        shake: true,
        zoom: true,
        glow: true,
        particles: true,
        confetti: false,
        fireworks: badge.tier === "platinum",
      },
      rewards: {
        coins: badge.rewards.coins,
        xp: badge.rewards.xp,
        items: badge.rewards.special ? [badge.rewards.special.item] : [],
      },
    };
    
    this.triggerCelebration(config, {
      triggeredBy: "badge_system",
      metadata: { badgeId: badge.id },
    });
  }

  private handleLevelUp(event: CustomEvent): void {
    const { level, xpGained } = event.detail;
    
    const config: CelebrationConfig = {
      type: "level_up",
      title: `Level Up!`,
      description: `Welcome to Level ${level}!`,
      icon: "🎖️",
      rarity: "epic",
      duration: 5000,
      animations: {
        primary: "level_up_burst",
        particles: ["fireflies", "stars"],
        background: "starry_night",
        sound: "level_up_fanfare",
      },
      colors: {
        primary: "#FFD700",
        secondary: "#FF6F00",
        accent: "#FFC107",
        glow: "#FFD700",
      },
      effects: {
        shake: false,
        zoom: true,
        glow: true,
        particles: true,
        confetti: true,
        fireworks: true,
      },
      rewards: {
        coins: level * 50,
        xp: xpGained,
        items: [`Level ${level} Achievement`],
      },
    };
    
    this.triggerCelebration(config, {
      triggeredBy: "level_system",
      metadata: { newLevel: level, xpGained },
    });
  }

  private handleMilestoneReached(event: CustomEvent): void {
    const { milestone } = event.detail;
    
    const config: CelebrationConfig = {
      type: "milestone",
      title: `Milestone Reached!`,
      description: milestone.name,
      icon: milestone.icon,
      rarity: "rare",
      duration: 3000,
      animations: {
        primary: "milestone_reveal",
        particles: ["leaves", "sparkles"],
        background: "jungle_canopy",
        sound: "milestone_chime",
      },
      colors: {
        primary: "#4CAF50",
        secondary: "#8BC34A",
        accent: "#CDDC39",
        glow: "#4CAF50",
      },
      effects: {
        shake: false,
        zoom: true,
        glow: true,
        particles: true,
        confetti: false,
        fireworks: false,
      },
    };
    
    this.triggerCelebration(config, {
      triggeredBy: "milestone_system",
      metadata: { milestoneId: milestone.id },
    });
  }

  private handlePerfectScore(event: CustomEvent): void {
    const { score, gameType } = event.detail;
    
    const config: CelebrationConfig = {
      type: "perfect_score",
      title: `Perfect Score!`,
      description: `Flawless performance in ${gameType}!`,
      icon: "🎯",
      rarity: "rare",
      duration: 2500,
      animations: {
        primary: "perfect_burst",
        particles: ["stars", "sparkles"],
        background: "mystical_glow",
        sound: "perfect_score_bell",
      },
      colors: {
        primary: "#FF5722",
        secondary: "#FF9800",
        accent: "#FFC107",
        glow: "#FF5722",
      },
      effects: {
        shake: true,
        zoom: true,
        glow: true,
        particles: true,
        confetti: true,
        fireworks: false,
      },
      rewards: {
        coins: 100,
        xp: 200,
        items: ["Perfect Score Badge"],
      },
    };
    
    this.triggerCelebration(config, {
      triggeredBy: "game_system",
      metadata: { score, gameType },
    });
  }

  private handleStreakAchieved(event: CustomEvent): void {
    const { streakDays } = event.detail;
    
    const config: CelebrationConfig = {
      type: "streak",
      title: `${streakDays} Day Streak!`,
      description: `Amazing consistency! Keep it up!`,
      icon: "🔥",
      rarity: streakDays >= 30 ? "legendary" : streakDays >= 7 ? "epic" : "rare",
      duration: 3500,
      animations: {
        primary: "streak_flame",
        particles: ["lightning", "fireflies"],
        background: "mystical_glow",
        sound: "streak_achievement",
      },
      colors: {
        primary: "#FF5722",
        secondary: "#FF9800",
        accent: "#FFD700",
        glow: "#FF5722",
      },
      effects: {
        shake: false,
        zoom: true,
        glow: true,
        particles: true,
        confetti: streakDays >= 7,
        fireworks: streakDays >= 30,
      },
      rewards: {
        coins: streakDays * 10,
        xp: streakDays * 25,
        items: [`${streakDays} Day Streak Award`],
      },
    };
    
    this.triggerCelebration(config, {
      triggeredBy: "streak_system",
      metadata: { streakDays },
    });
  }

  // Helper methods
  private mapDifficultyToRarity(difficulty: string): "common" | "rare" | "epic" | "legendary" | "mythic" {
    const mapping: Record<string, "common" | "rare" | "epic" | "legendary" | "mythic"> = {
      bronze: "common",
      silver: "rare",
      gold: "epic",
      diamond: "legendary",
      legendary: "mythic",
    };
    return mapping[difficulty] || "common";
  }

  private getRarityBackground(rarity: string): string {
    const backgrounds: Record<string, string> = {
      common: "radial-gradient(circle, rgba(76, 175, 80, 0.1) 0%, rgba(0,0,0,0.3) 100%)",
      rare: "radial-gradient(circle, rgba(33, 150, 243, 0.15) 0%, rgba(0,0,0,0.3) 100%)",
      epic: "radial-gradient(circle, rgba(156, 39, 176, 0.2) 0%, rgba(0,0,0,0.3) 100%)",
      legendary: "radial-gradient(circle, rgba(255, 193, 7, 0.25) 0%, rgba(0,0,0,0.3) 100%)",
      mythic: "radial-gradient(circle, rgba(233, 30, 99, 0.3) 0%, rgba(0,0,0,0.3) 100%)",
    };
    return backgrounds[rarity] || backgrounds.common;
  }

  private getIconSize(rarity: string): string {
    const sizes: Record<string, string> = {
      common: "4rem",
      rare: "5rem",
      epic: "6rem",
      legendary: "7rem",
      mythic: "8rem",
    };
    return sizes[rarity] || sizes.common;
  }

  private getTitleSize(rarity: string): string {
    const sizes: Record<string, string> = {
      common: "2rem",
      rare: "2.5rem",
      epic: "3rem",
      legendary: "3.5rem",
      mythic: "4rem",
    };
    return sizes[rarity] || sizes.common;
  }

  private playSound(soundName: string): void {
    // Integrate with audio service
    try {
      if (typeof window !== "undefined" && (window as any).audioService) {
        (window as any).audioService.playCelebrationSound(soundName);
      }
    } catch (error) {
      console.log("Sound not available:", soundName);
    }
  }

  // Public API methods
  public cancelCelebration(celebrationId: string): boolean {
    const index = this.celebrationQueue.findIndex(event => event.id === celebrationId);
    if (index >= 0) {
      this.celebrationQueue[index].status = "cancelled";
      this.celebrationQueue.splice(index, 1);
      return true;
    }
    
    if (this.currentCelebration?.id === celebrationId) {
      this.currentCelebration.status = "cancelled";
      return true;
    }
    
    return false;
  }

  public clearQueue(): void {
    this.celebrationQueue.forEach(event => {
      event.status = "cancelled";
    });
    this.celebrationQueue = [];
  }

  public getQueueStatus(): { pending: number; playing: boolean; current: string | null } {
    return {
      pending: this.celebrationQueue.length,
      playing: this.isPlaying,
      current: this.currentCelebration?.id || null,
    };
  }

  // Inject CSS animations
  public injectCelebrationStyles(): void {
    if (typeof document === "undefined") return;

    const styleId = "celebration-animations";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes celebrationFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes celebrationContentAppear {
        from { transform: scale(0) rotate(-180deg); opacity: 0; }
        to { transform: scale(1) rotate(0deg); opacity: 1; }
      }
      
      @keyframes celebrationIconFloat {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      
      @keyframes celebrationTitleGlow {
        from { text-shadow: 0 0 20px currentColor; }
        to { text-shadow: 0 0 40px currentColor, 0 0 60px currentColor; }
      }
      
      @keyframes celebrationRewardsSlideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0px); }
      }
      
      @keyframes celebrationShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      
      @keyframes celebrationZoom {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      @keyframes particleFloatUp {
        from {
          transform: translateY(0) rotate(0deg);
          opacity: 1;
        }
        to {
          transform: translateY(-200px) rotate(360deg);
          opacity: 0;
        }
      }
      
      @keyframes particleFloatDown {
        from {
          transform: translateY(-100px) rotate(0deg);
          opacity: 1;
        }
        to {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0;
        }
      }
      
      @keyframes particleSpiral {
        from {
          transform: translate(0, 0) rotate(0deg);
          opacity: 1;
        }
        to {
          transform: translate(100px, -200px) rotate(720deg);
          opacity: 0;
        }
      }
      
      @keyframes particleExplosion {
        from {
          transform: translate(0, 0) scale(0);
          opacity: 1;
        }
        to {
          transform: translate(var(--random-x, 200px), var(--random-y, -200px)) scale(1);
          opacity: 0;
        }
      }
      
      @keyframes particleRandom {
        from {
          transform: translate(0, 0) rotate(0deg);
          opacity: 1;
        }
        to {
          transform: translate(var(--random-x, 100px), var(--random-y, -100px)) rotate(360deg);
          opacity: 0;
        }
      }
      
      @keyframes jungleCanopyAnimation {
        0% { filter: brightness(1) hue-rotate(0deg); }
        50% { filter: brightness(1.2) hue-rotate(10deg); }
        100% { filter: brightness(1) hue-rotate(0deg); }
      }
      
      @keyframes mysticalGlowAnimation {
        0% { filter: brightness(1) blur(0px); }
        100% { filter: brightness(1.5) blur(2px); }
      }
      
      @keyframes starryNightAnimation {
        from { transform: translateY(0); }
        to { transform: translateY(-100px); }
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Export singleton instance
export const enhancedRewardCelebration = new EnhancedRewardCelebration();

// Initialize styles when module loads
if (typeof window !== "undefined") {
  enhancedRewardCelebration.injectCelebrationStyles();
}
