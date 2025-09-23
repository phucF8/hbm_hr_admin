
//format date time dạng dd/MM/yyyy HH:mm:ss
export function formatDateTime(date?: Date | string): string {
  const d = date ? new Date(date) : new Date();

  const pad = (n: number) => n.toString().padStart(2, '0');

  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1); // JS tháng từ 0
  const year = d.getFullYear();

  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

export function formatDateTime_ddMMyyyy(date?: Date | string): string {
  const d = date ? new Date(date) : new Date();

  const pad = (n: number) => n.toString().padStart(2, '0');

  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1); // JS tháng từ 0
  const year = d.getFullYear();

  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  return `${day}/${month}/${year}`;
}
