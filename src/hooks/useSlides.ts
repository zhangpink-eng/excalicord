import { useCallback, useState } from "react"
import type { Slide } from "@/types"

export interface UseSlidesReturn {
  slides: Slide[]
  currentSlideIndex: number
  currentSlide: Slide | null
  addSlide: () => void
  removeSlide: (index: number) => void
  updateSlide: (index: number, updates: Partial<Slide>) => void
  reorderSlides: (fromIndex: number, toIndex: number) => void
  goToSlide: (index: number) => void
  nextSlide: () => void
  prevSlide: () => void
}

export function useSlides(initialSlides?: Slide[]): UseSlidesReturn {
  const [slides, setSlides] = useState<Slide[]>(
    initialSlides || [
      {
        id: "1",
        projectId: "project-1",
        position: 0,
        content: {},
        slideType: "slide",
        backgroundStyle: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
  )
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  const currentSlide = slides[currentSlideIndex] || null

  const addSlide = useCallback(() => {
    const newSlide: Slide = {
      id: String(Date.now()),
      projectId: slides[0]?.projectId || "project-1",
      position: slides.length,
      content: {},
      slideType: "slide",
      backgroundStyle: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSlides([...slides, newSlide])
    setCurrentSlideIndex(slides.length)
  }, [slides])

  const removeSlide = useCallback((index: number) => {
    if (slides.length <= 1) return
    const newSlides = slides.filter((_, i) => i !== index)
    setSlides(newSlides)
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(newSlides.length - 1)
    }
  }, [slides, currentSlideIndex])

  const updateSlide = useCallback((index: number, updates: Partial<Slide>) => {
    setSlides((prev) =>
      prev.map((slide, i) =>
        i === index
          ? { ...slide, ...updates, updatedAt: new Date().toISOString() }
          : slide
      )
    )
  }, [])

  const reorderSlides = useCallback((fromIndex: number, toIndex: number) => {
    const newSlides = [...slides]
    const [removed] = newSlides.splice(fromIndex, 1)
    newSlides.splice(toIndex, 0, removed)
    // Update positions
    const updatedSlides = newSlides.map((slide, i) => ({
      ...slide,
      position: i,
    }))
    setSlides(updatedSlides)
    setCurrentSlideIndex(toIndex)
  }, [slides])

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index)
    }
  }, [slides.length])

  const nextSlide = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1)
    }
  }, [currentSlideIndex, slides.length])

  const prevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1)
    }
  }, [currentSlideIndex])

  return {
    slides,
    currentSlideIndex,
    currentSlide,
    addSlide,
    removeSlide,
    updateSlide,
    reorderSlides,
    goToSlide,
    nextSlide,
    prevSlide,
  }
}
