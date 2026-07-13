export function todayDateString(): string {
  const now = new Date()
  const effective = new Date(now)
  if (now.getHours() < 6) {
    effective.setDate(effective.getDate() - 1)
  }
  const year = effective.getFullYear()
  const month = String(effective.getMonth() + 1).padStart(2, '0')
  const day = String(effective.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
