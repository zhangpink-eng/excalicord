import { useCallback, useEffect, useState } from "react"

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
  startCamera: () => Promise<void>
  startMic: () => Promise<void>
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

  // Enumerate devices
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

  const startCamera = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const constraints: MediaStreamConstraints = {
        video: selectedCamera
          ? { deviceId: { exact: selectedCamera } }
          : { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setCameraStream(stream)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to access camera")
      console.error("Camera error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [selectedCamera])

  const startMic = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const constraints: MediaStreamConstraints = {
        audio: selectedMic
          ? { deviceId: { exact: selectedMic } }
          : { echoCancellation: true, noiseSuppression: true },
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setMicStream(stream)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to access microphone")
      console.error("Microphone error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [selectedMic])

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }
  }, [cameraStream])

  const stopMic = useCallback(() => {
    if (micStream) {
      micStream.getTracks().forEach((track) => track.stop())
      setMicStream(null)
    }
  }, [micStream])

  const selectCamera = useCallback(async (deviceId: string) => {
    setSelectedCamera(deviceId)
    if (cameraStream) {
      stopCamera()
      await startCamera()
    }
  }, [cameraStream, stopCamera, startCamera])

  const selectMic = useCallback(async (deviceId: string) => {
    setSelectedMic(deviceId)
    if (micStream) {
      stopMic()
      await startMic()
    }
  }, [micStream, stopMic, startMic])

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
