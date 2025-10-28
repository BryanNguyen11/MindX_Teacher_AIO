import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/teacher_aio';
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const SHEET_ID = process.env.SHEET_ID || '1WgmLAeasNKCDo1JUm_5iDv9Ww5Wzh8rQ3EXCc8nSVvQ';

// Mongo models
const userSchema = new mongoose.Schema(
  {
    lmsCode: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Utility: parse Google gviz response text into rows of objects
function parseGviz(text) {
  // gviz returns: google.visualization.Query.setResponse({...});
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('Invalid GVIZ response');
  }
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

// GET /api/sheet?lmsCode=ABC123[&gid=...]
app.get('/api/sheet', async (req, res) => {
  try {
    const { lmsCode, gid } = req.query;
    if (!lmsCode) return res.status(400).json({ error: 'Thiếu tham số lmsCode' });

    const base = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
    const url = gid ? `${base}&gid=${encodeURIComponent(gid)}` : base;

    const resp = await fetch(url);
    const text = await resp.text();
    if (!resp.ok) {
      return res.status(resp.status).send(text);
    }
    if (!text.includes('google.visualization.Query.setResponse')) {
      return res.status(400).json({ error: 'Sheet không công khai hoặc phản hồi không hợp lệ.' });
    }
  const { cols, rows } = parseGviz(text);

    const needle = String(lmsCode).trim().toLowerCase();
    const filtered = rows.filter((row) => {
      // Match ở bất kỳ cột nào
      return Object.values(row).some((v) => String(v ?? '').trim().toLowerCase() === needle);
    });

    // Map các cột được yêu cầu: D (Rank), G (Role), J, P, R, S, T, U, W
    const letterToIndex = (ch) => ch.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
    const pickLetters = ['D','G','J','P','R','S','T','U','W'];
    const names = [
      'Rank',
      'Role',
      'TP',
      'Điểm trung bình chuyên môn',
      'Technical',
      'Trial',
      'Sư Phạm',
      'Điểm đánh giá',
      'Đánh giá',
    ];

    const mapped = filtered.map((row) => {
      // row currently keyed by header label; to support letter addressing,
      // we rebuild using the order of cols and row values pairing.
      const byIndex = cols.map((_, i) => row[cols[i]]);
      const obj = {};
      pickLetters.forEach((L, i) => {
        const idx = letterToIndex(L);
        const label = names[i] || L;
        obj[label] = byIndex[idx] ?? null;
      });
      return obj;
    });

  res.json({ count: mapped.length, cols, rows: mapped });
  } catch (err) {
    console.error('Sheet error:', err);
    res.status(500).json({ error: 'Không đọc được dữ liệu từ Google Sheet.' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { lmsCode, password, name } = req.body || {};
    if (!lmsCode || !password || !name) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc.' });
    }

    const existing = await User.findOne({ lmsCode });
    if (existing) {
      return res.status(409).json({ error: 'Mã LMS đã tồn tại.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ lmsCode, name, passwordHash });

    const token = jwt.sign({ id: user._id, lmsCode }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, lmsCode: user.lmsCode, name: user.name },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { lmsCode, password } = req.body || {};
    if (!lmsCode || !password) {
      return res.status(400).json({ error: 'Thiếu thông tin đăng nhập.' });
    }

    const user = await User.findOne({ lmsCode });
    if (!user) {
      return res.status(401).json({ error: 'Sai mã LMS hoặc mật khẩu.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Sai mã LMS hoặc mật khẩu.' });
    }

    const token = jwt.sign({ id: user._id, lmsCode }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, lmsCode: user.lmsCode, name: user.name },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ.' });
  }
});

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
}

start();
