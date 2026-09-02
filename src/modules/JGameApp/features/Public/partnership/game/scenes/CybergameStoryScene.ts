/**
 * CybergameStoryScene — 3 Act minh hoạ mô hình hợp tác Cybergame (lợi ích, luồng
 * tích hợp hệ thống, luồng người chơi đến quán). Icon dùng vector Lucide (sắc nét,
 * đồng nhất trên mọi trình duyệt) thay cho emoji; panel tĩnh bo góc mềm + glow nhẹ
 * cho cảm giác hiện đại, sáng — theo đúng tông tím-hồng-xanh của JGame.
 */
import Phaser from 'phaser'
import { PartnershipStoryScene } from '../PartnershipStoryScene'
import { STORY_COLORS, STORY_W } from '../theme'
import type { LucideIconName } from '../lucideIcons'
import { ACT1_BENEFITS, ACT2_INTEGRATION, ACT3_PLAYER_FLOWS } from '../script'

const ACT1_DURATION = 18500
const ACT2_DURATION = 9600
const ACT3_DURATION = 14000
const ACT2_START = ACT1_DURATION
const ACT3_START = ACT1_DURATION + ACT2_DURATION
const TOTAL_DURATION = ACT1_DURATION + ACT2_DURATION + ACT3_DURATION

const COST_COLOR = 0xf87171
// Xanh lá trầm hơn STORY_COLORS.success — dùng riêng cho nền ghế "đã có khách" để
// icon màn hình trắng nổi rõ, không bị loá như khi dùng xanh lá neon sáng.
const SEAT_ON_COLOR = 0x1b8f68

export class CybergameStoryScene extends PartnershipStoryScene {
  protected metricLabel = 'Doanh thu quán'
  protected iconNames: LucideIconName[] = [
    'monitor', 'zap', 'users', 'building-2', 'user', 'smartphone', 'bell', 'check',
    'clipboard-list', 'key-round', 'wrench', 'gamepad-2', 'wallet', 'gift', 'tag', 'calendar', 'headphones',
  ]

  constructor() {
    super('cybergame-story')
  }

  protected playTimeline(): number {
    this.playAct1()
    this.playAct2()
    this.playAct3()
    return TOTAL_DURATION
  }

