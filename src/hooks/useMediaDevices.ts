import { useCallback, useEffect, useRef, useState } from "react"

export interface MediaDevice {
  deviceId: string
  label: string
  kind: "audioinput" | "videoinput"
}

export interface UseMediaDevicesReturn {
  cameraStream: MediaStream | null
  micStream: MediaStream | null
  devices: MediaDevice[]
  isLoading: boolean
  error: string | null
  selectCamera: (deviceId: string) => Promise<void>
  selectMic: (deviceId: string) => Promise<void>
  startCamera: () => Promise<MediaStream>
  startMic: () => Promise<MediaStream>
  stopCamera: () => void
  stopMic: () => void
}

export function useMediaDevices(): UseMediaDevicesReturn {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [micStream, setMicStream] = useState<MediaStream | null>(null)
  const [devices, setDevices] = useState<MediaDevice[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCamera, setSelectedCamera] = useState<string>("")
  const [selectedMic, setSelectedMic] = useState<string>("")

  // Use refs to store streams for immediate access (bypass React state batching)
  const cameraStreamRef = useRef<MediaStream | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)

  const refreshDevices = useCallback(async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices()
      const mediaDevices: MediaDevice[] = deviceList
        .filter((d) => d.kind === "audioinput" || d.kind === "videoinput")
        .map((d) => ({
          deviceId: d.deviceId,
          label: d.label || `${d.kind} ${d.deviceId.slice(0, 8)}`,
          kind: d.kind as "audioinput" | "videoinput",
        }))
      setDevices(mediaDevices)
    } catch (err) {
      console.error("Failed to enumerate devices:", err)
    }
  }, [])

  useEffect(() => {
    refreshDevices()
    navigator.mediaDevices.addEventListener("devicechange", refreshDevices)
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", refreshDevices)
    }
  }, [refreshDevices])

  const startCamera = useCallback(async (): Promise<MediaStream> => {
    if (cameraStreamRef.current) return cameraStreamRef.current // Already running
    setIsLoading(true)
    setError(null)
    try {
      let stream: MediaStream

      // First try with specific device if selected
      if (selectedCamera) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: selectedCamera } },
          })
        } catch (firstError) {
          // Clear the invalid selection and try default
          setSelectedCamera("")
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          })
        }
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        })
      }

      cameraStreamRef.current = stream
      setCameraStream(stream)
      return stream
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to access camera")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [selectedCamera])

  const startMic = useCallback(async (): Promise<MediaStream> => {
    if (micStreamRef.current) return micStreamRef.current // Already running
    setError(null)
    try {
      let stream: MediaStream

      // First try with specific device if selected
      if (selectedMic) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: { deviceId: { exact: selectedMic } },
          })
        } catch (firstError) {
          // Clear the invalid selection and try default
          setSelectedMic("")
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          })
        }
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        })
      }

      micStreamRef.current = stream
      setMicStream(stream)
      return stream
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to access microphone")
      throw err
    }
  }, [selectedMic])

  const stopCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop())
      cameraStreamRef.current = null
      setCameraStream(null)
      console.log("Camera stopped")
    }
  }, [])

  const stopMic = useCallback(() => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop())
      micStreamRef.current = null
      setMicStream(null)
      console.log("Microphone stopped")
    }
  }, [])

  const selectCamera = useCallback(async (deviceId: string) => {
    setSelectedCamera(deviceId)
    if (cameraStreamRef.current) {
      stopCamera()
      await startCamera()
    }
  }, [stopCamera, startCamera])

  const selectMic = useCallback(async (deviceId: string) => {
    setSelectedMic(deviceId)
    if (micStreamRef.current) {
      stopMic()
      await startMic()
    }
  }, [stopMic, startMic])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
      stopMic()
    }
  }, [stopCamera, stopMic])

  return {
    cameraStream,
    micStream,
    devices,
    isLoading,
    error,
    selectCamera,
    selectMic,
    startCamera,
    startMic,
    stopCamera,
    stopMic,
  }
}
