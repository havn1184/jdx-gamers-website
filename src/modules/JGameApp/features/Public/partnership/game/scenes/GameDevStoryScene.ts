/**
 * GameDevStoryScene — Minh hoạ luồng hợp tác Nhà phát triển game: đăng nhiệm vụ →
 * người chơi thật trải nghiệm → nhận JCoin + phản hồi thật gửi lại developer.
 * Vòng lặp đơn ~15s. Icon vector Lucide thay cho emoji để đồng nhất, sắc nét.
 */
import { PartnershipStoryScene } from '../PartnershipStoryScene'
import { STORY_COLORS, STORY_W } from '../theme'
import type { LucideIconName } from '../lucideIcons'
import { GAMEDEV_STORY } from '../script'

const DURATION = 15000
const BOARD_X = STORY_W / 2
const BOARD_Y = 190
const PLAYERS_Y = 340
const STAR_COLOR = 0xf9d976

export class GameDevStoryScene extends PartnershipStoryScene {
  protected metricLabel = 'JCoin đã thưởng'
  protected metricSuffix = ' JCoin'
  protected iconNames: LucideIconName[] = ['user', 'clipboard-list', 'gamepad-2', 'star', 'coins', 'chart-column']

  constructor() {
    super('gamedev-story')
  }

  protected playTimeline(): number {
    this.titleText.setText('🕹️ ' + GAMEDEV_STORY.title)
    const group = this.add.container(0, 0)

    const devX = 110, devY = 190
    group.add(this.addIcon(devX, devY, 'user', 32, STORY_COLORS.primary))
    group.add(this.add.text(devX, devY + 34, 'Nhà phát triển', { fontSize: '12px', color: '#c9bfe0' }).setOrigin(0.5))

    const board = this.roundedPanel(BOARD_X, BOARD_Y, 220, 90, STORY_COLORS.panel, 0.6, STORY_COLORS.idle, 16)
    group.add(board)
    group.add(this.add.text(BOARD_X, BOARD_Y - 60, 'Chợ nhiệm vụ JGame', { fontSize: '13px', color: '#c9bfe0' }).setOrigin(0.5))
    const taskIcon = this.addIcon(BOARD_X, BOARD_Y, 'clipboard-list', 24, STORY_COLORS.accent2).setAlpha(0)
    group.add(taskIcon)

    const playerX = [BOARD_X - 200, BOARD_X, BOARD_X + 200]
    const players: Phaser.GameObjects.Image[] = []
    playerX.forEach(x => {
      const p = this.addIcon(x, PLAYERS_Y + 80, 'gamepad-2', 24, STORY_COLORS.primary).setAlpha(0)
      group.add(p)
      players.push(p)
    })

    this.time.delayedCall(0, () => {
      this.showCaption(GAMEDEV_STORY.captions[0].text)
      const card = this.addIcon(devX, devY, 'clipboard-list', 20, STORY_COLORS.accent2)
      group.add(card)
      this.tweens.add({
        targets: card, x: BOARD_X, y: BOARD_Y, duration: 900, ease: 'Sine.easeInOut',
        onComplete: () => { card.destroy(); taskIcon.setAlpha(1) },
      })
    })

    this.time.delayedCall(GAMEDEV_STORY.captions[1].at, () => {
      this.showCaption(GAMEDEV_STORY.captions[1].text)
      this.tweens.add({ targets: board, scale: 1.05, duration: 220, yoyo: true, repeat: 1 })
    })

    this.time.delayedCall(GAMEDEV_STORY.captions[2].at, () => {
      this.showCaption(GAMEDEV_STORY.captions[2].text)
      players.forEach((p, i) => {
        this.time.delayedCall(i * 280, () => {
          p.setAlpha(1)
          this.tweens.add({
            targets: p, y: PLAYERS_Y, duration: 700, ease: 'Sine.easeOut',
            onComplete: () => {
              this.tweens.add({ targets: p, scale: 1.3, duration: 200, yoyo: true, onYoyo: () => p.setTexture('star').setTint(STAR_COLOR) })
            },
          })
        })
      })
    })

    this.time.delayedCall(GAMEDEV_STORY.captions[3].at, () => {
      this.showCaption(GAMEDEV_STORY.captions[3].text)
      players.forEach((p, i) => {
        this.time.delayedCall(i * 220, () => {
          const coin = this.addIcon(BOARD_X, BOARD_Y, 'coins', 16, STORY_COLORS.success)
          group.add(coin)
          this.tweens.add({ targets: coin, x: p.x, y: PLAYERS_Y, duration: 600, ease: 'Sine.easeIn', onComplete: () => coin.destroy() })
        })
      })
      const report = this.addIcon(BOARD_X, BOARD_Y, 'chart-column', 18, STORY_COLORS.accent2)
      group.add(report)
      this.tweens.add({ targets: report, x: devX, y: devY, duration: 900, ease: 'Sine.easeInOut', onComplete: () => report.destroy() })
      this.setMetric(1800)
    })

    this.fadeOutGroup(group, DURATION - 900, 700)
    return DURATION
  }
}
