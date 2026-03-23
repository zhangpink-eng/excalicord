export interface BeautySettings {
  smoothing: number // 0-100, 磨皮强度
  whitening: number // 0-100, 美白强度
  faceSlimming: number // 0-100, 瘦脸强度
  skinTone: number // 0-100, 肤色调整
}

export const defaultBeautySettings: BeautySettings = {
  smoothing: 30,
  whitening: 20,
  faceSlimming: 0,
  skinTone: 50,
}

export class BeautyFilter {
  private canvas: OffscreenCanvas | null = null
  private ctx: OffscreenCanvasRenderingContext2D | null = null

  constructor(width: number, height: number) {
    if (typeof OffscreenCanvas !== "undefined") {
      this.canvas = new OffscreenCanvas(width, height)
      this.ctx = this.canvas.getContext("2d")
    }
  }

  applyBeautyFilter(
    imageData: ImageData,
    settings: BeautySettings
  ): ImageData {
    if (!this.ctx || !this.canvas) {
      return imageData
    }

    this.canvas.width = imageData.width
    this.canvas.height = imageData.height

    // Create a copy of the image data
    const data = new Uint8ClampedArray(imageData.data)

    // Apply smoothing (simple Gaussian blur approximation)
    if (settings.smoothing > 0) {
      this.applySmoothing(data, imageData.width, imageData.height, settings.smoothing / 100)
    }

    // Apply whitening
    if (settings.whitening > 0) {
      this.applyWhitening(data, settings.whitening / 100)
    }

    // Apply skin tone adjustment
    if (settings.skinTone !== 50) {
      this.applySkinToneAdjustment(data, settings.skinTone / 100)
    }

    return new ImageData(data, imageData.width, imageData.height)
  }

  private applySmoothing(data: Uint8ClampedArray, width: number, height: number, strength: number): void {
    // Simple box blur for smoothing effect
    const radius = Math.floor(strength * 3) + 1
    const tempData = new Uint8ClampedArray(data)

    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        let r = 0, g = 0, b = 0, count = 0

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4
            r += tempData[idx]
            g += tempData[idx + 1]
            b += tempData[idx + 2]
            count++
          }
        }

        const idx = (y * width + x) * 4
        data[idx] = r / count
        data[idx + 1] = g / count
        data[idx + 2] = b / count
      }
    }
  }

  private applyWhitening(data: Uint8ClampedArray, strength: number): void {
    const factor = 1 + strength * 0.5

    for (let i = 0; i < data.length; i += 4) {
      // Apply whitening to each channel
      data[i] = Math.min(255, data[i] * factor)
      data[i + 1] = Math.min(255, data[i + 1] * factor)
      data[i + 2] = Math.min(255, data[i + 2] * factor)
    }
  }

  private applySkinToneAdjustment(data: Uint8ClampedArray, strength: number): void {
    // Warm up or cool down the image based on skin tone setting
    const warmth = strength * 10

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] + warmth) // Red
      data[i + 2] = Math.max(0, data[i + 2] - warmth) // Blue
    }
  }

  // Process a video frame with beauty effects
  processFrame(
    source: HTMLVideoElement | HTMLCanvasElement,
    settings: BeautySettings
  ): ImageData | null {
    if (!this.ctx) return null

    this.ctx.drawImage(source, 0, 0)
    const imageData = this.ctx.getImageData(0, 0, this.canvas!.width, this.canvas!.height)

    return this.applyBeautyFilter(imageData, settings)
  }
}

// Singleton for common use
let beautyFilterInstance: BeautyFilter | null = null

export function getBeautyFilter(width?: number, height?: number): BeautyFilter {
  if (!beautyFilterInstance && width && height) {
    beautyFilterInstance = new BeautyFilter(width, height)
  }
  return beautyFilterInstance!
}

export function resetBeautyFilter(): void {
  beautyFilterInstance = null
}