  // ── ACT 1 — Lợi ích hợp tác ──────────────────────────────────────────
  private playAct1() {
    const group = this.add.container(0, 0)
    this.time.delayedCall(0, () => this.titleText.setText('💡 ' + ACT1_BENEFITS.title))

    // Phòng máy (trái)
    group.add(this.roundedPanel(230, 300, 380, 300, STORY_COLORS.panel, 0.55, STORY_COLORS.idle, 20))
    const seats: Phaser.GameObjects.Rectangle[] = []
    const cols = 4, rows = 2
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 90 + c * 90
        const y = 220 + r * 110
        const seat = this.add.rectangle(x, y, 68, 50, STORY_COLORS.idle).setStrokeStyle(1, 0x5b4a86)
        group.add(seat)
        // withGlow=false + tint trắng trung tính — icon phải đọc rõ trên cả nền ghế
        // trống (tím tối) lẫn ghế đã có khách (xanh lá), glow sẽ gây loá trên nền sáng.
        group.add(this.addIcon(x, y, 'monitor', 22, 0xffffff, false))
        seats.push(seat)
      }
    }
    const roomLabel = this.add.text(230, 130, 'Phòng máy — Giờ thấp điểm', { fontFamily: 'Be Vietnam Pro, sans-serif', fontSize: '14px', color: '#c9bfe0' }).setOrigin(0.5)
    group.add(roomLabel)

    // Đồng hồ + chi phí (phải)
    const clockX = 700, clockY = 190
    const clockFace = this.add.circle(clockX, clockY, 46, STORY_COLORS.panel).setStrokeStyle(2, STORY_COLORS.accent2)
    const hand = this.add.rectangle(clockX, clockY, 4, 32, 0xffffff).setOrigin(0.5, 1)
    group.add(clockFace); group.add(hand)
    this.glow(clockFace, STORY_COLORS.accent2)
    group.add(this.add.text(clockX, clockY + 70, '14:00', { fontSize: '14px', color: '#c9bfe0' }).setOrigin(0.5))

    const costIcons: { x: number; icon: LucideIconName; label: string }[] = [
      { x: 570, icon: 'zap', label: 'Điện' },
      { x: 700, icon: 'users', label: 'Nhân sự' },
      { x: 840, icon: 'building-2', label: 'Mặt bằng' },
    ]
    const costGroups: Phaser.GameObjects.Text[] = []
    costIcons.forEach(c => {
      group.add(this.addIcon(c.x, 306, c.icon, 18, COST_COLOR))
      const t = this.add.text(c.x, 330, c.label, { fontSize: '13px', color: '#f87171' }).setOrigin(0.5)
      group.add(t)
      costGroups.push(t)
    })

    const brandBadge = this.add.text(700, 60, 'JGame', {
      fontFamily: 'Be Vietnam Pro, sans-serif', fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
      backgroundColor: '#7c3aed', padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setAlpha(0)
    group.add(brandBadge)

    const comboTag = this.add.text(0, 0, '+ Combo', {
      fontSize: '13px', color: '#0f0620', backgroundColor: '#22d3ee', padding: { x: 8, y: 3 },
    }).setOrigin(0.5).setAlpha(0)
    group.add(comboTag)

    // Cộng đồng JGame (giữa, giữa phòng máy và đồng hồ) — nguồn khách hàng mới
    // (Lợi ích 2) và điểm đến remarketing (Lợi ích 3).
    const communityX = 480
    const communityPanel = this.add.rectangle(communityX, 280, 100, 220, STORY_COLORS.panel, 0.85)
      .setStrokeStyle(2, STORY_COLORS.idle).setAlpha(0)
    const communityLabel = this.add.text(communityX, 148, 'Cộng đồng\nJGame', {
      fontSize: '11px', color: '#c9bfe0', align: 'center',
    }).setOrigin(0.5).setAlpha(0)
    const communityLabelIcon = this.addIcon(communityX, 128, 'users', 16, STORY_COLORS.primary).setAlpha(0)
    const avatarSpots = [200, 250, 300].map(y => this.addIcon(communityX, y, 'user', 20, STORY_COLORS.primary).setAlpha(0))
    const communityApp = this.addIcon(communityX, 355, 'smartphone', 20, STORY_COLORS.accent2).setAlpha(0)
    group.add(communityPanel); group.add(communityLabel); group.add(communityLabelIcon); group.add(communityApp)
    avatarSpots.forEach(a => group.add(a))

    const idleColor = Phaser.Display.Color.ValueToColor(STORY_COLORS.idle)
    const successColor = Phaser.Display.Color.ValueToColor(SEAT_ON_COLOR)
    const litUpSeat = (seat: Phaser.GameObjects.Rectangle) => {
      this.tweens.addCounter({
        from: 0, to: 100, duration: 300,
        onUpdate: tw => seat.setFillStyle(Phaser.Display.Color.Interpolate.ColorWithColor(
          idleColor, successColor, 100, tw.getValue() ?? 0,
        ).color),
      })
    }

    // Timeline Act 1
    this.time.delayedCall(200, () => {
      this.tweens.add({ targets: hand, angle: 130, duration: 1200, ease: 'Sine.easeInOut' })
    })
    this.time.delayedCall(0, () => this.showCaption(ACT1_BENEFITS.captions[0].text))
    this.time.delayedCall(ACT1_BENEFITS.captions[1].at, () => {
      this.showCaption(ACT1_BENEFITS.captions[1].text)
      costGroups.forEach((t, i) => {
        this.tweens.add({ targets: t, scale: 1.15, duration: 260, yoyo: true, repeat: 2, delay: i * 120 })
      })
    })
    this.time.delayedCall(ACT1_BENEFITS.captions[2].at, () => {
      this.showCaption(ACT1_BENEFITS.captions[2].text)
      this.tweens.add({ targets: brandBadge, alpha: 1, y: 90, duration: 500, ease: 'Back.easeOut' })
      seats.slice(0, 6).forEach((seat, i) => {
        this.time.delayedCall(300 + i * 180, () => litUpSeat(seat))
      })
      this.setMetric(1240000)
    })
    this.time.delayedCall(ACT1_BENEFITS.captions[3].at, () => {
      this.showCaption(ACT1_BENEFITS.captions[3].text)
      comboTag.setPosition(90, 188).setAlpha(0)
      this.tweens.add({ targets: comboTag, alpha: 1, y: 172, duration: 400, ease: 'Back.easeOut' })
    })

    // Lợi ích 2 — Phát triển khách hàng mới từ cộng đồng gamer JGame: cụm cộng
    // đồng xuất hiện, 2 avatar tách ra "đi" tới 2 ghế trống cuối cùng trong phòng.
    this.time.delayedCall(ACT1_BENEFITS.captions[4].at, () => {
      this.showCaption(ACT1_BENEFITS.captions[4].text)
      this.tweens.add({ targets: [communityPanel, communityLabel, communityLabelIcon, communityApp, ...avatarSpots], alpha: 1, duration: 400, ease: 'Sine.easeOut' })

      const remainingSeats = seats.slice(6, 8)
      const remainingTargets = [{ x: 270, y: 330 }, { x: 360, y: 330 }]
      remainingSeats.forEach((seat, i) => {
        this.time.delayedCall(600 + i * 350, () => {
          const traveler = this.addIcon(communityX, 250, 'user', 18, STORY_COLORS.primary)
          group.add(traveler)
          this.tweens.add({
            targets: traveler,
            x: remainingTargets[i].x,
            y: remainingTargets[i].y,
            duration: 750,
            ease: 'Sine.easeInOut',
            onComplete: () => { traveler.destroy(); litUpSeat(seat) },
          })
        })
      })
    })

    // Lợi ích 3 — Remarketing: gửi thông báo ưu đãi ngược lại cộng đồng JGame để
    // mời khách quay lại chơi ở khung giờ thấp điểm tiếp theo.
    this.time.delayedCall(ACT1_BENEFITS.captions[5].at, () => {
      this.showCaption(ACT1_BENEFITS.captions[5].text)
      communityPanel.setStrokeStyle(3, STORY_COLORS.accent2)
      this.tweens.add({ targets: communityPanel, scale: 1.06, duration: 220, yoyo: true })

      const bell = this.addIcon(communityX, 200, 'bell', 22, STORY_COLORS.accent)
      group.add(bell)
      this.tweens.add({
        targets: bell,
        x: 230,
        y: 170,
        duration: 900,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          bell.destroy()
          const popup = this.add.text(230, 172, '🔁 Khách quay lại', {
            fontSize: '12px', color: '#0f0620', backgroundColor: '#f9d976', padding: { x: 8, y: 3 },
          }).setOrigin(0.5).setAlpha(0)
          group.add(popup)
          this.tweens.add({ targets: popup, alpha: 1, y: 158, duration: 350, ease: 'Back.easeOut' })
        },
      })
    })

    this.fadeOutGroup(group, ACT1_DURATION - 700)
  }

  // Di chuyển 1 chấm tròn qua nhiều chặng (toạ độ gãy khúc) tuần tự.
  private tweenPath(target: Phaser.GameObjects.Arc, legs: { x: number; y: number; duration: number }[], onDone?: () => void) {
    let i = 0
    const next = () => {
      if (i >= legs.length) { onDone?.(); return }
      const leg = legs[i]
      this.tweens.add({ targets: target, x: leg.x, y: leg.y, duration: leg.duration, ease: 'Sine.easeInOut', onComplete: () => { i++; next() } })
    }
    next()
  }

  private highlightNode(circle: Phaser.GameObjects.Arc, label: Phaser.GameObjects.Text) {
    this.tweens.add({ targets: circle, scale: 1.3, duration: 250, yoyo: true, ease: 'Back.easeOut' })
    circle.setStrokeStyle(3, STORY_COLORS.accent)
    this.glow(circle, STORY_COLORS.accent)
    label.setColor('#ffffff')
  }

  // ── ACT 2 — Luồng tích hợp hệ thống (3 giai đoạn) ─────────────────────
  private playAct2() {
    this.time.delayedCall(ACT2_START, () => this.titleText.setText('🔌 ' + ACT2_INTEGRATION.title))

    this.time.delayedCall(ACT2_START, () => {
      const group = this.add.container(0, 0)
      const P1X = 180, P2X = 480, P3X = 780
      const JX = 330, MX = 630
      const PANEL_TOP = 95, PANEL_BOTTOM = 425, PANEL_Y = (PANEL_TOP + PANEL_BOTTOM) / 2
      const PANEL_W = 260, PANEL_H = PANEL_BOTTOM - PANEL_TOP

      // 3 khung giai đoạn
      ;[
        { x: P1X, title: ACT2_INTEGRATION.phase1.title },
        { x: P2X, title: ACT2_INTEGRATION.phase2.title },
        { x: P3X, title: ACT2_INTEGRATION.phase3.title },
      ].forEach(p => {
        group.add(this.roundedPanel(p.x, PANEL_Y, PANEL_W, PANEL_H, STORY_COLORS.panel, 0.35, STORY_COLORS.idle, 18))
        group.add(this.add.text(p.x, PANEL_TOP + 16, p.title, { fontSize: '12px', fontStyle: 'bold', color: '#ffffff', align: 'center' }).setOrigin(0.5))
      })

      // Đường nối: Giai đoạn 1 (tuần tự) → tách 2 luồng song song ở Giai đoạn 2 → hợp nhất về Giai đoạn 3
      const drawPath = (points: [number, number][]) => {
        const g = this.add.graphics().setDepth(1)
        g.lineStyle(2, STORY_COLORS.idle, 0.7)
        g.beginPath()
        g.moveTo(points[0][0], points[0][1])
        points.slice(1).forEach(([x, y]) => g.lineTo(x, y))
        g.strokePath()
        group.add(g)
      }
      const p1Y = [165, 265, 365]
      const p2Y = [190, 330]
      const p3Y = 260
      drawPath([[P1X, p1Y[0]], [P1X, p1Y[1]], [P1X, p1Y[2]]])
      drawPath([[P1X, p1Y[2]], [JX, p1Y[2]], [JX, PANEL_Y]])
      drawPath([[JX, PANEL_Y], [JX, p2Y[0]], [P2X, p2Y[0]]])
      drawPath([[JX, PANEL_Y], [JX, p2Y[1]], [P2X, p2Y[1]]])
      drawPath([[P2X, p2Y[0]], [MX, p2Y[0]], [MX, PANEL_Y]])
      drawPath([[P2X, p2Y[1]], [MX, p2Y[1]], [MX, PANEL_Y]])
      drawPath([[MX, PANEL_Y], [P3X, p3Y]])

      const makeNode = (x: number, y: number, icon: LucideIconName, iconColor: number, label: string) => {
        const circle = this.add.circle(x, y, 22, STORY_COLORS.panel).setStrokeStyle(2, STORY_COLORS.idle).setDepth(2)
        const iconImg = this.addIcon(x, y, icon, 20, iconColor).setDepth(3)
        const labelText = this.add.text(x, y + 34, label, { fontSize: '11px', color: '#c9bfe0' }).setOrigin(0.5).setDepth(2)
        group.add(circle); group.add(iconImg); group.add(labelText)
        return { circle, label: labelText }
      }

      // Node Giai đoạn 1 — 3 bước tuần tự
      const p1Nodes = ACT2_INTEGRATION.phase1.steps.map((step, i) => makeNode(P1X, p1Y[i], step.icon as LucideIconName, STORY_COLORS.accent2, step.label))

      // Node Giai đoạn 2 — 2 luồng song song (Cybergame / Người chơi JGame)
      const p2LaneColors = [STORY_COLORS.accent2, STORY_COLORS.primary]
      const p2Nodes = ACT2_INTEGRATION.phase2.lanes.map((lane, i) => makeNode(P2X, p2Y[i], lane.icon as LucideIconName, p2LaneColors[i], lane.label))

      // Node Giai đoạn 3 — Đối soát
      const p3Step = ACT2_INTEGRATION.phase3.steps[0]
      const p3Node = makeNode(P3X, p3Y, p3Step.icon as LucideIconName, STORY_COLORS.success, p3Step.label)

      const HOLD = 900
      let t = 0

      // Giai đoạn 1 — chấm di chuyển tuần tự qua 3 bước
      const dot = this.add.circle(P1X, p1Y[0], 8, STORY_COLORS.accent2).setDepth(4)
      group.add(dot)
      this.glow(dot, STORY_COLORS.accent2)
      this.time.delayedCall(t, () => {
        this.highlightNode(p1Nodes[0].circle, p1Nodes[0].label)
        this.showCaption(ACT2_INTEGRATION.phase1.steps[0].caption)
      })
      t += HOLD
      for (let i = 1; i < p1Y.length; i++) {
        this.time.delayedCall(t, () => this.tweenPath(dot, [{ x: P1X, y: p1Y[i], duration: 500 }]))
        t += 500
        const idx = i
        this.time.delayedCall(t, () => {
          this.highlightNode(p1Nodes[idx].circle, p1Nodes[idx].label)
          this.showCaption(ACT2_INTEGRATION.phase1.steps[idx].caption)
        })
        t += HOLD
      }

      // Chuyển sang Giai đoạn 2 — tách làm 2 chấm chạy song song
      this.time.delayedCall(t, () => this.tweenPath(dot, [{ x: JX, y: p1Y[2], duration: 300 }, { x: JX, y: PANEL_Y, duration: 300 }]))
      t += 600

      this.time.delayedCall(t, () => {
        this.showCaption(`${ACT2_INTEGRATION.phase2.lanes[0].caption} — đồng thời — ${ACT2_INTEGRATION.phase2.lanes[1].caption}`)
        const dotB = this.add.circle(JX, PANEL_Y, 8, STORY_COLORS.accent2).setDepth(4)
        group.add(dotB)
        this.glow(dotB, STORY_COLORS.accent2)
        this.tweenPath(dot, [{ x: JX, y: p2Y[0], duration: 300 }, { x: P2X, y: p2Y[0], duration: 350 }], () => this.highlightNode(p2Nodes[0].circle, p2Nodes[0].label))
        this.tweenPath(dotB, [{ x: JX, y: p2Y[1], duration: 300 }, { x: P2X, y: p2Y[1], duration: 350 }], () => {
          this.highlightNode(p2Nodes[1].circle, p2Nodes[1].label)
          this.time.delayedCall(HOLD, () => {
            // Sau khi cả 2 luồng đã tới nơi — cùng hợp nhất về Giai đoạn 3
            this.tweenPath(dot, [{ x: MX, y: p2Y[0], duration: 300 }, { x: MX, y: PANEL_Y, duration: 300 }], () => dot.destroy())
            this.tweenPath(dotB, [{ x: MX, y: p2Y[1], duration: 300 }, { x: MX, y: PANEL_Y, duration: 300 }], () => {
              dotB.destroy()
              const dotFinal = this.add.circle(MX, PANEL_Y, 8, STORY_COLORS.accent2).setDepth(4)
              group.add(dotFinal)
              this.glow(dotFinal, STORY_COLORS.accent2)
              this.tweenPath(dotFinal, [{ x: P3X, y: p3Y, duration: 350 }], () => {
                this.highlightNode(p3Node.circle, p3Node.label)
                this.showCaption(p3Step.caption)
                this.time.delayedCall(HOLD, () => this.showCaption(ACT2_INTEGRATION.outro))
              })
            })
          })
        })
      })

      this.fadeOutGroup(group, ACT2_DURATION - 700)
    })
  }

  // ── ACT 3 — Luồng người chơi tới cybergame (3 hình thức) ─────────────
  private playAct3() {
    this.time.delayedCall(ACT3_START, () => this.titleText.setText('🎮 ' + ACT3_PLAYER_FLOWS.title))

    this.time.delayedCall(ACT3_START, () => {
      const group = this.add.container(0, 0)
      const lanes = ACT3_PLAYER_FLOWS.lanes
      const laneY = [130, 260, 390]
      const laneAccent = [STORY_COLORS.accent2, STORY_COLORS.accent, STORY_COLORS.primary]
      const startX = 140
      const endX = STORY_W - 190

      // Khu "Góc Cybergame" dùng chung — nơi 3 làn cùng đổ về, thay vì 3 node
      // trừu tượng rời rạc không gắn với bối cảnh phòng máy.
      const zoneTop = laneY[0] - 58
      const zoneBottom = laneY[2] + 58
      const zoneCenterY = (zoneTop + zoneBottom) / 2
      group.add(this.roundedPanel(endX, zoneCenterY, 210, zoneBottom - zoneTop, STORY_COLORS.panel, 0.55, STORY_COLORS.accent2, 18))
      group.add(this.addIcon(endX - 54, zoneTop + 20, 'gamepad-2', 16, STORY_COLORS.accent2))
      group.add(this.add.text(endX - 8, zoneTop + 20, 'Góc Cybergame', { fontSize: '13px', fontStyle: 'bold', color: '#22d3ee' }).setOrigin(0, 0.5))

      const pods: Phaser.GameObjects.Arc[] = []
      const statusTexts: Phaser.GameObjects.Text[] = []
      lanes.forEach((lane, i) => {
        const y = laneY[i]
        // Dải nền tách 3 làn — tránh cảm giác đơn điệu/chồng lấn giữa các dòng
        group.add(this.roundedPanel((startX + endX) / 2 - 20, y, endX - startX + 80, 78, 0xffffff, 0.03, STORY_COLORS.idle, 14))

        group.add(this.roundedPanel(startX, y, 46, 46, STORY_COLORS.panel, 1, laneAccent[i], 12))
        group.add(this.addIcon(startX, y, lane.icon as LucideIconName, 22, laneAccent[i]))
        group.add(this.add.text(startX + 40, y - 30, lane.title, { fontSize: '13px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0, 0.5))
        group.add(this.add.rectangle((startX + endX) / 2 + 10, y, endX - startX - 130, 2, laneAccent[i], 0.5))

        // Pod máy chơi trong Góc Cybergame: màn hình + tai nghe + ghế — tránh
        // đè lên nhau bằng cách xếp dọc dưới pod thay vì cùng 1 hàng ngang.
        const pod = this.add.circle(endX, y, 25, STORY_COLORS.panel).setStrokeStyle(2, STORY_COLORS.idle)
        group.add(pod)
        group.add(this.addIcon(endX - 4, y - 2, 'monitor', 20, STORY_COLORS.accent2))
        group.add(this.addIcon(endX + 16, y - 16, 'headphones', 13, 0xc9bfe0))
        const status = this.add.text(endX, y + 40, 'Máy trống', { fontSize: '10px', color: '#8b7fae' }).setOrigin(0.5)
        group.add(status)
        pods.push(pod)
        statusTexts.push(status)
      })

      const laneDuration = 3200
      lanes.forEach((lane, i) => {
        const y = laneY[i]
        const startAt = i * laneDuration
        this.time.delayedCall(startAt, () => {
          this.showCaption(lane.caption)
          const mover = this.addIcon(startX + 40, y, lane.icon as LucideIconName, 22, laneAccent[i])
          group.add(mover)
          this.glow(mover, laneAccent[i])
          const bob = this.tweens.add({ targets: mover, y: y - 6, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
          this.tweens.add({
            targets: mover,
            x: endX - 34,
            duration: 1900,
            ease: 'Sine.easeInOut',
            onComplete: () => {
              bob.stop()
              mover.destroy()
              const pod = pods[i]
              pod.setStrokeStyle(3, STORY_COLORS.success)
              this.glow(pod, STORY_COLORS.success)
              this.tweens.add({ targets: pod, scale: 1.2, duration: 220, yoyo: true })
              statusTexts[i].setText('🟢 Đang chơi').setColor('#34d399')
              const check = this.addIcon(endX - 30, y - 30, 'check', 16, STORY_COLORS.success).setAlpha(0)
              group.add(check)
              this.tweens.add({ targets: check, alpha: 1, y: y - 38, duration: 300, ease: 'Back.easeOut' })
            },
          })
        })
      })

      this.time.delayedCall(lanes.length * laneDuration + 400, () => {
        this.showCaption(ACT3_PLAYER_FLOWS.outro)
        this.setMetric(this.metricValue + 860000)
      })

      this.fadeOutGroup(group, ACT3_DURATION - 900, 700)
    })
  }
}
