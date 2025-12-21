import type { VercelRequest, VercelResponse } from '@vercel/node';

function parseGviz(text: string) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Invalid GViz');
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

function mapMainByLetters(cols: string[], rowObj: Record<string, any>) {
  const byIndex = cols.map((_, i) => rowObj[cols[i]]);
  const letterToIndex = (ch: string) => ch.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
  const pickLetters = ['A','B','G','J','P','R','S','T','U','W'];
  const names = [
    'Full name','Code','Role','TP','Điểm trung bình chuyên môn','Technical','Trial','Sư Phạm','Điểm đánh giá','Đánh giá'
  ];
  const obj: Record<string, any> = {};
  pickLetters.forEach((L, i) => {
    const idx = letterToIndex(L);
    const label = names[i] || L;
    obj[label] = byIndex[idx] ?? null;
  });
  return obj;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const type = (req.query.type as string) || 'main';
    const code = String(req.query.code ?? '').trim();
    if (!code) {
      return res.status(400).json({ error: 'Thiếu tham số code' });
    }

    const mainId = process.env.MAIN_SHEET_ID || '1WgmLAeasNKCDo1JUm_5iDv9Ww5Wzh8rQ3EXCc8nSVvQ';
    const advId = process.env.ADV_SHEET_ID || '19uKKdBq3aZQ3dd2m3B_-Jk8RC7ffUdYRC25CM4zO8f4';
    const sheetId = type === 'adv' ? advId : mainId;

    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
    const r = await fetch(url);
    const text = await r.text();
    if (!r.ok) return res.status(r.status).json({ error: `Upstream error ${r.status}` });
    if (!text.includes('google.visualization.Query.setResponse')) {
      return res.status(502).json({ error: 'GViz response invalid' });
    }
    const { cols, rows } = parseGviz(text);

    // Filter and map
    let filtered: Record<string, any>[];
    if (type === 'adv') {
      // Code in Column B (index 1)
      filtered = rows.filter((row) => {
        const byIndex = cols.map((c, i) => row[c]);
        const codeVal = byIndex[1];
        return String(codeVal ?? '').trim().toLowerCase() === code.toLowerCase();
      }).map((row) => {
        const byIndex = cols.map((c) => row[c]);
        return { 'Full name': byIndex[0] ?? null, 'Code': byIndex[1] ?? null, ...row };
      });
    } else {
      // main: match anywhere, then map selected fields and DROP Rank
      filtered = rows
        .filter((row) => Object.values(row).some((v) => String(v ?? '').trim().toLowerCase() === code.toLowerCase()))
        .map((row) => mapMainByLetters(cols, row));
    }

    // Sanitize: return only necessary fields
    return res.status(200).json({ rows: filtered });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Internal error' });
  }
}
