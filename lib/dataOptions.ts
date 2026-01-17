import { prisma } from "./prisma";

export type DataOption = {
  key: string;
  labelEn: string;
  labelAr: string | null;
};

let optionsCache: Record<string, DataOption[]> = {};
let cacheTimestamp = 0;
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

export async function getDataOptions(category: string): Promise<DataOption[]> {
  const now = Date.now();
  
  if (optionsCache[category] && now - cacheTimestamp < CACHE_TTL) {
    return optionsCache[category];
  }

  const options = await prisma.dataOption.findMany({
    where: { category, isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { key: true, labelEn: true, labelAr: true },
  });

  optionsCache[category] = options;
  cacheTimestamp = now;

  return options;
}

export async function getDataOption(category: string, key: string): Promise<DataOption | null> {
  const option = await prisma.dataOption.findUnique({
    where: { category_key: { category, key } },
    select: { key: true, labelEn: true, labelAr: true },
  });

  return option;
}

export function getOptionLabel(option: DataOption | null | undefined, locale: "en" | "ar" = "en"): string {
  if (!option) return "";
  return locale === "ar" && option.labelAr ? option.labelAr : option.labelEn;
}

export function invalidateOptionsCache() {
  optionsCache = {};
  cacheTimestamp = 0;
}
