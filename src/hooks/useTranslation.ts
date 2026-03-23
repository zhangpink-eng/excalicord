import { useCallback, useState, useEffect } from "react"
import { t, setLocale, getLocale, type Locale } from "@/services/i18n"

export interface UseTranslationReturn {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

export function useTranslation(): UseTranslationReturn {
  const [locale, setLocaleState] = useState<Locale>(getLocale())

  useEffect(() => {
    const handleLocaleChange = () => {
      setLocaleState(getLocale())
    }
    window.addEventListener("localechange", handleLocaleChange)
    return () => window.removeEventListener("localechange", handleLocaleChange)
  }, [])

  const handleSetLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale)
    setLocaleState(newLocale)
    // Force re-render by triggering a custom event
    window.dispatchEvent(new Event("localechange"))
  }, [])

  return {
    locale,
    setLocale: handleSetLocale,
    t,
  }
}
