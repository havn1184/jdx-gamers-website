/**
 * useShopZonesTickets.page — Logic trang Quản lý Zone & Vé (SC-P2-S3), nhập thủ công.
 */
import { useCallback, useEffect, useState } from 'react'
import { ShopOwnerApiService } from '../services/ShopOwnerApiService'
import type { PlaytimeZone, PlaytimeTicket, ZoneType, UpsertZonePayload, UpsertTicketPayload } from '../types/shop-owner.types'

export interface ZoneFormState { id?: string; name: string; zoneType: ZoneType; specs: string; totalSeats: string }
export interface TicketFormState { id?: string; zoneId: string; hours: string; originalPrice: string; sellPrice: string; totalSlots: string; availableSlots: string; isFlashSale: boolean }

const EMPTY_ZONE_FORM: ZoneFormState = { name: '', zoneType: 'standard', specs: '', totalSeats: '' }
const EMPTY_TICKET_FORM: TicketFormState = { zoneId: '', hours: '', originalPrice: '', sellPrice: '', totalSlots: '', availableSlots: '', isFlashSale: false }

export function useShopZonesTickets() {
  const [zones, setZones] = useState<PlaytimeZone[]>([])
  const [tickets, setTickets] = useState<PlaytimeTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [zoneForm, setZoneForm] = useState<ZoneFormState>(EMPTY_ZONE_FORM)
  const [ticketForm, setTicketForm] = useState<TicketFormState>(EMPTY_TICKET_FORM)
  const [savingZone, setSavingZone] = useState(false)
  const [savingTicket, setSavingTicket] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [zonesRes, ticketsRes] = await Promise.all([ShopOwnerApiService.getZones(), ShopOwnerApiService.getTickets()])
    if (zonesRes.success && zonesRes.data) setZones(zonesRes.data)
    if (ticketsRes.success && ticketsRes.data) setTickets(ticketsRes.data)
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  const startEditZone = useCallback((zone: PlaytimeZone) => {
    setZoneForm({ id: zone.id, name: zone.name, zoneType: zone.zoneType, specs: zone.specs, totalSeats: String(zone.totalSeats) })
  }, [])
  const cancelEditZone = useCallback(() => setZoneForm(EMPTY_ZONE_FORM), [])

  const submitZone = useCallback(async () => {
    if (!zoneForm.name.trim() || Number(zoneForm.totalSeats) <= 0) return
    setSavingZone(true)
    try {
      const payload: UpsertZonePayload = { id: zoneForm.id, name: zoneForm.name.trim(), zoneType: zoneForm.zoneType, specs: zoneForm.specs.trim(), totalSeats: Number(zoneForm.totalSeats) }
      const r = await ShopOwnerApiService.upsertZone(payload)
      if (r.success) { setZoneForm(EMPTY_ZONE_FORM); await fetchData() }
    } finally {
      setSavingZone(false)
    }
  }, [zoneForm, fetchData])

  const removeZone = useCallback(async (zoneId: string) => {
    await ShopOwnerApiService.deleteZone(zoneId)
    await fetchData()
  }, [fetchData])

  const startEditTicket = useCallback((ticket: PlaytimeTicket) => {
    setTicketForm({
      id: ticket.id, zoneId: ticket.zoneId, hours: String(ticket.hours), originalPrice: String(ticket.originalPrice),
      sellPrice: String(ticket.sellPrice), totalSlots: String(ticket.totalSlots), availableSlots: String(ticket.availableSlots),
      isFlashSale: ticket.isFlashSale,
    })
  }, [])
  const cancelEditTicket = useCallback(() => setTicketForm(EMPTY_TICKET_FORM), [])

  const submitTicket = useCallback(async () => {
    if (!ticketForm.zoneId || Number(ticketForm.hours) <= 0 || Number(ticketForm.totalSlots) <= 0) return
    setSavingTicket(true)
    try {
      const payload: UpsertTicketPayload = {
        id: ticketForm.id, zoneId: ticketForm.zoneId, hours: Number(ticketForm.hours),
        originalPrice: Number(ticketForm.originalPrice) || 0, sellPrice: Number(ticketForm.sellPrice) || 0,
        totalSlots: Number(ticketForm.totalSlots), availableSlots: Number(ticketForm.availableSlots) || Number(ticketForm.totalSlots),
        isFlashSale: ticketForm.isFlashSale,
      }
      const r = await ShopOwnerApiService.upsertTicket(payload)
      if (r.success) { setTicketForm(EMPTY_TICKET_FORM); await fetchData() }
    } finally {
      setSavingTicket(false)
    }
  }, [ticketForm, fetchData])

  const removeTicket = useCallback(async (ticketId: string) => {
    await ShopOwnerApiService.deleteTicket(ticketId)
    await fetchData()
  }, [fetchData])

  return {
    zones, tickets, loading,
    zoneForm, setZoneForm, savingZone, startEditZone, cancelEditZone, submitZone, removeZone,
    ticketForm, setTicketForm, savingTicket, startEditTicket, cancelEditTicket, submitTicket, removeTicket,
  }
}
