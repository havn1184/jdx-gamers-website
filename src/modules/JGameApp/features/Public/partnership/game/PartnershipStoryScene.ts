/**
 * PartnershipStoryScene — Lớp nền dùng chung cho 3 Scene minh hoạ hợp tác
 * (Cybergame/Affiliate/GameDev): khung tiêu đề + caption + chỉ số đếm dồn ở góc
 * trên + hiệu ứng fade rồi tự `scene.restart()` khi hết kịch bản. Mỗi Scene con
 * chỉ cần cài `playTimeline()` để dựng animation riêng và trả về tổng thời lượng.
 *
 * Icon dùng chung: nạp vector Lucide (xem `lucideIcons.ts`) làm texture trắng rồi
 * tô màu bằng `setTint()` — sắc nét, đồng nhất trên mọi trình duyệt, thay cho
 * emoji. Scene con khai báo `iconNames` cần dùng, gọi `addIcon()` để vẽ.
 */
import Phaser from 'phaser'
import { STORY_COLORS, STORY_H, STORY_W } from './theme'
import { iconSvgDataUri, type LucideIconName } from './lucideIcons'

export abstract class PartnershipStoryScene extends Phaser.Scene {
  protected captionText!: Phaser.GameObjects.Text
  protected titleText!: Phaser.GameObjects.Text
  protected metricText!: Phaser.GameObjects.Text
  protected metricValue = 0

  protected abstract metricLabel: string
  protected metricSuffix = 'đ'

  /** Danh sách icon Lucide scene con cần dùng — khai báo để `preload()` nạp texture. */
  protected iconNames: LucideIconName[] = []

  preload() {
    this.iconNames.forEach(name => {
      if (this.textures.exists(name)) return
      this.load.svg(name, iconSvgDataUri(name, 96), { width: 96, height: 96 })
    })
  }

  create() {
    this.cameras.main.setBackgroundColor(STORY_COLORS.bg)
    this.metricValue = 0

    this.titleText = this.add.text(24, 20, '', {
      fontFamily: 'Be Vietnam Pro, Segoe UI, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff',
    })

    this.metricText = this.add.text(STORY_W - 24, 20, '', {
      fontFamily: 'Be Vietnam Pro, Segoe UI, sans-serif',
      fontSize: '15px',
      color: '#f9d976',
    }).setOrigin(1, 0)
    this.updateMetricLabel(0)

    const captionBg = this.add.rectangle(STORY_W / 2, STORY_H - 46, STORY_W - 48, 56, 0x000000, 0.35)
      .setStrokeStyle(1, STORY_COLORS.primary, 0.6).setDepth(90)
    this.captionText = this.add.text(STORY_W / 2, STORY_H - 46, '', {
      fontFamily: 'Be Vietnam Pro, Segoe UI, sans-serif',
      fontSize: '17px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: STORY_W - 96 },
    }).setOrigin(0.5).setDepth(91)
    void captionBg

    const fadeOverlay = this.add.rectangle(STORY_W / 2, STORY_H / 2, STORY_W, STORY_H, 0x000000, 0).setDepth(100)

    const total = this.playTimeline()

    this.time.delayedCall(total - 900, () => {
      this.tweens.add({ targets: fadeOverlay, fillAlpha: 1, duration: 900, ease: 'Sine.easeIn' })
    })
    this.time.delayedCall(total + 300, () => this.scene.restart())
  }

  /** Dựng toàn bộ animation/caption theo timeline tuyệt đối (ms) — trả về tổng thời lượng. */
  protected abstract playTimeline(): number

  /**
   * Vẽ 1 icon Lucide (texture trắng, đã nạp qua `iconNames`) tại (x,y), tô màu bằng tint.
   * `withGlow=false` khi icon nằm trên nền đã tô màu đặc (ví dụ ghế máy) — glow cộng thêm
   * ánh sáng sẽ làm nền bị loá, chỉ nên bật glow cho icon trên nền tối/trong suốt.
   */
  protected addIcon(x: number, y: number, name: LucideIconName, size = 24, color: number = 0xffffff, withGlow = true): Phaser.GameObjects.Image {
    const img = this.add.image(x, y, name).setDisplaySize(size, size).setTint(color)
    if (withGlow) this.glow(img, color)
    return img
  }

  /** Hiệu ứng phát sáng nhẹ (glow FX, chỉ khả dụng ở WebGL) cho icon/node — tạo cảm giác "sáng", hiện đại. */
  protected glow(obj: Phaser.GameObjects.Image | Phaser.GameObjects.Arc, color: number = STORY_COLORS.accent2, strength = 0.6) {
    try {
      obj.postFX?.addGlow(color, 0, 0, false, 0.1, 10 * strength)
    } catch {
      // Canvas renderer không hỗ trợ postFX — bỏ qua, không ảnh hưởng animation
    }
  }

  /** Card bo góc mềm (Graphics) thay cho Rectangle phẳng — dùng cho panel/pod trong scene. */
  protected roundedPanel(x: number, y: number, w: number, h: number, fillColor: number, fillAlpha = 0.45, strokeColor: number = STORY_COLORS.idle, radius = 16): Phaser.GameObjects.Graphics {
    const g = this.add.graphics()
    g.fillStyle(fillColor, fillAlpha)
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, radius)
    g.lineStyle(1.5, strokeColor, 0.8)
    g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, radius)
    return g
  }

  protected showCaption(text: string) {
    this.captionText.setAlpha(0)
    this.captionText.setText(text)
    this.tweens.add({ targets: this.captionText, alpha: 1, duration: 300, ease: 'Sine.easeOut' })
  }

  private updateMetricLabel(value: number) {
    this.metricText.setText(`${this.metricLabel}: ${Math.round(value).toLocaleString('vi-VN')}${this.metricSuffix}`)
  }

  protected setMetric(value: number, duration = 1800) {
    const obj = { v: this.metricValue }
    this.tweens.add({
      targets: obj,
      v: value,
      duration,
      ease: 'Sine.easeOut',
      onUpdate: () => this.updateMetricLabel(obj.v),
      onComplete: () => { this.metricValue = value },
    })
  }

  protected fadeOutGroup(group: Phaser.GameObjects.Container, atMs: number, duration = 600) {
    this.time.delayedCall(atMs, () => {
      this.tweens.add({ targets: group, alpha: 0, duration, onComplete: () => group.destroy(true) })
    })
  }
}
