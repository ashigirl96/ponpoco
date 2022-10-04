import { collection, doc, Timestamp } from '@firebase/firestore'
import {
  DocumentData,
  DocumentReference,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
} from '@firebase/firestore'
import { UserId, PlaylistStore } from '@/types/playlistStore'
import { db } from '@/config/firebase'
import { PlaylistStoreId } from '@/atoms/firestore/playlist'

const playlistConverter: FirestoreDataConverter<PlaylistStore> = {
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions,
  ): PlaylistStore {
    const data = snapshot.data(options)
    return {
      id: snapshot.id,
      title: data.title,
      videoIds: data.videoIds.map((video: DocumentReference) => video.id),
      thumbnailUrl: data.thumbnailUrl,
      createdAt: data.createdAt,
    }
  },
  toFirestore(playlist: WithFieldValue<PlaylistStore>): DocumentData {
    const { title, videoIds, thumbnailUrl, createdAt } = playlist
    return {
      title,
      videoIds,
      thumbnailUrl,
      createdAt,
    }
  },
}

export const playlistCollectionRef = collection(db, 'playlists').withConverter(
  playlistConverter,
)

export function userPlaylistCollectionRef(userId: UserId) {
  return collection(db, 'users', userId, 'playlists').withConverter(
    playlistConverter,
  )
}

export const userPlaylistDocRef = function (
  userId: UserId,
  playlistId: PlaylistStoreId,
) {
  return doc(db, 'users', userId, 'playlists', playlistId).withConverter(
    playlistConverter,
  )
}

export function firestoreNow() {
  return Timestamp.now()
}
