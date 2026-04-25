import exerciseMediaManifest from "@/media/manifests/exercise-media-manifest-v1.0.json"

export type ExerciseMediaSource = "youtube" | "manifest" | "direct" | "none"

export interface ExerciseMediaResult {
  thumbnailUrl: string | null
  tutorialUrl: string | null
  hasMedia: boolean
  source: ExerciseMediaSource
  mediaKey: string | null
  youtubeVideoId: string | null
}

export interface ExerciseMediaManifestEntry {
  media_key: string
  exercise_id?: string
  display_name?: string
  youtube_video_id?: string | null
  youtubeVideoId?: string | null
  youtube_url?: string | null
  youtubeUrl?: string | null
  thumbnail_url?: string | null
  thumbnailUrl?: string | null
  image_url?: string | null
  imageUrl?: string | null
  gif_url?: string | null
  gifUrl?: string | null
  video_url?: string | null
  videoUrl?: string | null
  demo_url?: string | null
  demoUrl?: string | null
  tutorial_url?: string | null
  tutorialUrl?: string | null
  local_path?: string | null
  localPath?: string | null
  status?: "mapped" | "missing" | "needs_review" | "local_only" | string
  review_required?: boolean
}

type ExerciseMediaLike = {
  exercise_id?: string
  exerciseId?: string
  media_key?: string
  mediaKey?: string
  youtube_video_id?: string | null
  youtubeVideoId?: string | null
  youtube_url?: string | null
  youtubeUrl?: string | null
  thumbnail_url?: string | null
  thumbnailUrl?: string | null
  image_url?: string | null
  imageUrl?: string | null
  gif_url?: string | null
  gifUrl?: string | null
  video_url?: string | null
  videoUrl?: string | null
  demo_url?: string | null
  demoUrl?: string | null
  tutorial_url?: string | null
  tutorialUrl?: string | null
  local_path?: string | null
  localPath?: string | null
}

const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/
const DEFAULT_MANIFEST = exerciseMediaManifest as ExerciseMediaManifestEntry[]

function firstString(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) return value.trim()
  }

  return null
}

export function extractYouTubeVideoId(value: string | null | undefined): string | null {
  if (!value) return null

  const trimmedValue = value.trim()
  if (YOUTUBE_ID_PATTERN.test(trimmedValue)) return trimmedValue

  try {
    const url = new URL(trimmedValue)
    const host = url.hostname.replace(/^www\./, "")

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0]
      return id && YOUTUBE_ID_PATTERN.test(id) ? id : null
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com" || host === "youtube-nocookie.com") {
      const watchId = url.searchParams.get("v")
      if (watchId && YOUTUBE_ID_PATTERN.test(watchId)) return watchId

      const parts = url.pathname.split("/").filter(Boolean)
      const embedIndex = parts.findIndex(part => part === "embed" || part === "shorts" || part === "live")
      if (embedIndex >= 0) {
        const id = parts[embedIndex + 1]
        return id && YOUTUBE_ID_PATTERN.test(id) ? id : null
      }
    }
  } catch {
    return null
  }

  return null
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  return "https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg"
}

export function getYouTubeTutorialUrl(videoId: string): string {
  return "https://www.youtube.com/watch?v=" + videoId
}

function findManifestEntry(
  exercise: ExerciseMediaLike,
  manifest: ExerciseMediaManifestEntry[] = [],
): ExerciseMediaManifestEntry | null {
  const mediaKey = firstString(exercise.media_key, exercise.mediaKey)
  const exerciseId = firstString(exercise.exercise_id, exercise.exerciseId)

  return manifest.find(entry => {
    return Boolean(
      (mediaKey && entry.media_key === mediaKey) ||
      (exerciseId && entry.exercise_id === exerciseId) ||
      (exerciseId && entry.media_key === exerciseId),
    )
  }) ?? null
}

