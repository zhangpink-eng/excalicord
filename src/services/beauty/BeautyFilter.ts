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

    // Apply smoothing (bilateral filter approximation for skin smoothing)
    if (settings.smoothing > 0) {
      this.applySkinSmoothing(data, imageData.width, imageData.height, settings.smoothing / 100)
    }

    // Apply whitening (exposure correction + color adjustment)
    if (settings.whitening > 0) {
      this.applyWhitening(data, settings.whitening / 100)
    }

    // Apply face slimming (simple horizontal scaling of face region)
    if (settings.faceSlimming > 0) {
      this.applyFaceSlimming(data, imageData.width, imageData.height, settings.faceSlimming / 100)
    }

    // Apply skin tone adjustment
    if (settings.skinTone !== 50) {
      this.applySkinToneAdjustment(data, imageData.width, imageData.height, settings.skinTone / 100)
    }

    return new ImageData(data, imageData.width, imageData.height)
  }

  private applySkinSmoothing(data: Uint8ClampedArray, width: number, height: number, strength: number): void {
    // Bilateral-like filter that preserves edges while smoothing
    const radius = Math.floor(strength * 3) + 2
    const tempData = new Uint8ClampedArray(data)
    const sigma = strength * 0.5

    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        let r = 0, g = 0, b = 0, weightSum = 0

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4
            const centerIdx = (y * width + x) * 4

            // Spatial weight
            const spatialDist = dx * dx + dy * dy
            const spatialWeight = Math.exp(-spatialDist / (2 * sigma * sigma))

            // Range weight (intensity difference)
            const intensityDiff = Math.abs(tempData[idx] - tempData[centerIdx]) +
                                  Math.abs(tempData[idx + 1] - tempData[centerIdx + 1]) +
                                  Math.abs(tempData[idx + 2] - tempData[centerIdx + 2])
            const rangeWeight = Math.exp(-intensityDiff * intensityDiff / (2 * 30 * 30))

            const weight = spatialWeight * rangeWeight

            r += tempData[idx] * weight
            g += tempData[idx + 1] * weight
            b += tempData[idx + 2] * weight
            weightSum += weight
          }
        }

        const idx = (y * width + x) * 4
        data[idx] = r / weightSum
        data[idx + 1] = g / weightSum
        data[idx + 2] = b / weightSum
      }
    }
  }

  private applyWhitening(data: Uint8ClampedArray, strength: number): void {
    // Apply exposure correction and color shift for whitening effect
    const exposure = 1 + strength * 0.3

    for (let i = 0; i < data.length; i += 4) {
      // Exposure correction (simulate underexposure recovery)
      let r = data[i] / 255
      let g = data[i + 1] / 255
      let b = data[i + 2] / 255

      // Apply exposure
      r = r * exposure
      g = g * exposure
      b = b * exposure

      // Apply white balance correction (shift towards neutral)
      const avg = (r + g + b) / 3
      const wbStrength = strength * 0.2
      r = r + (avg - r) * wbStrength
      g = g + (avg - g) * wbStrength
      b = b + (avg - b) * wbStrength

      // Convert back and clamp
      data[i] = Math.min(255, Math.max(0, r * 255))
      data[i + 1] = Math.min(255, Math.max(0, g * 255))
      data[i + 2] = Math.min(255, Math.max(0, b * 255))
    }
  }

  private applyFaceSlimming(data: Uint8ClampedArray, width: number, height: number, strength: number): void {
    // Simple face slimming by horizontally scaling the face region
    // Assumes face is roughly in the center of the frame
    const centerX = width / 2
    const centerY = height / 2
    const faceRadiusX = width * 0.3
    const faceRadiusY = height * 0.4
    const scaleFactor = 1 - strength * 0.15 // Reduce width by up to 15%

    const tempData = new Uint8ClampedArray(data)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Check if point is in face ellipse
        const dx = (x - centerX) / faceRadiusX
        const dy = (y - centerY) / faceRadiusY
        const distSq = dx * dx + dy * dy

        if (distSq < 1) {
          // Point is inside face region - apply horizontal scaling
          const scaleDist = Math.sqrt(distSq)
          const localScale = 1 - (1 - scaleFactor) * (1 - scaleDist)

          // Calculate source x position
          const srcX = Math.round(centerX + (x - centerX) / localScale)
          const srcY = Math.round(y)

          if (srcX >= 0 && srcX < width) {
            const dstIdx = (y * width + x) * 4
            const srcIdx = (srcY * width + srcX) * 4
            data[dstIdx] = tempData[srcIdx]
            data[dstIdx + 1] = tempData[srcIdx + 1]
            data[dstIdx + 2] = tempData[srcIdx + 2]
          }
        }
      }
    }
  }

  private applySkinToneAdjustment(data: Uint8ClampedArray, _width: number, _height: number, strength: number): void {
    // Adjust warmth/coolness of the image
    const warmth = (strength - 0.5) * 30 // -15 to +15

    for (let i = 0; i < data.length; i += 4) {
      // Simple skin-tone aware adjustment
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Detect skin-like pixels (simplified)
      const isSkinLike = r > 95 && g > 40 && b > 20 &&
                         r > g && r > b &&
                         Math.abs(r - g) > 15 &&
                         r - b > 15

      if (isSkinLike) {
        // Apply stronger adjustment to skin tones
        data[i] = Math.min(255, Math.max(0, r + warmth * 1.2)) // Red
        data[i + 2] = Math.min(255, Math.max(0, b - warmth * 0.8)) // Blue
      } else {
        // Apply subtle adjustment to non-skin
        data[i] = Math.min(255, Math.max(0, r + warmth * 0.3))
        data[i + 2] = Math.min(255, Math.max(0, b - warmth * 0.2))
      }
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
