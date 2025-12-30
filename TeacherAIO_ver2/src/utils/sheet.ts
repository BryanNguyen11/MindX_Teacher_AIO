// Frontend util to fetch Google Sheet via GViz and parse rows
// Using public sheet ID provided by user

export interface SheetResult {
  cols: string[];
  // Each row is an array of cell values aligned by column index
  rows: any[][];
}

// Default sheet (as requested): public sheet and default tab
const DEFAULT_SHEET_ID = '1WgmLAeasNKCDo1JUm_5iDv9Ww5Wzh8rQ3EXCc8nSVvQ';
const DEFAULT_SHEET_NAME = 'T12';

// Parse GViz response: google.visualization.Query.setResponse({...})
function parseGviz(text: string): SheetResult {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('Phản hồi GVIZ không hợp lệ');
  }
  const json = JSON.parse(text.slice(start, end + 1));
  const rawCols: string[] = (json.table?.cols || []).map((c: any) => c.label || c.id || '');
  // Make column labels unique when duplicates exist by appending a counter suffix
  const cols: string[] = [];
  const seen: Record<string, number> = {};
  for (const c of rawCols) {
    const key = String(c ?? '');
    if (!seen[key]) {
      seen[key] = 1;
      cols.push(key);
    } else {
      seen[key] += 1;
      cols.push(`${key} (${seen[key]})`);
    }
  }
  // Lưu từng hàng theo chỉ số cột để tránh đè giá trị khi có nhãn trùng nhau (vd: nhiều cột "20%")
  const rows: any[][] = (json.table?.rows || []).map((r: any) => {
    const arr: any[] = [];
    r.c?.forEach((cell: any, idx: number) => {
      arr[idx] = cell?.v ?? null;
    });
    return arr;
  });
  return { cols, rows };
}

// Map columns by letter indices to friendly names
function mapByLetters(cols: string[], rowVals: any[]) {
  const byIndex = rowVals;
  const letterToIndex = (ch: string) => ch.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
  // Thứ tự cột mới sau khi xoá Rank:
  // A Full name, B Code, C User name, D Khối, E Status, F Role,
  // G CR45, H 15%, I TP, J 20%, K Completion rate, L 20%, M 20%,
  // N Điểm trung bình chuyên môn, O 25%, P Technical, Q Trial,
  // R Sư phạm, S Điểm đánh giá (Max = 5), T Xếp loại, U Đánh giá
  const pickLetters = ['A','B','F','I','N','P','Q','R','S','U'];
  const names = [
    'Full name',        // A
    'Code',             // B
    'Role',             // F
    'TP',               // I
    'Điểm trung bình chuyên môn', // N
    'Technical',        // P
    'Trial',            // Q
    'Sư Phạm',          // R
    'Điểm đánh giá',    // S
    'Đánh giá',         // U
  ];
  const obj: Record<string, any> = {};
  pickLetters.forEach((L, i) => {
    const idx = letterToIndex(L);
    const label = names[i] || L;
    obj[label] = byIndex[idx] ?? null;
  });
  return obj;
}

// Fetch sheet rows and filter by LMS code (exact match in any column)
export async function fetchSheetByLmsCode(sheetId?: string, lmsCode?: string, gid?: string, sheetName?: string) {
  // Prod: dùng proxy API để ẩn Sheet ID; Dev: gọi trực tiếp GViz
  const sid = sheetId || DEFAULT_SHEET_ID;
  const sname = sheetName ?? DEFAULT_SHEET_NAME;
  const baseApi = '/api/sheet?type=main&code=' + encodeURIComponent(lmsCode || '');
  const useProxy = false; // luôn gọi trực tiếp GViz
  if (useProxy) {
    const resp = await fetch(baseApi);
    if (!resp.ok) throw new Error(`Lỗi tải sheet (HTTP ${resp.status})`);
    const data = await resp.json();
    return { cols: [], rows: Array.isArray(data.rows) ? data.rows : [] };
  }
  // Fallback (SSR/dev tools): direct GViz
  let base = `https://docs.google.com/spreadsheets/d/${sid}/gviz/tq?tqx=out:json`;
  if (sname) base += `&sheet=${encodeURIComponent(sname)}`;
  const url = gid ? `${base}&gid=${encodeURIComponent(gid)}` : base;
  const resp = await fetch(url);
  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`Lỗi tải sheet (HTTP ${resp.status})`);
  }
  if (!text.includes('google.visualization.Query.setResponse')) {
    throw new Error('Sheet không công khai hoặc phản hồi không hợp lệ.');
  }
  const { cols, rows } = parseGviz(text);
  const needle = String(lmsCode).trim().toLowerCase();
  const filtered = rows.filter((rowVals: any[]) =>
    rowVals.some((v) => String(v ?? '').trim().toLowerCase() === needle)
  );
  const mapped = filtered.map((rowVals) => {
    // map index-based fields to friendly labels for older UI
    const base = mapByLetters(cols, rowVals);
    // Attach every original column label (unique) to the object so UIs can render full sheet
    cols.forEach((label, idx) => {
      if (label) base[label] = rowVals[idx] ?? null;
    });
    // Preserve original column order on the row object for UI rendering
    Object.defineProperty(base, '__cols', {
      value: cols,
      enumerable: false,
      configurable: false,
    });
    return base as Record<string, any>;
  });
  return { cols, rows: mapped };
}

// Fetch sheet for advanced training by exact Code (column B)
export async function fetchAdvancedByCode(sheetId?: string, code?: string, gid?: string, sheetName?: string) {
  const sid = sheetId || DEFAULT_SHEET_ID;
  const sname = sheetName ?? DEFAULT_SHEET_NAME;
  const baseApi = '/api/sheet?type=adv&code=' + encodeURIComponent(code || '');
  const useProxy = false; // luôn gọi trực tiếp GViz
  if (useProxy) {
    const resp = await fetch(baseApi);
    if (!resp.ok) throw new Error(`Lỗi tải sheet nâng cao (HTTP ${resp.status})`);
    const data = await resp.json();
    return { cols: [], rows: Array.isArray(data.rows) ? data.rows : [] };
  }
  // Fallback direct (SSR/dev)
  let base = `https://docs.google.com/spreadsheets/d/${sid}/gviz/tq?tqx=out:json`;
  if (sname) base += `&sheet=${encodeURIComponent(sname)}`;
  const url = gid ? `${base}&gid=${encodeURIComponent(gid)}` : base;
  const resp = await fetch(url);
  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`Lỗi tải sheet nâng cao (HTTP ${resp.status})`);
  }
  if (!text.includes('google.visualization.Query.setResponse')) {
    throw new Error('Sheet nâng cao không công khai hoặc phản hồi không hợp lệ.');
  }
  const { cols, rows } = parseGviz(text);
  const needle = String(code || '').trim().toLowerCase();
  const baseRows = (needle
    ? rows.filter((rowVals: any[]) => String(rowVals[1] ?? '').trim().toLowerCase() === needle)
    : rows);
  const mapped = baseRows.map((rowVals: any[]) => {
    const mappedObj = mapByLetters(cols, rowVals);
    // Giữ lại toàn bộ cặp label->value gốc để trang nâng cao tham chiếu theo label bài học
    cols.forEach((label, idx) => {
      if (label) mappedObj[label] = rowVals[idx] ?? null;
    });
    return mappedObj as Record<string, any>;
  });
  return { cols, rows: mapped };
}
