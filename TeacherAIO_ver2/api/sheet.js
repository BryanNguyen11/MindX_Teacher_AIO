function parseGviz(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Invalid GViz');
  const json = JSON.parse(text.slice(start, end + 1));
  const cols = (json.table?.cols || []).map((c) => c.label || c.id || '');
  const rows = (json.table?.rows || []).map((r) => {
    const obj = {};
    r.c?.forEach((cell, idx) => {
      const key = cols[idx] || `col_${idx}`;
      obj[key] = cell?.v ?? null;
    });
    return obj;
  });
  return { cols, rows };
}

function mapMainByLetters(cols, rowObj) {
  const byIndex = cols.map((_, i) => rowObj[cols[i]]);
  const letterToIndex = (ch) => ch.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
  const pickLetters = ['A','B','G','J','P','R','S','T','U','W'];
  const names = [
    'Full name','Code','Role','TP','Điểm trung bình chuyên môn','Technical','Trial','Sư Phạm','Điểm đánh giá','Đánh giá'
  ];
  const obj = {};
  pickLetters.forEach((L, i) => {
    const idx = letterToIndex(L);
    const label = names[i] || L;
    obj[label] = byIndex[idx] ?? null;
  });
  return obj;
}

export default async function handler(req, res) {
  try {
    const type = (req.query.type) || 'main';
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

    let filtered;
    if (type === 'adv') {
      filtered = rows.filter((row) => {
        const byIndex = cols.map((c, i) => row[c]);
        const codeVal = byIndex[1];
        return String(codeVal ?? '').trim().toLowerCase() === code.toLowerCase();
      }).map((row) => {
        const byIndex = cols.map((c) => row[c]);
        return { 'Full name': byIndex[0] ?? null, 'Code': byIndex[1] ?? null, ...row };
      });
    } else {
      filtered = rows
        .filter((row) => Object.values(row).some((v) => String(v ?? '').trim().toLowerCase() === code.toLowerCase()))
        .map((row) => mapMainByLetters(cols, row));
    }

    return res.status(200).json({ rows: filtered });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Internal error' });
  }
}
