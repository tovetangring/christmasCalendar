import type { Door } from '../../types'

type VideoDoorData = Extract<Door, { type: 'video' }>

// A YouTube video in a candy-cane frame, with a plain link underneath in case the embed is blocked
// (some browsers, ad blockers and videos with embedding switched off show a blank player).
export function VideoDoor({ door }: { door: VideoDoorData }) {
  const origin = encodeURIComponent(window.location.origin)
  return (
    <>
    <div className="candy-frame">
      <div className="video">
        <iframe
          src={`https://www.youtube.com/embed/${door.youtubeId}?rel=0&playsinline=1&origin=${origin}`}
          title={door.title ?? 'Julvideo'}
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
    <p className="hint">
      Syns inte videon?{' '}
      <a href={`https://www.youtube.com/watch?v=${door.youtubeId}`} target="_blank" rel="noreferrer">
        Öppna den på YouTube
      </a>
    </p>
    </>
  )
}
