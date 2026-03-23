import { useCallback } from "react"
import { t, setLocale, getLocale, type Locale } from "@/services/i18n"

export interface UseTranslationReturn {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

export function useTranslation(): UseTranslationReturn {
  const locale = getLocale()

  const handleSetLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale)
    // Force re-render by triggering a custom event
    window.dispatchEvent(new Event("localechange"))
  }, [])

  return {
    locale,
    setLocale: handleSetLocale,
    t,
  }
}
