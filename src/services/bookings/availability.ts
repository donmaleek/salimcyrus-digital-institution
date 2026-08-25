export interface SlotWindow {
  startTime: Date
  durationMinutes: number
}

export function slotEnd(slot: SlotWindow): Date {
  return new Date(slot.startTime.getTime() + slot.durationMinutes * 60_000)
}

export function slotsOverlap(left: SlotWindow, right: SlotWindow): boolean {
  return left.startTime < slotEnd(right) && right.startTime < slotEnd(left)
}

export function isBookableStart(startTime: Date, now = new Date()): boolean {
  return startTime.getTime() >= now.getTime() + 5 * 60_000
}
