import {
  atom,
  selector,
  useRecoilCallback,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil'
import {
  playlistState,
  PlaylistStoreId,
  playlistVideosLengthState,
} from '@/atoms/firestore/playlist'
import { PlaylistFirestoreId } from '@/types'
import { VideoFirestoreId } from '@/atoms/firestore/video'
import { useCurrentPlaylistId } from '@/hooks/youtube_player'
import playlistId from '@/pages/playlists/[playlistId]'
import { useCallback } from 'react'

// TODO: YoutubeEvent['target']が入らない
// export const videoReadyEventState = atom<YouTubePlayer>({
//   key: 'videoReadyEventState',
//   default: undefined,
// })

export const currentPlaylistIdState = atom<PlaylistFirestoreId | null>({
  key: 'currentPlaylistIdState',
  default: null,
})

export const isLoopState = atom<boolean>({
  key: 'isLoopState',
  default: true,
})

export const isRandomOrderState = atom<boolean>({
  key: 'isRandomOrderState',
  default: false,
})

export const playerStatusState = atom<'pause' | 'playing' | 'ended'>({
  key: 'playerStatusState',
  default: 'ended',
})

export const currentVideoIndexState = atom<number>({
  key: 'currentVideoIndexState',
  default: 0,
})

export const currentVideoIdsState = atom<VideoFirestoreId[]>({
  key: 'currentVideoIdsState',
  default: [],
})

export const isLastVideoState = selector<boolean | null>({
  key: 'isLastVideoState',
  get: ({ get }) => {
    const playingPlaylistId = get(currentPlaylistIdState)
    if (playingPlaylistId === null) return null
    const length = get(playlistVideosLengthState(playingPlaylistId))
    if (length === null) return null
    const currentVideoIndex = get(currentVideoIndexState)
    return currentVideoIndex === length - 1
  },
})

function useIsRandomOrder() {
  return useRecoilValue(isRandomOrderState)
}

export function useSetCurrentPlaylistId() {
  return useSetRecoilState(currentPlaylistIdState)
}

export function useSetCurrentVideoIndex() {
  return useSetRecoilState(currentVideoIndexState)
}

export function useSetCurrentVideoIds() {
  return useSetRecoilState(currentVideoIdsState)
}

export function useSetCurrentVideo2() {
  return useRecoilCallback(
    ({ snapshot, set }) =>
      async (playlistId: PlaylistStoreId, videoId: VideoFirestoreId) => {
        const isRandomOrder = await snapshot.getPromise(isRandomOrderState)
        const playlist = await snapshot.getPromise(playlistState(playlistId))
        const videoIds = playlist?.videoIds || []
        const currentVideoIndex = videoIds.indexOf(videoId)
        console.log(`isRandomOrder ${isRandomOrder}`)
        console.log(`videoIds ${videoIds}`)
        console.log(`currentVideoIndex ${currentVideoIndex}`)
        set(currentPlaylistIdState, playlistId)
        set(currentVideoIndexState, currentVideoIndex)
        if (isRandomOrder) {
          set(currentVideoIdsState, videoIds)
        } else {
          set(currentVideoIdsState, videoIds)
        }
      },
    [],
  )
}

export function useSetCurrentVideo(
  playlistId: PlaylistStoreId,
  videoId: VideoFirestoreId,
) {
  const setCurrentPlaylistId = useSetCurrentPlaylistId()
  const setCurrentVideoIndex = useSetCurrentVideoIndex()
  const setCurrentVideoIds = useSetCurrentVideoIds()
  const isRandomOrder = useIsRandomOrder()
  const playlist = useRecoilValue(playlistState(playlistId))
  const videoIds = playlist?.videoIds || []
  const currentVideoIndex = videoIds.indexOf(videoId)
  console.log(`isRandomOrder ${isRandomOrder}`)
  console.log(`videoIds ${videoIds}`)
  console.log(`currentVideoIndex ${currentVideoIndex}`)

  return useCallback(() => {
    setCurrentPlaylistId(playlistId)
    setCurrentVideoIndex(currentVideoIndex)
    if (isRandomOrder) {
      setCurrentVideoIds(videoIds)
    } else {
      setCurrentVideoIds(videoIds)
    }
  }, [
    currentVideoIndex,
    isRandomOrder,
    playlistId,
    setCurrentPlaylistId,
    setCurrentVideoIds,
    setCurrentVideoIndex,
    videoIds,
  ])
}
