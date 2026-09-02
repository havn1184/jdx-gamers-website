/**
 * AffiliateStoryScene — Minh hoạ luồng Tiếp thị liên kết: chia sẻ link → bạn bè
 * mua hàng → hoa hồng cộng dồn về ví CTV. Vòng lặp đơn ~15s. Icon vector Lucide
 * thay cho emoji để đồng nhất, sắc nét trên mọi trình duyệt.
 */
import { PartnershipStoryScene } from '../PartnershipStoryScene'
import { STORY_COLORS, STORY_W } from '../theme'
import type { LucideIconName } from '../lucideIcons'
import { AFFILIATE_STORY } from '../script'

const DURATION = 15000

const FRIENDS: { x: number; doneIcon: LucideIconName; doneColor: number; label: string }[] = [
  { x: 470, doneIcon: 'credit-card', doneColor: STORY_COLORS.accent, label: 'Nạp thẻ' },
  { x: 620, doneIcon: 'gamepad-2', doneColor: STORY_COLORS.primary, label: 'Mua vé chơi game' },
  { x: 770, doneIcon: 'headphones', doneColor: STORY_COLORS.accent2, label: 'Mua phụ kiện' },
]

export class AffiliateStoryScene extends PartnershipStoryScene {
  protected metricLabel = 'Hoa hồng CTV'
  protected iconNames: LucideIconName[] = ['user', 'wallet', 'link', 'coins', 'credit-card', 'gamepad-2', 'headphones']

  constructor() {
    super('affiliate-story')
  }

  protected playTimeline(): number {
    this.titleText.setText('🔗 ' + AFFILIATE_STORY.title)
    const group = this.add.container(0, 0)

    const ctvX = 130, ctvY = 260
    group.add(this.addIcon(ctvX, ctvY, 'user', 32, STORY_COLORS.primary))
    group.add(this.add.text(ctvX, ctvY + 34, 'Cộng tác viên', { fontSize: '12px', color: '#c9bfe0' }).setOrigin(0.5))
    const wallet = this.addIcon(STORY_W - 90, 90, 'wallet', 28, STORY_COLORS.success)
    group.add(wallet)
    group.add(this.add.text(STORY_W - 90, 118, 'Ví hoa hồng', { fontSize: '11px', color: '#c9bfe0' }).setOrigin(0.5))

    const friendIcons: Phaser.GameObjects.Image[] = []
    FRIENDS.forEach(f => {
      const icon = this.addIcon(f.x, 260, 'user', 26, STORY_COLORS.idle).setAlpha(0.5)
      const label = this.add.text(f.x, 300, '', { fontSize: '11px', color: '#22d3ee' }).setOrigin(0.5)
      group.add(icon); group.add(label)
      friendIcons.push(icon)
      icon.setData('label', label)
    })

    this.time.delayedCall(0, () => this.showCaption(AFFILIATE_STORY.captions[0].text))
    this.time.delayedCall(600, () => {
      FRIENDS.forEach((f, i) => {
        const link = this.addIcon(ctvX + 20, ctvY, 'link', 18, STORY_COLORS.accent2)
        group.add(link)
        this.tweens.add({
          targets: link,
          x: f.x,
          y: 260,
          duration: 900,
          delay: i * 220,
          ease: 'Sine.easeInOut',
          onComplete: () => { friendIcons[i].setAlpha(1); link.destroy() },
        })
      })
    })

    this.time.delayedCall(AFFILIATE_STORY.captions[1].at, () => {
      this.showCaption(AFFILIATE_STORY.captions[1].text)
      FRIENDS.forEach((f, i) => {
        this.time.delayedCall(i * 300, () => {
          const icon = friendIcons[i]
          this.tweens.add({
            targets: icon, scale: 1.3, duration: 200, yoyo: true,
            onYoyo: () => icon.setTexture(f.doneIcon).setTint(f.doneColor),
          })
          const label = icon.getData('label') as Phaser.GameObjects.Text
          label.setText(f.label)
        })
      })
    })

    this.time.delayedCall(AFFILIATE_STORY.captions[2].at, () => {
      this.showCaption(AFFILIATE_STORY.captions[2].text)
      FRIENDS.forEach((f, i) => {
        this.time.delayedCall(i * 260, () => {
          const coin = this.addIcon(f.x, 260, 'coins', 18, STORY_COLORS.success)
          group.add(coin)
          this.tweens.add({
            targets: coin,
            x: STORY_W - 90,
            y: 90,
            duration: 800,
            ease: 'Sine.easeIn',
            onComplete: () => coin.destroy(),
          })
        })
      })
      this.setMetric(486000)
      this.time.delayedCall(1200, () => this.tweens.add({ targets: wallet, scale: 1.3, duration: 200, yoyo: true }))
    })

    this.time.delayedCall(AFFILIATE_STORY.captions[3].at, () => {
      this.showCaption(AFFILIATE_STORY.captions[3].text)
    })

    this.fadeOutGroup(group, DURATION - 900, 700)
    return DURATION
  }
}
