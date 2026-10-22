
(() => {
  const $ = id => document.getElementById(id);
  const circumference = 2 * Math.PI * 90;

  let start = localStorage.getItem('dayStart') || '08:15';
  let end = localStorage.getItem('dayEnd') || '16:50';

  $('startTime').value = start;
  $('endTime').value = end;
  $('ringValue').style.strokeDasharray = circumference;

  function toMinutes(value) {
    const [h, m] = value.split(':').map(Number);
    return h * 60 + m;
  }

  function fmtTime(mins) {
    mins = Math.max(0, Math.floor(mins));
    return `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`;
  }

  function durationWords(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;

    if (h && m) return `יום של ${h} שעות ו־${m} דקות`;
    if (h) return `יום של ${h} שעות`;
    return `יום של ${m} דקות`;
  }

  function update() {
    const now = new Date();
    const nowMins =
      now.getHours() * 60 +
      now.getMinutes() +
      now.getSeconds() / 60;

    const startMins = toMinutes(start);
    const endMins = toMinutes(end);
    const total = endMins - startMins;

    $('dateLabel').textContent =
      new Intl.DateTimeFormat('he-IL', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      }).format(now);

    $('scheduleText').textContent = `${start}–${end}`;

    if (total <= 0) {
      $('percentage').textContent = '—';
      $('centerCaption').textContent = 'בדקו את השעות';
      $('elapsed').textContent = '—';
      $('remaining').textContent = '—';
      $('durationText').textContent =
        'שעת הסיום צריכה להיות אחרי שעת ההתחלה';
      $('ringValue').style.strokeDashoffset = circumference;
      $('statusText').textContent =
        'בחרו שעת סיום מאוחרת משעת ההתחלה כדי לחשב את ההתקדמות.';
      $('statusMark').textContent = '!';
      return;
    }

    const elapsed = Math.min(
      total,
      Math.max(0, nowMins - startMins)
    );

    const remaining = Math.max(0, endMins - nowMins);

    const pct = Math.min(
      100,
      Math.max(0, (nowMins - startMins) / total * 100)
    );

    $('percentage').textContent = pct.toFixed(3);

    $('ringValue').style.strokeDashoffset =
      circumference * (1 - pct / 100);

    $('elapsed').textContent = fmtTime(elapsed);
    $('remaining').textContent = fmtTime(remaining);
    $('durationText').textContent = durationWords(total);

    if (nowMins < startMins) {
      $('centerCaption').textContent = 'היום עוד מעט מתחיל';
      $('statusText').textContent =
        `היום שלך מתחיל ב־${start}. נשארו ${fmtTime(startMins - nowMins)} עד ההתחלה.`;
      $('statusMark').textContent = '☀';
    } else if (nowMins >= endMins) {
      $('centerCaption').textContent = 'סיימת להיום!';
      $('statusText').textContent =
        'היום שהגדרת הסתיים. כל הכבוד על מה שהספקת — אפשר לנוח.';
      $('statusMark').textContent = '✓';
    } else {
      $('centerCaption').textContent = 'מהיום כבר מאחוריך';
      $('statusText').textContent =
        `עברו ${pct.toFixed(1)}% מהיום שהגדרת. עוד ${fmtTime(remaining)} לסיום.`;
      $('statusMark').textContent = '↗';
    }
  }

  $('saveTimes').addEventListener('click', () => {
    const newStart = $('startTime').value;
    const newEnd = $('endTime').value;

    if (
      !newStart ||
      !newEnd ||
      toMinutes(newEnd) <= toMinutes(newStart)
    ) {
      $('statusText').textContent =
        'שעת הסיום חייבת להיות מאוחרת משעת ההתחלה.';
      $('statusMark').textContent = '!';
      return;
    }

    start = newStart;
    end = newEnd;

    localStorage.setItem('dayStart', start);
    localStorage.setItem('dayEnd', end);

    $('saveTimes').textContent = 'השעות נשמרו ✓';

    update();

    setTimeout(() => {
      $('saveTimes').textContent = 'שמירת שעות';
    }, 1600);
  });

  update();
  setInterval(update, 1000);
})();
