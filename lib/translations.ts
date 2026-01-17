import { prisma } from "./prisma";

export type TranslationDictionary = Record<string, string>;

let cachedTranslations: Record<string, TranslationDictionary> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export async function getTranslations(locale?: string): Promise<Record<string, TranslationDictionary>> {
  const now = Date.now();
  
  if (cachedTranslations && now - cacheTimestamp < CACHE_TTL) {
    if (locale) {
      return { [locale]: cachedTranslations[locale] || {} };
    }
    return cachedTranslations;
  }

  const translations = await prisma.translation.findMany({
    where: locale ? { locale } : undefined,
    select: { key: true, locale: true, value: true },
  });

  const result: Record<string, TranslationDictionary> = {};
  
  for (const t of translations) {
    if (!result[t.locale]) {
      result[t.locale] = {};
    }
    result[t.locale][t.key] = t.value;
  }

  cachedTranslations = result;
  cacheTimestamp = now;

  if (locale) {
    return { [locale]: result[locale] || {} };
  }

  return result;
}

export async function getTranslationsByCategory(locale: string, category?: string): Promise<TranslationDictionary> {
  const translations = await prisma.translation.findMany({
    where: {
      locale,
      ...(category ? { category } : {}),
    },
    select: { key: true, value: true },
  });

  return translations.reduce<TranslationDictionary>((acc, t) => {
    acc[t.key] = t.value;
    return acc;
  }, {});
}

export function invalidateTranslationCache() {
  cachedTranslations = null;
  cacheTimestamp = 0;
}
