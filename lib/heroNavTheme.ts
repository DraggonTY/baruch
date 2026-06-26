import { HERO_THEMES } from "@/lib/heroThemes";

export function getHeroNavTokens(heroThemeId: string) {
  const theme = HERO_THEMES.find((item) => item.id === heroThemeId) ?? HERO_THEMES[0];

  return {
    navLink: theme.textMuted,
    navLinkHover: theme.text,
    logoFilter: theme.logoFilter,
    heroTone: theme.heroTone,
  };
}
