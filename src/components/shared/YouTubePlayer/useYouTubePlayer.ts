import { ChangeEvent, useCallback } from 'react'
import { YouTubeEvent, YouTubePlayerType } from '@/types'
import { getPlayerStateKey, getPropsOptions } from '@/lib/youtube'
import {
  useCandidateVideoValue,
  useCurrentPlayerStatus,
  useCurrentVideoId,
  useCurrentVolumeValue,
  useSetCurrentPlayerStatus,
  useSetCurrentVolume,
  useSetNextVideo,
  useSetPreviousVideo,
  useSetToggleLoop,
  useSetToggleRandomOrder,
} from '@/atoms/youtubePlayer'
import { useVideoValue } from '@/atoms/firestore/video'

export function useHandleStateChange() {
  const setNextVideo = useSetNextVideo()
  const setCurrentPlayerStatus = useSetCurrentPlayerStatus()
  return useCallback(
    async (readyEvent: YouTubePlayerType | undefined) => {
      if (readyEvent) {
        const status = getPlayerStateKey(await readyEvent.getPlayerState())
        setCurrentPlayerStatus(status)
        switch (status) {
          case 'BUFFERING':
            break
          case 'PAUSED':
            break
          case 'VIDEO_CUED':
            break
          case 'UN_STARTED':
            break
          case 'ENDED':
            await setNextVideo()
            break
          case 'PLAYING':
            break
        }
      }
    },
    [setCurrentPlayerStatus, setNextVideo],
  )
}

export type YouTubePlayerArgs = {
  handleReady: (x: YouTubeEvent) => void
}
// TODO: レンダリング多すぎるような気もするから問題の箇所を見つける
export function useYouTubePlayer({ handleReady }: YouTubePlayerArgs) {
  const handleStateChange = useHandleStateChange()
  const video = useCandidateVideoValue()

  // TODO: リファクタリング
  let videoId = ''
  let opts = undefined
  if (video) {
    const { videoId: _videoId, start, end } = video
    opts = getPropsOptions({ start, end, controls: 0 })
    videoId = _videoId
  }
  console.log(`video ${video?.title}, videoId ${videoId}`)

  return {
    videoId,
    opts,
    handleStateChange,
    handleReady,
  }
}

export function useHandleTogglePlay(readyEvent: YouTubePlayerType | undefined) {
  const currentPlayerStatus = useCurrentPlayerStatus()
  const setNextVideo = useSetNextVideo()
  const _setPreviousVideo = useSetPreviousVideo()
  const setLoop = useSetToggleLoop()
  const setRandomOrder = useSetToggleRandomOrder()
  const currentVideoId = useCurrentVideoId()
  const video = useVideoValue(currentVideoId)
  const setPreviousVideo = useCallback(async () => {
    if (video && readyEvent) {
      const now = await readyEvent.getCurrentTime()
      const { start } = video
      const startedDuration = now - start
      if (startedDuration <= 2) {
        _setPreviousVideo()
        return
      }
      await readyEvent.seekTo(start, true)
    }
  }, [_setPreviousVideo, readyEvent, video])

  return [
    currentPlayerStatus,
    useCallback(async () => {
      if (readyEvent) {
        switch (currentPlayerStatus) {
          case 'PAUSED':
            await readyEvent.playVideo()
            break
          case 'PLAYING':
            await readyEvent.pauseVideo()
            break
          default:
            break
        }
      }
    }, [currentPlayerStatus, readyEvent]),
    setNextVideo,
    setPreviousVideo,
    setLoop,
    setRandomOrder,
    readyEvent,
  ] as const
}

export function useHandleVolume(readyEvent: YouTubePlayerType | undefined) {
  const setCurrentVolume = useSetCurrentVolume()
  const currentVolume = useCurrentVolumeValue()

  // TODO: リファクタリング
  return [
    // volume
    currentVolume,
    // set volume function
    useCallback(
      async (event: ChangeEvent<HTMLInputElement>) => {
        if (readyEvent) {
          const _volume = Number(event.currentTarget.value)
          setCurrentVolume(_volume)
          if (_volume !== 0 && (await readyEvent.isMuted())) {
            await readyEvent.unMute()
          }
          await readyEvent.setVolume(_volume)
        }
      },
      [readyEvent, setCurrentVolume],
    ),
    // mute function
    useCallback(async () => {
      if (readyEvent) {
        setCurrentVolume(0)
        await readyEvent.mute()
      }
    }, [readyEvent, setCurrentVolume]),
    // unMute function
    useCallback(async () => {
      if (readyEvent) {
        await readyEvent.unMute()
        setCurrentVolume(await readyEvent.getVolume())
      }
    }, [readyEvent, setCurrentVolume]),
  ] as const
}
