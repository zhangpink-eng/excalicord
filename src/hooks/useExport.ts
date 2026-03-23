import { useCallback, useState } from "react"
import type { ExportFormat, ExportOptions } from "@/types"
import { videoConverter } from "@/services/video/VideoConverter"

export interface UseExportReturn {
  isExporting: boolean
  progress: number
  exportVideo: (blob: Blob, format: ExportFormat) => Promise<Blob | null>
  cancelExport: () => Promise<void>
}

export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState(0)

  const exportVideo = useCallback(async (blob: Blob, format: ExportFormat): Promise<Blob | null> => {
    setIsExporting(true)
    setProgress(0)

    try {
      const options: ExportOptions = {
        format,
        quality: "high",
        fps: 30,
      }

      const result = await videoConverter.exportToBlob(blob, options, (p) => {
        setProgress(p.percent)
      })

      setProgress(100)
      return result
    } catch (err) {
      console.error("Export failed:", err)
      return null
    } finally {
      setIsExporting(false)
    }
  }, [])

  const cancelExport = useCallback(async () => {
    await videoConverter.cancel()
    setIsExporting(false)
    setProgress(0)
  }, [])

  return {
    isExporting,
    progress,
    exportVideo,
    cancelExport,
  }
}
