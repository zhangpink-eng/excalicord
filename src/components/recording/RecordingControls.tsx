import { Button } from "@/components/ui"
import type { RecordingState } from "@/types"

interface RecordingControlsProps {
  state: RecordingState
  duration: number
  onRecord: () => void
  onStop: () => void
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
}: RecordingControlsProps) {
  const isRecording = state === "recording"
  const isPaused = state === "paused"
  const isCountdown = state === "countdown"

  return (
    <div className="h-full flex items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        {isRecording || isPaused ? (
          <Button
            variant={isRecording ? "default" : "secondary"}
            onClick={onRecord}
          >
            {isRecording ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                Pause
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
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Resume
              </>
            )}
          </Button>
        ) : (
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
        )}
        {(isRecording || isPaused) && (
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
        <div className="font-mono text-sm">
          <span className={isRecording ? "text-recording" : "text-muted-foreground"}>
            {formatDuration(duration)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </Button>
          <Button variant="ghost" size="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
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
