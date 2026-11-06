import { WEEKLY_CHALLENGES } from './challenges.data'
import type { WeeklyChallenge } from './challenges.types'

/**
 * Lấy số tuần hiện tại trong năm (từ 1 đến 52)
 */
export function getCurrentWeekNumber(date = new Date()): number {
  const target = new Date(date.valueOf())
  const dayNr = (date.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNr + 3)
  const firstThursday = target.valueOf()
  target.setMonth(0, 1)
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7))
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000)
  return Math.min(52, Math.max(1, weekNumber))
}

/**
 * Lấy thử thách thơ của tuần hiện tại
 */
export function getCurrentWeeklyChallenge(date = new Date()): WeeklyChallenge {
  const weekNumber = getCurrentWeekNumber(date)
  const found = WEEKLY_CHALLENGES.find((c) => c.weekNumber === weekNumber)
  return found || WEEKLY_CHALLENGES[0]
}

/**
 * Tính thời gian còn lại đến hết tuần này (chủ nhật 23:59:59)
 */
export function getTimeRemainingInWeek(now = new Date()): { days: number; hours: number } {
  const dayOfWeek = now.getDay() // 0 = Chủ nhật, 1 = Thứ 2...
  const daysRemaining = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
  const hoursRemaining = 23 - now.getHours()
  return {
    days: Math.max(0, daysRemaining),
    hours: Math.max(0, hoursRemaining),
  }
}

