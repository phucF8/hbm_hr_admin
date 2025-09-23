import ExcelJS from 'exceljs';

export function copyBlock(
  worksheet: ExcelJS.Worksheet,
  key: string,
  times: number
) {
  const blockStart = `{{#${key}}}`;
  const blockEnd = `{{/${key}}}`;
  // 1. Tìm dòng bắt đầu và kết thúc block
  let startRow = -1;
  let endRow = -1;
  for (let r = 1; r <= worksheet.rowCount; r++) {
    const rowText = worksheet.getRow(r).values?.toString() || '';
    if (rowText.includes(blockStart)) startRow = r;
    if (rowText.includes(blockEnd)) {
      endRow = r;
      break;
    }
  }

  if (startRow === -1 || endRow === -1) {
    throw new Error(`Không tìm thấy block ${blockStart} ... ${blockEnd}`);
  }

  // 2. Lấy template block
  const templateRows: ExcelJS.Row[] = [];
  for (let r = startRow + 1; r < endRow; r++) {
    templateRows.push(worksheet.getRow(r));
  }

  // 3. Chèn block mới
  let insertAt = endRow - 1;
  for (let i = 0; i < times; i++) {
    templateRows.forEach((tplRow) => {
      insertAt++;
      const newRow = worksheet.insertRow(insertAt, tplRow.values);

      tplRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const newCell = newRow.getCell(colNumber);
        newCell.style = { ...cell.style };
        // if (cell.formula) newCell.formula = cell.formula;
        // if (cell.hyperlink) newCell.hyperlink = cell.hyperlink;
        // giữ nguyên value, có thể replace sau
        if (typeof newCell.value === 'string') newCell.value = newCell.value;
      });
    });
  }

}


export function inspectJson(obj: any, parentKey: string = '') {
  const result: any[] = [];

  function recurse(value: any, keyPath: string) {
    if (value === null) {
      result.push({ key: keyPath, value: null, type: 'null' });
    } else if (Array.isArray(value)) {
      result.push({ key: keyPath, value: `[Array(${value.length})]`, type: 'array' });
      value.forEach((item, index) => {
        recurse(item, `${keyPath}[${index}]`);
      });
    } else if (typeof value === 'object') {
      result.push({ key: keyPath, value: '[Object]', type: 'object' });
      Object.keys(value).forEach((childKey) => {
        recurse(value[childKey], `     ${childKey}`);
      });
    } else {
      result.push({ key: keyPath, value: value, type: typeof value });
    }
  }

  recurse(obj, parentKey || '');
  return result;
}

// cloneCellStyle(src: ExcelJS.Cell | undefined, dest: ExcelJS.Cell) {
//     if (!src) return;
//     if (src.font) dest.font = { ...src.font };
//     if (src.alignment) dest.alignment = { ...src.alignment };
//     if (src.border) dest.border = JSON.parse(JSON.stringify(src.border));
//     if (src.fill) dest.fill = JSON.parse(JSON.stringify(src.fill));
//     if ((src as any).numFmt) dest.numFmt = (src as any).numFmt;
//     if ((src as any).protection) dest.protection = JSON.parse(JSON.stringify((src as any).protection));
//   }






function findBlockRange(worksheet: ExcelJS.Worksheet, key: string): { startRow: number, endRow: number } | null {
  const blockStart = `{{#${key}}}`;
  const blockEnd = `{{/${key}}}`;
  let startRow = -1;
  let endRow = -1;

  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      const value = cell.value?.toString().trim();
      if (value === blockStart) {
        startRow = rowNumber;
      }
      if (value === blockEnd) {
        endRow = rowNumber;
      }
    });
  });

  if (startRow > 0 && endRow > startRow) {
    return { startRow, endRow };
  }
  return null;
}





