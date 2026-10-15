(() => {
  const $ = id => document.getElementById(id);
  function readTime(value) {
    const [h, m] = value.split(":").map(Number);
    return h * 60 + m;
  }
  let startMinutes = readTime(localStorage.getItem("startTime") || "08:15");
  let endMinutes = readTime(localStorage.getItem("endTime") || "16:50");

  function clock(minutes) {
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  }
  function duration(minutes) {
    const h = Math.floor(minutes / 60), m = minutes % 60;
    if (!h) return `${m} דקות`;
    if (!m) return h === 1 ? "שעה אחת" : `${h} שעות`;
    return `${h === 1 ? "שעה" : `${h} שעות`} ו־${m} דקות`;
  }

  $("startTime").value = clock(startMinutes);
  $("endTime").value = clock(endMinutes);

  function update() {
    const now = new Date();
    const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const startSeconds = startMinutes * 60, endSeconds = endMinutes * 60;
    const totalSeconds = (endMinutes - startMinutes) * 60;
    const passedSeconds = Math.max(0, Math.min(totalSeconds, nowSeconds - startSeconds));
    const remainingSeconds = totalSeconds - passedSeconds;
    const percent = passedSeconds / totalSeconds * 100;

    document.title = `${percent.toFixed(3)}% | התקדמות היום`;
    const passedMinutes = Math.floor(passedSeconds / 60);
    const remainingMinutes = Math.ceil(remainingSeconds / 60);
    $("percent").textContent = `${percent.toFixed(3)}%`;
    $("fill").style.width = `${percent}%`;
    $("progress").setAttribute("aria-valuenow", percent.toFixed(3));
    $("passed").textContent = clock(passedMinutes);
    $("remaining").textContent = clock(remainingMinutes);
    $("totalLabel").textContent = `יום של ${duration(endMinutes - startMinutes)}`;
    $("schedule").textContent = `היום: ${clock(startMinutes)}–${clock(endMinutes)}`;

    if (nowSeconds < startSeconds) {
      $("elapsed").textContent = "היום עדיין לא התחיל";
      $("status").textContent = `מתחילים ב־${clock(startMinutes)}`;
    } else if (nowSeconds >= endSeconds) {
      $("elapsed").textContent = `עברו ${duration(endMinutes - startMinutes)}`;
      $("status").textContent = "היום הושלם!";
    } else {
      $("elapsed").textContent = `עברו ${duration(passedMinutes)}`;
      $("status").textContent = "מתעדכן אוטומטית בכל שנייה";
    }
  }

  $("saveTimes").addEventListener("click", () => {
    const s = $("startTime").value, e = $("endTime").value;
    if (!s || !e) {
      $("settingsMessage").textContent = "יש לבחור שעת התחלה ושעת סיום.";
      return;
    }
    const newStart = readTime(s), newEnd = readTime(e);
    if (newEnd <= newStart) {
      $("settingsMessage").textContent = "שעת הסיום צריכה להיות מאוחרת משעת ההתחלה באותו יום.";
      return;
    }
    startMinutes = newStart;
    endMinutes = newEnd;
    localStorage.setItem("startTime", s);
    localStorage.setItem("endTime", e);
    $("settingsMessage").textContent = `השעות נשמרו: ${clock(newStart)}–${clock(newEnd)}.`;
    update();
  });
  $("refresh").addEventListener("click", update);
  update();
  setInterval(update, 1000);
})();
