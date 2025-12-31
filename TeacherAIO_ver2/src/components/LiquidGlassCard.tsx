import { User } from 'lucide-react';

interface PersonalStats {
  name: string;
  lmsCode: string;
  totalPoints: number;
  completionRate: number;
  streak: number;
}

interface LiquidGlassCardProps {
  stats: PersonalStats;
  sheet?: any | null;
}

export default function LiquidGlassCard({ stats, sheet }: LiquidGlassCardProps) {
  // Ưu tiên lấy từ dữ liệu sheet: 'Full name' và 'Code'; fallback về stats
  const name = (sheet?.['Full name'] as string) || stats.name;
  const lms = (sheet?.['Code'] as string) || stats.lmsCode;
  const role = sheet?.['Role'] as string | undefined;
  // Helper: tìm trường trong sheet theo nhiều biến thể tên
  const getField = (obj: any, label: string) => {
    if (!obj) return undefined;
    if (obj[label] !== undefined) return obj[label];
    const short = String(label).split('\n')[0];
    if (obj[short] !== undefined) return obj[short];
    // normalize: remove diacritics and punctuation for more flexible matching
    const normalizeSpaces = (s = '') => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
    const alnum = (s = '') =>
      String(s ?? '')
        .normalize('NFKD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^\p{L}\p{N}]+/gu, '')
        .toLowerCase();
    const target = alnum(short);
    const keys = Object.keys(obj);
    // exact normalized match
    let foundKey = keys.find((k) => alnum(k) === target);
    // includes match (handle '20% (2)' vs '20%')
    if (!foundKey) foundKey = keys.find((k) => alnum(k).includes(target) || target.includes(alnum(k)));
    // fallback to looser whitespace-normalized includes
    if (!foundKey) {
      const t = normalizeSpaces(short);
      foundKey = keys.find((k) => normalizeSpaces(k).includes(t) || t.includes(normalizeSpaces(k)));
    }
    if (foundKey) return obj[foundKey];
    return undefined;
  };
  // Simple formatter (TP with separators)
  const fmt = (label: string, v: any): string => {
    if (v == null || v === '') return '—';
    const sRaw = String(v).trim();
    // treat lone dash as zero
    const s = sRaw === '-' ? '0' : sRaw;
    // If value already includes a percent sign, show as-is
    if (s.includes('%')) return s;
    const match = String(s).replace(/,/g, '').match(/-?\d+(\.\d+)?/);
    const num = Number(match?.[0] ?? NaN);

    // Completion rate: show as percentage
    if (/completion rate/i.test(label)) {
      if (Number.isNaN(num)) return '—';
      let pct = num;
      // if value looks like a fraction (0-1), convert to percent
      if (Math.abs(pct) <= 1) pct = pct * 100;
      // format: integer when whole, else one decimal
      const isWhole = Math.abs(pct - Math.round(pct)) < 1e-9;
      return `${isWhole ? Math.round(pct) : pct.toFixed(1)}%`;
    }

    // TP keeps thousand separators
    if (/^TP$/i.test(label) && !Number.isNaN(num)) return num.toLocaleString();

    return String(v);
  };
  // Không ẩn bất kỳ cột nào, hiển thị toàn bộ
  // Ordered sheet headers to display (use this exact order/labels)
  const SHEET_HEADERS = [
    'Full name',
    'Code',
    'User name',
    'Khối',
    'Status',
    'Role',
    'CR45',
    '15%',
    'TP',
    '20%',
    'Completion rate',
    '20%',
    'Chỉ số chậm/ không hoàn thành DL',
    '20%',
    'Điểm trung bình chuyên môn',
    '25%',
    'Technical',
    'Trial',
    'Sư phạm',
    'Điểm đánh giá\n(Max = 5)',
    'Xếp loại',
    'Đánh giá',
  ];
  // Map từ chữ cái cột sang header thật để hiển thị đúng nhãn
  const HEADER_BY_LETTER: Record<string, string> = {
    A: 'Full name',
    B: 'Code',
    C: 'User name',
    D: 'Khối',
    E: 'Status',
    F: 'Role',
    G: 'CR45',
    H: '15%',
    I: 'TP',
    J: '20%',
    K: 'Completion rate',
    L: '20%',
    M: 'Chỉ số chậm/ không hoàn thành DL',
    N: '20%',
    O: 'Điểm trung bình chuyên môn',
    P: '25%',
    Q: 'Technical',
    R: 'Trial',
    S: 'Sư phạm',
    T: 'Điểm đánh giá\n(Max = 5)',
    U: 'Xếp loại',
    V: 'Đánh giá',
  };
  // Chỉ giữ những trường sau (theo yêu cầu) và theo thứ tự này
  const KEEP_HEADERS = [
    'Khối',
    'Status',
    'CR45',
    'TP',
    'Completion rate',
    'Chỉ số chậm/ không hoàn thành DL',
    'Điểm trung bình chuyên môn',
    'Technical',
    'Trial',
    'Sư phạm',
    'Điểm đánh giá\n(Max = 5)',
    'Xếp loại',
    'Đánh giá',
  ];
  const normalize = (s = '') =>
    String(s ?? '')
      .normalize('NFKD')
      .replace(/\p{Diacritic}/gu, '')
  .replace(/[^\p{L}\p{N} ]+/gu, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Frosted glass card with matte finish */}
  <div className="relative backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl p-8 shadow-2xl overflow-hidden">
        {/* Static frosted background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6 pb-6 border-b border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/30 to-red-500/10 flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-black/90 mb-1 text-3xl md:text-4xl font-bold">{name}</h2>
                <p className="text-black/60 text-xs mt-1">Mã LMS: {lms}</p>
              </div>
            </div>
            {(role) && (
              <div className="flex flex-col items-end gap-2">
                {role && (
                  <div className="px-3 py-1 rounded-full bg-white/30 border border-white/40 text-black/80 text-xs">
                    Role: <span className="font-medium">{role}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Full sheet columns - render all preserved columns (exclude Full name and Code shown above)
              but hide columns listed in HIDDEN or legacy TP level fields */}
          {sheet && (
            <div className="mt-6">
              <h3 className="text-black/70 mb-3 text-sm">Toàn bộ dữ liệu (theo sheet)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(() => {
                  const cols = (sheet.__cols || SHEET_HEADERS) as string[];
                  const isLetters = Array.isArray(cols) && cols.length > 0 && cols.every((h) => /^[A-Z]$/.test(h));
                  // Dùng KEEP_HEADERS để đảm bảo thứ tự và chỉ hiển thị các trường cần giữ
                  return KEEP_HEADERS.map((keepHdr, idx) => {
                    let val: any;
                    // nếu sheet.__cols là letters, tìm letter tương ứng trong HEADER_BY_LETTER
                    if (isLetters) {
                      const letterEntry = Object.entries(HEADER_BY_LETTER).find(([, v]) => normalize(v) === normalize(keepHdr));
                      const letterKey = letterEntry ? letterEntry[0] : undefined;
                      if (letterKey && sheet[letterKey] !== undefined) val = sheet[letterKey];
                      else if (sheet[keepHdr] !== undefined) val = sheet[keepHdr];
                      else val = getField(sheet, keepHdr);
                    } else {
                      // nếu không phải letters, đọc theo header tên (hoặc dò tìm bằng getField)
                      if (sheet[keepHdr] !== undefined) val = sheet[keepHdr];
                      else val = getField(sheet, keepHdr);
                    }
                    return (
                      <div key={`${keepHdr}-${idx}`} className="bg-white/10 rounded-xl p-3 border border-white/20">
                        <div className="text-black/60 text-xs mb-1 whitespace-pre-line">{keepHdr}</div>
                        <div className="text-black text-lg">{fmt(keepHdr, val)}</div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
          
          {/* (Đã loại bỏ khối metrics tách riêng để tránh trùng lặp với "Toàn bộ dữ liệu") */}
        </div>
        
        {/* Subtle glass reflection effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
      </div>
      
  {/* Subtle neutral glow */}
  <div className="absolute inset-0 bg-red-500/12 blur-2xl -z-10 scale-95"></div>
    </div>
  );
}
