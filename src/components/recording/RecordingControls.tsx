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

      {/* Duration - only show when recording */}
      {isRecording && (
        <div className="font-mono text-sm text-recording">
          {formatDuration(duration)}
        </div>
      )}
    </div>
  )
}
