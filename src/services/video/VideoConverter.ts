import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"
import type { ExportOptions } from "@/types"

export interface VideoConverterProgress {
  phase: "loading" | "encoding" | "muxing" | "finalizing"
  percent: number
}

export class VideoConverter {
  private ffmpeg: FFmpeg | null = null
  private isLoaded = false
  private isLoading = false
  private loadPromise: Promise<void> | null = null

  /**
   * Load FFmpeg.wasm - must be called before conversion
   */
  async load(onProgress?: (progress: VideoConverterProgress) => void): Promise<void> {
    if (this.isLoaded) return

    if (this.isLoading && this.loadPromise) {
      return this.loadPromise
    }

    this.isLoading = true

    this.loadPromise = (async () => {
      onProgress?.({ phase: "loading", percent: 0 })

      this.ffmpeg = new FFmpeg()

      // Set up progress handler
      this.ffmpeg.on("progress", ({ progress }) => {
        onProgress?.({ phase: "encoding", percent: Math.round(progress * 100) })
      })

      this.ffmpeg.on("log", ({ message }) => {
        console.log("[FFmpeg]", message)
      })

      // Load FFmpeg with CORS-enabled URLs
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm"

      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      })

      this.isLoaded = true
      this.isLoading = false
      onProgress?.({ phase: "loading", percent: 100 })
    })()

    return this.loadPromise
  }

  /**
   * Convert video blob to target format
   */
  async exportToBlob(
    videoBlob: Blob,
    options: ExportOptions,
    onProgress?: (progress: VideoConverterProgress) => void
  ): Promise<Blob> {
    if (!this.isLoaded || !this.ffmpeg) {
      await this.load(onProgress)
    }

    if (!this.ffmpeg) {
      throw new Error("FFmpeg not loaded")
    }

    const { format, quality = "high", width, height } = options

    // Write input file to FFmpeg filesystem
    const inputData = await fetchFile(videoBlob)
    await this.ffmpeg.writeFile("input.webm", inputData)

    onProgress?.({ phase: "encoding", percent: 0 })

    // Quality presets
    const qualityPresets: Record<string, { crf: string; preset: string }> = {
      low: { crf: "28", preset: "veryfast" },
      medium: { crf: "23", preset: "medium" },
      high: { crf: "18", preset: "slow" },
      ultra: { crf: "14", preset: "slower" },
    }

    const preset = qualityPresets[quality] || qualityPresets.high

    let outputFile = "output.mp4"

    if (format === "webm") {
      outputFile = "output.webm"
      await this.ffmpeg.exec([
        "-i", "input.webm",
        "-c:v", "libvpx-vp9",
        "-crf", preset.crf,
        "-b:v", "0",
        "-c:a", "libopus",
        "output.webm",
      ])
    } else if (format === "gif") {
      outputFile = "output.gif"
      await this.ffmpeg.exec([
        "-i", "input.webm",
        "-vf", "fps=15,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
        "output.gif",
      ])
    } else {
      // MP4 with H.264
      const vfParams: string[] = []
      if (width && height) {
        vfParams.push(`scale=${width}:${height}:flags=lanczos`)
      } else if (width) {
        vfParams.push(`scale=${width}:-2`)
      } else if (height) {
        vfParams.push(`scale=-2:${height}`)
      }

      const args = [
        "-i", "input.webm",
        "-c:v", "libx264",
        "-crf", preset.crf,
        "-preset", preset.preset,
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
      ]

      if (vfParams.length > 0) {
        args.push("-vf", vfParams.join(","))
      }

      args.push("output.mp4")

      await this.ffmpeg.exec(args)
    }

    onProgress?.({ phase: "finalizing", percent: 100 })

    // Read output file
    const data = await this.ffmpeg.readFile(outputFile)

    // Clean up
    await this.ffmpeg.deleteFile("input.webm")
    await this.ffmpeg.deleteFile(outputFile)

    const mimeType = format === "gif" ? "image/gif" : format === "webm" ? "video/webm" : "video/mp4"

    // Convert FileData to Blob - handle both string and Uint8Array
    let blobParts: BlobPart[]
    if (typeof data === "string") {
      blobParts = [data]
    } else {
      // Copy to a new ArrayBuffer to avoid SharedArrayBuffer type issues
      const buffer = new ArrayBuffer(data.byteLength)
      new Uint8Array(buffer).set(data)
      blobParts = [buffer]
    }
    return new Blob(blobParts, { type: mimeType })
  }

  async exportToWebM(
    videoBlob: Blob,
    onProgress?: (progress: VideoConverterProgress) => void
  ): Promise<Blob> {
    return this.exportToBlob(videoBlob, { format: "webm", quality: "high", fps: 30 }, onProgress)
  }

  async exportToMP4(
    videoBlob: Blob,
    onProgress?: (progress: VideoConverterProgress) => void
  ): Promise<Blob> {
    return this.exportToBlob(videoBlob, { format: "mp4", quality: "high", fps: 30 }, onProgress)
  }

  // Fast 480P export for quick downloads
  async exportTo480P(
    videoBlob: Blob,
    onProgress?: (progress: VideoConverterProgress) => void
  ): Promise<Blob> {
    return this.exportToBlob(videoBlob, { format: "mp4", quality: "low", fps: 30, width: 854, height: 480 }, onProgress)
  }

  async exportToGIF(
    videoBlob: Blob,
    onProgress?: (progress: VideoConverterProgress) => void
  ): Promise<Blob> {
    return this.exportToBlob(videoBlob, { format: "gif", quality: "medium", fps: 15 }, onProgress)
  }

  async cancel(): Promise<void> {
    if (this.ffmpeg) {
      // FFmpeg.wasm doesn't have a clean cancel API,
      // but we can terminate the worker
      try {
        this.ffmpeg.terminate()
      } catch {
        // Ignore
      }
      this.ffmpeg = null
      this.isLoaded = false
    }
  }

  isReady(): boolean {
    return this.isLoaded
  }
}

export const videoConverter = new VideoConverter()
