// Frontend util to fetch Google Sheet via GViz and parse rows
// Using public sheet ID provided by user

export interface SheetResult {
  cols: string[];
  rows: Record<string, any>[];
}

// Parse GViz response: google.visualization.Query.setResponse({...})
function parseGviz(text: string): SheetResult {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('Phản hồi GVIZ không hợp lệ');
  }
  const json = JSON.parse(text.slice(start, end + 1));
  const cols: string[] = (json.table?.cols || []).map((c: any) => c.label || c.id || '');
  const rows: Record<string, any>[] = (json.table?.rows || []).map((r: any) => {
    const obj: Record<string, any> = {};
    r.c?.forEach((cell: any, idx: number) => {
      const key = cols[idx] || `col_${idx}`;
      obj[key] = cell?.v ?? null;
    });
    return obj;
  });
  return { cols, rows };
}

// Map columns by letter indices to friendly names
function mapByLetters(cols: string[], rowObj: Record<string, any>) {
  const byIndex = cols.map((_, i) => rowObj[cols[i]]);
  const letterToIndex = (ch: string) => ch.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
  // Bao gồm cả cột A (Full name) để hiển thị tên
  const pickLetters = ['A','B','G','J','P','R','S','T','U','W'];
  const names = [
    'Full name',
    'Code',
    'Role',
    'TP',
    'Điểm trung bình chuyên môn',
    'Technical',
    'Trial',
    'Sư Phạm',
    'Điểm đánh giá',
    'Đánh giá',
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
export async function fetchSheetByLmsCode(sheetId: string, lmsCode: string, gid?: string) {
  // Prod: dùng proxy API để ẩn Sheet ID; Dev: gọi trực tiếp GViz
  const baseApi = '/api/sheet?type=main&code=' + encodeURIComponent(lmsCode);
  const useProxy = typeof window !== 'undefined' && (typeof process !== 'undefined' ? process.env.NODE_ENV === 'production' : false);
  if (useProxy) {
    const resp = await fetch(baseApi);
    if (!resp.ok) throw new Error(`Lỗi tải sheet (HTTP ${resp.status})`);
    const data = await resp.json();
    return { cols: [], rows: Array.isArray(data.rows) ? data.rows : [] };
  }
  // Fallback (SSR/dev tools): direct GViz
  const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
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
  const filtered = rows.filter((row) =>
    Object.values(row).some((v) => String(v ?? '').trim().toLowerCase() === needle)
  );
  const mapped = filtered.map((row) => mapByLetters(cols, row));
  return { cols, rows: mapped };
}

// Fetch sheet for advanced training by exact Code (column B)
export async function fetchAdvancedByCode(sheetId: string, code: string, gid?: string) {
  const baseApi = '/api/sheet?type=adv&code=' + encodeURIComponent(code || '');
  const useProxy = typeof window !== 'undefined' && (typeof process !== 'undefined' ? process.env.NODE_ENV === 'production' : false);
  if (useProxy) {
    const resp = await fetch(baseApi);
    if (!resp.ok) throw new Error(`Lỗi tải sheet nâng cao (HTTP ${resp.status})`);
    const data = await resp.json();
    return { cols: [], rows: Array.isArray(data.rows) ? data.rows : [] };
  }
  // Fallback direct (SSR/dev)
  const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
  const url = gid ? `${base}&gid=${encodeURIComponent(gid)}` : base;
  const resp = await fetch(url);
  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`Lỗi tải sheet nâng cao (HTTP ${resp.status})`);
  }
  if (!text.includes('google.visualization.Query.setResponse')) {
    throw new Error('Sheet nâng cao không công khai hoặc phản hồi không hợp lệ.');
  }
  const { cols, rows } = (function parse(text: string){
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    const json = JSON.parse(text.slice(start, end + 1));
    const c = (json.table?.cols || []).map((x: any) => x.label || x.id || '');
    const r = (json.table?.rows || []).map((rr: any) => {
      const obj: Record<string, any> = {};
      rr.c?.forEach((cell: any, idx: number) => {
        const key = c[idx] || `col_${idx}`;
        obj[key] = cell?.v ?? null;
      });
      return obj;
    });
    return { cols: c, rows: r };
  })(text);
  const needle = String(code).trim().toLowerCase();
  const baseRows = (needle
    ? rows.filter((row: Record<string, any>) => {
        const byIndex = cols.map((col: string, i: number) => row[col]);
        const codeVal = byIndex[1];
        return String(codeVal ?? '').trim().toLowerCase() === needle;
      })
    : rows);
  const mapped = baseRows.map((row: Record<string, any>) => {
    const byIndex = cols.map((col: string, i: number) => row[col]);
    return { 'Full name': byIndex[0] ?? null, 'Code': byIndex[1] ?? null, ...row } as Record<string, any>;
  });
  return { cols, rows: mapped };
}
