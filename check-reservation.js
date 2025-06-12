const axios = require('axios');
const dayjs = require('dayjs');
require('dotenv').config();

const COURT_MAP = {
  1: [1, 7, 8],
  2: [2, 9, 10],
  3: [3, 11, 12],
  4: [4, 13, 14],
  5: [5, 15, 16],
  6: [6, 17, 18],
};

const WINDOW_START = '19:00:00'; // 7:00 PM
const DEFAULT_CHECK_DAYS = ['Mon', 'Tue', 'Wed']; // For /check
let durationLabel;

function getWindowEnd(date) {
  const day = dayjs(date).format('ddd');
  return ['Sat', 'Sun'].includes(day) ? '21:00:00' : '22:00:00';
}

function formatDuration(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const hrStr = hrs > 0 ? `${hrs} hour${hrs > 1 ? 's' : ''}` : '';
  const minStr = mins > 0 ? `${mins} min${mins > 1 ? 's' : ''}` : '';
  return [hrStr, minStr].filter(Boolean).join(' ');
}

function isCourtAvailable(reservations, date) {
  const windowStart = dayjs(`${date}T${WINDOW_START}`);
  const windowEnd = dayjs(`${date}T${getWindowEnd(date)}`);
  const availableCourts = [];

  for (const [courtId, spaceIds] of Object.entries(COURT_MAP)) {
    const courtReservations = reservations
      .filter(r => spaceIds.includes(r.space_id))
      .map(r => ({
        start: dayjs(r.start.replace(' ', 'T')),
        end: dayjs(r.end.replace(' ', 'T')),
      }))
      .sort((a, b) => a.start - b.start);

    let pointer = windowStart;
    let maxFreeDuration = 0;

    for (const { start, end } of courtReservations) {
      if (pointer.isBefore(start)) {
        const freeEnd = start.isBefore(windowEnd) ? start : windowEnd;
        const freeDuration = freeEnd.diff(pointer, 'minute');
        if (freeDuration > maxFreeDuration) {
          maxFreeDuration = freeDuration;
        }
      }
      if (end.isAfter(pointer)) pointer = end;
      if (pointer.isAfter(windowEnd)) break;
    }

    if (pointer.isBefore(windowEnd)) {
      const remainingFree = windowEnd.diff(pointer, 'minute');
      if (remainingFree > maxFreeDuration) {
        maxFreeDuration = remainingFree;
      }
    }

    if (maxFreeDuration >= 120) {
      const endTime12hr = dayjs(`${date}T${getWindowEnd(date)}`).format('h:mm A');
      const label = maxFreeDuration < 180 ? `${courtId}*` : `${courtId}`;
      availableCourts.push(label);
    }
  }

  return availableCourts;
}

async function checkDate(date) {
  const weekday = dayjs(date).format('dddd');
  const url = `https://roundrocktexas.dserec.com/online/fcscheduling/api/reservation?start=${date}&end=${date}`;

  try {
    const { data } = await axios.get(url);
    const reservations = (data?.data || []).filter(r => r.space_id >= 1 && r.space_id <= 18);
    const courts = isCourtAvailable(reservations, date);

    if (courts.length > 0) {
      durationLabel = formatDuration(180); // constant default min label
      return `${date} (${weekday}) – Courts: ${courts.join(', ')}`;
    }
  } catch (err) {
    console.error(`❗ Error checking ${date} (${weekday}): ${err.message}`);
  }

  return null;
}

async function runAvailabilityCheck(filterDay = null) {
  const today = dayjs();
  const endDate = today.add(4, 'month');
  const datePromises = [];

  for (let date = today; date.isBefore(endDate); date = date.add(1, 'day')) {
    const dayName = date.format('ddd');
    if (filterDay) {
      if (dayName.toLowerCase() !== filterDay.toLowerCase()) continue;
    } else if (!DEFAULT_CHECK_DAYS.includes(dayName)) {
      continue;
    }

    const dateStr = date.format('YYYY-MM-DD');
    datePromises.push(checkDate(dateStr));
  }

  const results = await Promise.allSettled(datePromises);
  const availableDates = results
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => r.value);

  const output = [
    `📅 Court availability${filterDay ? ` for (${filterDay})` : ' (Mon–Wed)' }:`,
    ...availableDates,
    '',
    '* = Court has at least 2 hours but less than 3 hours.'
  ];

  return output.join('\n');
}

module.exports = runAvailabilityCheck;
