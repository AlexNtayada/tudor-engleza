// The album stickers: a painted picture (made with Figma AI) for every lesson, the emoji if one is missing.

import { ALL_LESSONS } from '../content'

const PAINTED = import.meta.glob<string>('./sticker/*.webp', { eager: true, import: 'default' })
const lessonOf = new Map(ALL_LESSONS.map(({ lesson }) => [lesson.sticker, lesson.id]))

export function StickerArt({ sticker }: { sticker: string }) {
  const id = lessonOf.get(sticker)
  const src = id && PAINTED[`./sticker/${id}.webp`]
  if (!src) return <>{sticker}</>
  return <img className="sticker-art" src={src} alt="" draggable={false} />
}
