import { useCallback, useEffect, useRef, useState } from "react"
import type { RecordingState } from "@/types"

export interface UseRecordingReturn {
  state: RecordingState
  duration: number
  startRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
  stopRecording: () => Promise<Blob | null>
}

export function useRecording(): UseRecordingReturn {
  const [state, setState] = useState<RecordingState>("idle")
  const [duration, setDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedDurationRef = useRef<number>(0)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now() - pausedDurationRef.current * 1000
    timerRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setDuration(elapsed)
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startRecording = useCallback(() => {
    chunksRef.current = []
    pausedDurationRef.current = 0

    // Request screen capture
    navigator.mediaDevices
      .getDisplayMedia({ video: true, audio: true })
      .then((stream) => {
        const options = { mimeType: "video/webm;codecs=vp9" }
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options.mimeType = "video/webm"
        }

        const mediaRecorder = new MediaRecorder(stream, options)
        mediaRecorderRef.current = mediaRecorder

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data)
          }
        }

        mediaRecorder.onstop = () => {
          stream.getTracks().forEach((track) => track.stop())
        }

        mediaRecorder.start(100)
        setState("recording")
        startTimer()
      })
      .catch((err) => {
        console.error("Failed to start recording:", err)
        setState("idle")
      })
  }, [startTimer])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause()
      stopTimer()
      pausedDurationRef.current = duration
      setState("paused")
    }
  }, [duration, stopTimer])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume()
      startTimer()
      setState("recording")
    }
  }, [startTimer])

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null)
        return
      }

      stopTimer()
      setState("stopped")

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" })
        resolve(blob)
      }

      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      } else {
        resolve(null)
      }
    })
  }, [stopTimer])

  return {
    state,
    duration,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  }
}
