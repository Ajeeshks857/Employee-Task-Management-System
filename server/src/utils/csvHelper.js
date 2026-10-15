export const generateCsvString = (data, columns) => {
  if (!data || !data.length) {
    const headers = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(',');
    return headers;
  }

  const headerRow = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(',');

  const rows = data.map((row) =>
    columns
      .map((col) => {
        let val = row[col.key];
        if (val === undefined || val === null) val = '';
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      })
      .join(',')
  );

  return [headerRow, ...rows].join('\r\n');
};
