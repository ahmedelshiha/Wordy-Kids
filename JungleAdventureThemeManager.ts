export type JungleTheme = 'parchment' | 'jungle' | 'canopy' | 'river' | 'sunset';

const STORAGE_KEY = 'jungleTheme';

export const JungleAdventureThemeManager = {
  getTheme(): JungleTheme {
    const t = (localStorage.getItem(STORAGE_KEY) || 'jungle') as JungleTheme;
    return (['parchment','jungle','canopy','river','sunset'] as const).includes(t) ? t : 'jungle';
  },
  applyTheme(theme: JungleTheme) {
    const root = document.documentElement;
    root.classList.remove('jng-theme-parchment','jng-theme-jungle','jng-theme-canopy','jng-theme-river','jng-theme-sunset');
    root.classList.add('jng-theme-' + theme);
    localStorage.setItem(STORAGE_KEY, theme);
  },
  init() {
    this.applyTheme(this.getTheme());
  }
};
export default JungleAdventureThemeManager;