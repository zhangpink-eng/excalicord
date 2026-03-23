import { useTranslation } from "@/hooks/useTranslation"
import { locales } from "@/services/i18n"

export function LanguageSelector() {
  const { locale, setLocale } = useTranslation()

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as typeof locale)}
      className="text-sm border rounded px-2 py-1 bg-background hover:bg-muted transition-colors cursor-pointer"
    >
      {locales.map((l) => (
        <option key={l.value} value={l.value}>
          {l.label}
        </option>
      ))}
    </select>
  )
}
