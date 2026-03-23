import en from "./locales/en.json"
import zhCN from "./locales/zh-CN.json"

export type Locale = "en" | "zh-CN"

const translations: Record<Locale, Record<string, string>> = {
  "en": en,
  "zh-CN": zhCN,
}

let currentLocale: Locale = "en"

export function setLocale(locale: Locale): void {
  currentLocale = locale
  document.documentElement.lang = locale
}

export function getLocale(): Locale {
  return currentLocale
}

export function t(key: string, params?: Record<string, string | number>): string {
  let text = translations[currentLocale][key] || translations["en"][key] || key

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v))
    })
  }

  return text
}

export const locales: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "zh-CN", label: "简体中文" },
]