export function fillBlockRecursive(
  worksheet: ExcelJS.Worksheet,
  data: any,
  key: string,
  startRow: number
) {
  const startMarker = `{{#${key}}}`;
  const endMarker = `{{/${key}}}`;
  const range = findBlockRange(worksheet, key);
  if (!range) return;
  console.log(` >>> block ${key}: ${range.startRow} - ${range.endRow}`);
  // 2. Lấy template block giữa start / end
  const templateRows: ExcelJS.Row[] = [];
  for (let r = range.startRow + 1; r < range.endRow; r++) {
    templateRows.push(worksheet.getRow(r));
  }

  worksheet.spliceRows(range.startRow, 1);

  // 3. Chèn block cho từng item
  let insertAt = range.startRow - 1;
  (data[key] || []).forEach((item: any) => {
    templateRows.forEach((tplRow) => {
      insertAt++;
      const newRow = worksheet.insertRow(insertAt, tplRow.values);
      tplRow.eachCell({ includeEmpty: true }, (cell, col) => {
        const newCell = newRow.getCell(col);
        newCell.style = { ...cell.style };
        if (typeof newCell.value === 'string') {
          let replaced = newCell.value;
          // Replace {{field}}
          Object.keys(item).forEach((field) => {
            if (typeof item[field] !== 'object') {
              replaced = replaced.replace(`{{${field}}}`, item[field]);
            }
          });
          newCell.value = replaced;
        }
      });
      console.log(` +++ insert at ${insertAt} ${newRow.values}`);

      // 4. Đệ quy cho các block con (mảng lồng nhau)
      Object.keys(item).forEach((field) => {
        if (Array.isArray(item[field])) {
          fillBlockRecursive(worksheet, item, field, insertAt);
        }
      });
    });
  });

  // 5. Xóa block gốc
  // console.log(` --- xoá từ ${range.startRow} đến ${range.endRow}`);
  // worksheet.spliceRows(range.startRow, range.endRow - range.startRow + 1);
}



export function getBlockRows(
  worksheet: ExcelJS.Worksheet,
  key: string
): { startRow: number; endRow: number; rows: ExcelJS.Row[] } | null {
  const startMarker = `{{#${key}}}`;
  const endMarker = `{{/${key}}}`;

  let startRow = -1;
  let endRow = -1;

  // 1. Tìm dòng start và end
  for (let r = 1; r <= worksheet.rowCount; r++) {
    const row = worksheet.getRow(r);
    const rowText = row.values?.toString() ?? '';
    if (rowText.includes(startMarker)) {
      startRow = r;
    }
    if (rowText.includes(endMarker) && startRow !== -1 && endRow === -1) {
      endRow = r;
      break; // bây giờ ok
    }
  }

  if (startRow === -1 || endRow === -1) {
    return null; // không tìm thấy
  }

  // 2. Lấy tất cả rows trong block (giữa start / end)
  const rows: ExcelJS.Row[] = [];
  for (let r = startRow; r <= endRow; r++) {
    rows.push(worksheet.getRow(r));
  }

  return { startRow, endRow, rows };
}

export function insertBlockRows(
  worksheet: ExcelJS.Worksheet,
  insertAt: number,
  rows: ExcelJS.Row[],
  repeatCount: number = 1
): { startRow: number; endRow: number; rows: ExcelJS.Row[] } {
  let startRow = insertAt + 1;
  let endRow = insertAt;
  const newRows: ExcelJS.Row[] = [];

  for (let i = 0; i < repeatCount; i++) {
    rows.forEach((srcRow) => {
      endRow++;
      const values = srcRow.values as any[];
      const newRow = worksheet.insertRow(endRow, values);

      // Copy style cho từng cell
      srcRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const newCell = newRow.getCell(colNumber);

        newCell.style = { ...cell.style };
        if (cell.numFmt) newCell.numFmt = cell.numFmt;
        if (cell.font) newCell.font = { ...cell.font };
        if (cell.alignment) newCell.alignment = { ...cell.alignment };
        if (cell.border) newCell.border = { ...cell.border };
        if (cell.fill) newCell.fill = { ...cell.fill };
      });

      // Copy chiều cao dòng
      if (srcRow.height) {
        newRow.height = srcRow.height;
      }

      newRows.push(newRow);
    });
  }

  return { startRow, endRow, rows: newRows };
}

export function findRowIndexByKey(worksheet: ExcelJS.Worksheet, key: string): number {
  for (let row of worksheet.getRows(1, worksheet.rowCount) || []) {
    const values = Array.isArray(row.values) ? row.values : Object.values(row.values);

    for (let cell of values) {
      if (typeof cell === "string" && cell.includes(key)) {
        return row.number; // row.number là số dòng (1-based)
      }
    }
  }
  return -1; // không tìm thấy
}