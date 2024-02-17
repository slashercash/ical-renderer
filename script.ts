const eventsUrl = new URL(`https://content.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events`)

const spanMonth = document.getElementById('month') as HTMLSpanElement
const spanTimeMin = document.getElementById('time-min') as HTMLSpanElement
const spanTimeMax = document.getElementById('time-max') as HTMLSpanElement
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
const ONE_DAY = 86400000
const calendarDays: Array<CalendarDay> = []

const now = new Date(Date.now())
const selectedMonth = new Date(now.getFullYear(), now.getMonth())
let timeMin: Date
let timeMax: Date
switchMonth(0)

function switchMonth(i: number) {
  selectedMonth.setMonth(selectedMonth.getMonth() + i)

  timeMin = new Date(selectedMonth.getTime())
  let day = timeMin.getDay()
  // TODO: would for-loop be better?
  while (day !== 1) {
    timeMin.setDate(timeMin.getDate() - 1)
    day = timeMin.getDay()
  }
  timeMax = new Date(timeMin.getTime() + ONE_DAY * 35)

  for (let i = 0; i < 35; i++) {
    calendarDays[i] = {
      date: new Date(timeMin.getTime() + i * ONE_DAY),
      bookedMorning: false,
      bookedEvening: false
    }
  }

  spanMonth.innerText = selectedMonth.getFullYear() + ' ' + months[selectedMonth.getMonth()]
  spanTimeMin.innerText = timeMin.toISOString()
  spanTimeMax.innerText = timeMax.toISOString()
}

function fetchEvents(): void {
  eventsUrl.search = new URLSearchParams({
    key: API_KEY,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString()
  }).toString()

  fetch(eventsUrl)
    .then((res): Promise<EventsResponse> => res.json())
    .then((res) => res.items.forEach(setCalendarDays))
}

function setCalendarDays(item: Item) {
  if (item.start.date === undefined || item.end.date === undefined) return

  const endDate = new Date(item.end.date)
  endDate.setHours(0)
  const startDate = new Date(item.start.date)
  startDate.setHours(0)

  for (
    const indexDate = startDate;
    indexDate.getTime() < endDate.getTime();
    indexDate.setDate(indexDate.getDate() + 1)
  ) {
    const day = calendarDays.find((d) => d.date.getTime() === indexDate.getTime())
    if (day != undefined) {
      day.bookedMorning = true
      day.bookedEvening = true
    }
  }
}
