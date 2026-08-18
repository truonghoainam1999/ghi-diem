/** Id cục bộ. Dữ liệu không rời khỏi máy nên không cần chống trùng toàn cầu. */
export function createId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${random}`;
}
