export function formatDeliveryDateRange(startStr: string | null, endStr: string | null): string {
  if (!startStr || !endStr) return '';
  const start = new Date(startStr + "T12:00:00");
  const end = new Date(endStr + "T12:00:00");
  
  const startDay = start.toLocaleDateString('es-HN', { weekday: 'long' });
  const startNum = start.getDate();
  const startMonth = start.toLocaleDateString('es-HN', { month: 'long' });
  const startYear = start.getFullYear();

  const endDay = end.toLocaleDateString('es-HN', { weekday: 'long' });
  const endNum = end.getDate();
  const endMonth = end.toLocaleDateString('es-HN', { month: 'long' });
  const endYear = end.getFullYear();

  if (startYear === endYear) {
    if (startMonth === endMonth) {
      return `${startDay} ${startNum} y ${endDay} ${endNum} de ${startMonth} de ${startYear}`;
    } else {
      return `${startDay} ${startNum} de ${startMonth} y ${endDay} ${endNum} de ${endMonth} de ${startYear}`;
    }
  } else {
    return `${startDay} ${startNum} de ${startMonth} de ${startYear} y ${endDay} ${endNum} de ${endMonth} de ${endYear}`;
  }
}
