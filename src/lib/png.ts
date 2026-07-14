import { DAY_LABELS, PERIOD_COUNT, PERIOD_TIMES } from "./schedule";
import { courseHue } from "./colors";
import type { CourseData, SelectedSection } from "./types";

const SCALE = 2;
const TIME_W = 64;
const DAY_W = 168;
const HEADER_H = 44;
const ROW_H = 56;
const PAD = 24;
const TITLE_H = 48;

export function downloadPng(selected: SelectedSection[], data: CourseData) {
  const dayCount = selected.some((s) =>
    s.section.schedule.some((slot) => slot.day >= 5)
  )
    ? 7
    : 5;

  const w = PAD * 2 + TIME_W + DAY_W * dayCount;
  const h = PAD * 2 + TITLE_H + HEADER_H + ROW_H * PERIOD_COUNT;

  const canvas = document.createElement("canvas");
  canvas.width = w * SCALE;
  canvas.height = h * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  const font = (size: number, weight = 400) =>
    `${weight} ${size}px system-ui, -apple-system, sans-serif`;

  // background
  ctx.fillStyle = "#f7f8fa";
  ctx.fillRect(0, 0, w, h);

  // title
  ctx.fillStyle = "#101828";
  ctx.font = font(20, 700);
  ctx.fillText("SUchedule", PAD, PAD + 24);

  const gridX = PAD;
  const gridY = PAD + TITLE_H;
  const gridW = TIME_W + DAY_W * dayCount;
  const gridH = HEADER_H + ROW_H * PERIOD_COUNT;

  // grid card
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(gridX, gridY, gridW, gridH);
  ctx.strokeStyle = "#e4e7ec";
  ctx.lineWidth = 1;
  ctx.strokeRect(gridX, gridY, gridW, gridH);

  // day header band
  ctx.fillStyle = "#f2f4f7";
  ctx.fillRect(gridX, gridY, gridW, HEADER_H);
  ctx.fillStyle = "#667085";
  ctx.font = font(12, 600);
  ctx.textAlign = "center";
  for (let d = 0; d < dayCount; d++) {
    ctx.fillText(
      DAY_LABELS[d],
      gridX + TIME_W + DAY_W * d + DAY_W / 2,
      gridY + HEADER_H / 2 + 4
    );
  }

  // hour lines + times
  ctx.textAlign = "center";
  ctx.font = font(10);
  for (let p = 0; p < PERIOD_COUNT; p++) {
    const y = gridY + HEADER_H + ROW_H * p;
    ctx.strokeStyle = "#e4e7ec";
    ctx.beginPath();
    ctx.moveTo(gridX, y);
    ctx.lineTo(gridX + gridW, y);
    ctx.stroke();
    ctx.fillStyle = "#667085";
    ctx.fillText(PERIOD_TIMES[p].start, gridX + TIME_W / 2, y + 16);
  }

  // day separators
  for (let d = 0; d <= dayCount; d++) {
    const x = gridX + TIME_W + DAY_W * d;
    ctx.strokeStyle = "#e4e7ec";
    ctx.beginPath();
    ctx.moveTo(x, gridY);
    ctx.lineTo(x, gridY + gridH);
    ctx.stroke();
  }

  // blocks
  ctx.textAlign = "left";
  for (const sel of selected) {
    const hue = courseHue(sel.courseCode);
    for (const slot of sel.section.schedule) {
      if (slot.day >= dayCount) continue;
      const x = gridX + TIME_W + DAY_W * slot.day + 4;
      const y = gridY + HEADER_H + ROW_H * slot.start + 3;
      const bw = DAY_W - 8;
      const bh = ROW_H * slot.duration - 6;

      ctx.fillStyle = `hsl(${hue} 80% 94%)`;
      ctx.beginPath();
      ctx.roundRect(x, y, bw, bh, 6);
      ctx.fill();
      ctx.fillStyle = `hsl(${hue} 70% 50%)`;
      ctx.fillRect(x, y, 3, bh);

      ctx.fillStyle = `hsl(${hue} 55% 32%)`;
      ctx.font = font(12, 600);
      ctx.fillText(
        `${sel.courseCode}${sel.classType ? ` ${sel.classType}` : ""}`,
        x + 10,
        y + 18,
        bw - 16
      );
      ctx.font = font(10);
      ctx.globalAlpha = 0.75;
      ctx.fillText(data.places[slot.place] ?? "", x + 10, y + 33, bw - 16);
      ctx.globalAlpha = 1;
    }
  }

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "suchedule.png";
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}