export function getExerciseMedia(
  exercise: ExerciseMediaLike,
  manifest: ExerciseMediaManifestEntry[] = DEFAULT_MANIFEST,
): ExerciseMediaResult {
  const manifestEntry = findManifestEntry(exercise, manifest)
  const mediaKey = firstString(exercise.media_key, exercise.mediaKey, manifestEntry?.media_key)

  const directYouTubeId = firstString(exercise.youtube_video_id, exercise.youtubeVideoId)
  const manifestYouTubeId = firstString(manifestEntry?.youtube_video_id, manifestEntry?.youtubeVideoId)
  const directYouTubeUrl = firstString(exercise.youtube_url, exercise.youtubeUrl)
  const manifestYouTubeUrl = firstString(manifestEntry?.youtube_url, manifestEntry?.youtubeUrl)
  const directVideoUrl = firstString(
    exercise.video_url,
    exercise.videoUrl,
    exercise.demo_url,
    exercise.demoUrl,
    exercise.tutorial_url,
    exercise.tutorialUrl,
  )
  const manifestVideoUrl = firstString(
    manifestEntry?.video_url,
    manifestEntry?.videoUrl,
    manifestEntry?.demo_url,
    manifestEntry?.demoUrl,
    manifestEntry?.tutorial_url,
    manifestEntry?.tutorialUrl,
  )

  const explicitThumbnailUrl = firstString(
    manifestEntry?.thumbnail_url,
    manifestEntry?.thumbnailUrl,
    manifestEntry?.image_url,
    manifestEntry?.imageUrl,
    manifestEntry?.gif_url,
    manifestEntry?.gifUrl,
    manifestEntry?.local_path,
    manifestEntry?.localPath,
    exercise.thumbnail_url,
    exercise.thumbnailUrl,
    exercise.image_url,
    exercise.imageUrl,
    exercise.gif_url,
    exercise.gifUrl,
    exercise.local_path,
    exercise.localPath,
  )

  const explicitTutorialUrl = firstString(
    manifestEntry?.tutorial_url,
    manifestEntry?.tutorialUrl,
    manifestEntry?.demo_url,
    manifestEntry?.demoUrl,
    manifestEntry?.video_url,
    manifestEntry?.videoUrl,
    manifestEntry?.youtube_url,
    manifestEntry?.youtubeUrl,
    exercise.tutorial_url,
    exercise.tutorialUrl,
    exercise.demo_url,
    exercise.demoUrl,
    exercise.video_url,
    exercise.videoUrl,
    exercise.youtube_url,
    exercise.youtubeUrl,
  )

  const youtubeVideoId =
    extractYouTubeVideoId(directYouTubeId) ??
    extractYouTubeVideoId(manifestYouTubeId) ??
    extractYouTubeVideoId(directYouTubeUrl) ??
    extractYouTubeVideoId(manifestYouTubeUrl) ??
    extractYouTubeVideoId(directVideoUrl) ??
    extractYouTubeVideoId(manifestVideoUrl)

  if (youtubeVideoId) {
    return {
      thumbnailUrl: explicitThumbnailUrl ?? getYouTubeThumbnailUrl(youtubeVideoId),
      tutorialUrl: explicitTutorialUrl ?? getYouTubeTutorialUrl(youtubeVideoId),
      hasMedia: true,
      source: "youtube",
      mediaKey,
      youtubeVideoId,
    }
  }

  if (explicitThumbnailUrl || explicitTutorialUrl) {
    return {
      thumbnailUrl: explicitThumbnailUrl,
      tutorialUrl: explicitTutorialUrl,
      hasMedia: true,
      source: manifestEntry ? "manifest" : "direct",
      mediaKey,
      youtubeVideoId: null,
    }
  }

  return {
    thumbnailUrl: null,
    tutorialUrl: null,
    hasMedia: false,
    source: "none",
    mediaKey,
    youtubeVideoId: null,
  }
}
