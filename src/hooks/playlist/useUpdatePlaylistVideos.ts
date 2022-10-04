import { useCallback } from 'react'
import { PlaylistFirestoreId } from '@/types'
import { userPlaylistDocRef } from '@/lib/firestore/playlist'
import { arrayUnion, updateDoc } from '@firebase/firestore'
import { useGetCurrentUserId } from '@/hooks/firebaseAuth'
import { videoDocRef } from '@/lib/firestore/video'

type Args = {
  videoId: string
}
export function useUpdatePlaylistVideos({ videoId }: Args) {
  const userId = useGetCurrentUserId()
  return useCallback(
    async (playlistId: PlaylistFirestoreId) => {
      if (userId) {
        const playlistRef = userPlaylistDocRef(userId, playlistId)
        const videoIds = arrayUnion(videoDocRef(videoId))
        await updateDoc(playlistRef, { videoIds })
      }
    },
    [userId, videoId],
  )
}
