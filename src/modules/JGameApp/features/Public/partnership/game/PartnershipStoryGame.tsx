/**
 * PartnershipStoryGame — Khung nhúng game 2D Phaser dùng chung cho cả 3 trang chi
 * tiết Đối tác (Cybergame/Affiliate/GameDev). Auto-play, loop, chỉ có nút
 * Phát/Tạm dừng — không có gameplay tương tác, đúng tinh thần "video tự động phát".
 * `loadScene`/`sceneKey` do từng trang truyền vào để chọn đúng Scene minh hoạ.
 */
import { useEffect, useRef, useState } from 'react'
import type { Scene } from 'phaser'
import { Pause, Play } from 'lucide-react'

interface PartnershipStoryGameProps {
  loadScene: () => Promise<{ new (): Scene }>
  sceneKey: string
}

export function PartnershipStoryGame({ loadScene, sceneKey }: PartnershipStoryGameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)
  const [playing, setPlaying] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let disposed = false

    void (async () => {
      const [{ default: Phaser }, SceneClass] = await Promise.all([import('phaser'), loadScene()])
      if (disposed || !containerRef.current) return

      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: 960,
        height: 540,
        backgroundColor: '#150829',
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        scene: [SceneClass],
      })
      setReady(true)
    })()

    return () => {
      disposed = true
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneKey])

  const togglePlay = () => {
    const game = gameRef.current
    if (!game) return
    const scene = game.scene.keys[sceneKey]
    if (!scene) return
    if (playing) scene.scene.pause()
    else scene.scene.resume()
    setPlaying(v => !v)
  }

  return (
    <div className='relative overflow-hidden rounded-2xl border border-white/10 jgame-gradient-brand p-[1.5px]'>
      <div className='relative aspect-video w-full overflow-hidden rounded-[15px] bg-[#150829]'>
        <div ref={containerRef} className='h-full w-full [&_canvas]:h-full [&_canvas]:w-full' />
        {!ready && (
          <div className='absolute inset-0 flex items-center justify-center text-sm text-white/60'>
            Đang tải minh hoạ...
          </div>
        )}
        {ready && (
          <button
            type='button'
            onClick={togglePlay}
            className='absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70'
            aria-label={playing ? 'Tạm dừng minh hoạ' : 'Phát minh hoạ'}
            data-qa={`btn_toggle_story_${sceneKey}`}
          >
            {playing ? <Pause className='h-4 w-4' /> : <Play className='h-4 w-4' />}
          </button>
        )}
      </div>
    </div>
  )
}
