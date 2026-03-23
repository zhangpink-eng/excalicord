import { Button } from "@/components/ui"
import type { RecordingState } from "@/types"

interface RecordingControlsProps {
  state: RecordingState
  duration: number
  onRecord: () => void
  onStop: () => void
  cameraEnabled?: boolean
  micEnabled?: boolean
  onCameraToggle?: () => void
  onMicToggle?: () => void
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function RecordingControls({
  state,
  duration,
  onRecord,
  onStop,
  cameraEnabled = false,
  micEnabled = false,
  onCameraToggle,
  onMicToggle,
}: RecordingControlsProps) {
  const isRecording = state === "recording"
  const isCountdown = state === "countdown"

  return (
    <div className="h-full flex items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        {!isRecording ? (
          <Button
            variant="recording"
            onClick={onRecord}
            disabled={isCountdown}
          >
            {isCountdown ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Starting...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="12" r="8" />
                </svg>
                Record
              </>
            )}
          </Button>
        ) : (
          <Button variant="destructive" onClick={onStop}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
            Stop
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Duration - only show when recording */}
        {isRecording && (
          <div className="font-mono text-sm text-recording">
            {formatDuration(duration)}
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCameraToggle}
            className={cameraEnabled ? "text-primary" : "text-muted-foreground"}
            title={cameraEnabled ? "关闭摄像头" : "开启摄像头"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={cameraEnabled ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMicToggle}
            className={micEnabled ? "text-primary" : "text-muted-foreground"}
            title={micEnabled ? "关闭麦克风" : "开启麦克风"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={micEnabled ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  )
}
