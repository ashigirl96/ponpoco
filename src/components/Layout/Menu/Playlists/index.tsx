import { useUserPlaylists, usePlaylists } from './usePlaylists'
import { PlaylistItem } from './PlaylistItem'
import Link from 'next/link'
import { UserId } from '@/types'

type Props = {
  userId: UserId
}
export function UserPlaylists({ userId }: Props) {
  const { playlists, isLoading, error } = useUserPlaylists(userId)
  if (error) {
    return <div>error</div>
  }
  if (isLoading) {
    return <div>Loading</div>
  }
  if (!playlists) {
    return <div>Please login...</div>
  }
  return (
    <div>
      {playlists.map((playlist) => {
        return (
          <div key={`playlist-${playlist.id}`}>
            <Link href={`/playlists/${encodeURIComponent(playlist.id)}`}>
              <a>
                <PlaylistItem playlist={playlist} />
              </a>
            </Link>
          </div>
        )
      })}
    </div>
  )
}

export function Playlists() {
  const { playlists, isLoading, error } = usePlaylists()
  if (error) {
    return <div>error</div>
  }
  if (isLoading) {
    return <div>Loading</div>
  }
  if (!playlists) {
    return <div>Please login...</div>
  }
  return (
    <div>
      {playlists.map((playlist) => {
        return (
          <div key={`playlist-${playlist.id}`}>
            <Link href={`/playlists/${encodeURIComponent(playlist.id)}`}>
              <a>
                <PlaylistItem playlist={playlist} />
              </a>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
