import { useCallback, useState } from "react"
import type { ExportFormat, ExportOptions } from "@/types"
import { videoConverter } from "@/services/video/VideoConverter"

export interface UseExportReturn {
  isExporting: boolean
  progress: number
  exportVideo: (blob: Blob, format: ExportFormat) => Promise<Blob | null>
  cancelExport: () => Promise<void>

  // Agent能力：导出并触发下载
  exportAndDownload: (videoUrl: string, format: 'mp4' | 'webm') => Promise<void>
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

  // Agent能力：exportAndDownload - 导出视频并触发下载
  const exportAndDownload = useCallback(async (videoUrl: string, format: 'mp4' | 'webm'): Promise<void> => {
    try {
      // Fetch the blob from URL
      const response = await fetch(videoUrl)
      const blob = await response.blob()

      // Export to target format
      const exportedBlob = await exportVideo(blob, format)
      if (!exportedBlob) {
        throw new Error("Export failed")
      }

      // Trigger download
      const url = URL.createObjectURL(exportedBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `recording-${Date.now()}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("[useExport] exportAndDownload failed:", err)
      throw err
    }
  }, [exportVideo])

  return {
    isExporting,
    progress,
    exportVideo,
    cancelExport,
    exportAndDownload,
  }
}
