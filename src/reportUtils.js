// Pure aggregation + CSV-building helpers for the Teacher Portal daily usage reports.
// No Firestore imports here on purpose - everything here operates on plain usage-event
// objects (as returned by teacherUtils.fetchUsageEventsForTeacher), so it's easy to
// unit test in isolation and reuse from the dashboard UI.

// Human-readable labels for each internal gameMode value, used only for the CSV export.
// Existing inline label strings elsewhere in App.js are left untouched - this is a
// separate, CSV-only source of truth.
export const MODE_LABELS = {
  unlimited: 'Training',
  timed: 'Monster Race',
  advanced: 'Boss Battle',
  detective: 'Monster Detective',
  twoDigit: 'Two-Digit Multiplication',
  division: 'Division',
  squadBattle: 'Squad Battle',
  squadSurvival: 'Squad Survival'
};

// Group a flat list of usage events by their dayKey (YYYY-MM-DD, local calendar day)
export const groupEventsByDay = (events) => {
  const byDay = new Map();
  events.forEach(event => {
    const key = event.dayKey;
    if (!byDay.has(key)) {
      byDay.set(key, []);
    }
    byDay.get(key).push(event);
  });
  return byDay;
};

const formatDuration = (totalSeconds) => {
  const minutes = Math.round(totalSeconds / 60);
  return `${minutes}m`;
};

// Highest correct/total success rate for a given gameMode within a set of events,
// or '' if that mode wasn't attempted (matches the CSV's "blank if not attempted" rule)
const bestSuccessRate = (events, gameMode) => {
  const modeEvents = events.filter(e => e.gameMode === gameMode && e.score && e.score.total > 0);
  if (modeEvents.length === 0) {
    return '';
  }
  const best = modeEvents.reduce((max, e) => {
    const pct = Math.round((e.score.correct / e.score.total) * 100);
    return Math.max(max, pct);
  }, 0);
  return `${best}%`;
};

// Build one report row per student for a single day's worth of events
export const buildDailyReportRows = (eventsForDay) => {
  const byStudent = new Map();
  eventsForDay.forEach(event => {
    const key = event.studentName;
    if (!byStudent.has(key)) {
      byStudent.set(key, []);
    }
    byStudent.get(key).push(event);
  });

  const rows = [];
  byStudent.forEach((events, studentName) => {
    const totalSeconds = events.reduce((sum, e) => sum + (e.durationSeconds || 0), 0);
    const uniqueModes = [...new Set(events.map(e => e.gameMode))]
      .map(mode => MODE_LABELS[mode] || mode)
      .sort();

    rows.push({
      studentName,
      sessionDuration: formatDuration(totalSeconds),
      modesAttempted: uniqueModes.join(', '),
      monsterRaceBestSuccessRate: bestSuccessRate(events, 'timed'),
      bossBattleBestSuccessRate: bestSuccessRate(events, 'advanced')
    });
  });

  return rows.sort((a, b) => a.studentName.localeCompare(b.studentName));
};

// Escape a CSV field: wrap in quotes if it contains a comma, quote, or newline
const escapeCsvField = (value) => {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// Convert an array of report rows (from buildDailyReportRows) into a CSV string
export const rowsToCsv = (rows) => {
  const header = [
    'student name',
    'session duration',
    'modes attempted',
    'monster race best success rate',
    'boss battle best success rate'
  ];
  const lines = [header.join(',')];

  rows.forEach(row => {
    lines.push([
      escapeCsvField(row.studentName),
      escapeCsvField(row.sessionDuration),
      escapeCsvField(row.modesAttempted),
      escapeCsvField(row.monsterRaceBestSuccessRate),
      escapeCsvField(row.bossBattleBestSuccessRate)
    ].join(','));
  });

  return lines.join('\n');
};

// Build the report filename: MultiplyMonsters_<teacher name>_<mm-dd-yyyy>.csv
// Takes the dayKey string (YYYY-MM-DD) rather than a Date, since dayKey is already
// the source of truth for "which calendar day" - avoids re-parsing into a Date and
// risking a timezone-driven off-by-one.
export const buildReportFilename = (teacherDisplayName, dayKey) => {
  const [year, month, day] = dayKey.split('-');
  const sanitizedName = teacherDisplayName.replace(/[\\/:*?"<>|]/g, '').trim();
  return `MultiplyMonsters_${sanitizedName}_${month}-${day}-${year}.csv`;
};

// Human-readable display date for a dayKey, e.g. "July 13, 2026"
export const formatDayKeyForDisplay = (dayKey) => {
  const [year, month, day] = dayKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Build the list of available report-days (most recent first, capped at 30) from a flat
// list of usage events already fetched for one teacher. Each entry carries the dayKey,
// its display date, filename, and a pre-computed CSV string ready to download.
export const buildAvailableReports = (events, teacherDisplayName) => {
  const byDay = groupEventsByDay(events);
  const dayKeys = [...byDay.keys()].sort().reverse().slice(0, 30);

  return dayKeys.map(dayKey => {
    const rows = buildDailyReportRows(byDay.get(dayKey));
    return {
      dayKey,
      displayDate: formatDayKeyForDisplay(dayKey),
      filename: buildReportFilename(teacherDisplayName, dayKey),
      csv: rowsToCsv(rows)
    };
  });
};
