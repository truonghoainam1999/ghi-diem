/** Thời gian tương đối tiếng Việt, đủ dùng cho danh sách ván. */
export function relativeTime(timestamp: number, now: number = Date.now()): string {
  const minutes = Math.round((now - timestamp) / 60000);
  if (minutes < 1) return 'vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days} ngày trước`;

  return formatDate(timestamp);
}

/** dd/MM — năm hiện tại thì bỏ năm cho gọn. */
export function formatDate(timestamp: number, now: number = Date.now()): string {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const sameYear = date.getFullYear() === new Date(now).getFullYear();
  return sameYear ? `${day}/${month}` : `${day}/${month}/${date.getFullYear()}`;
}

/** Khoảng thời gian chơi, dạng 47′ hoặc 2h12′. */
export function formatDuration(fromMs: number, toMs: number): string {
  const minutes = Math.max(0, Math.round((toMs - fromMs) / 60000));
  if (minutes < 60) return `${minutes}′`;
  return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}′`;
}
