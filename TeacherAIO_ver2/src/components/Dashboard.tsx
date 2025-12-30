import { useEffect, useState } from 'react';
import { LogOut, RefreshCw, Link as LinkIcon, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import LiquidGlassCard from './LiquidGlassCard';
import Sidebar from './Sidebar';
import { Input } from './ui/input';
import { fetchSheetByLmsCode } from '../utils/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { fetchAdvancedByCode } from '../utils/sheet';
// Bỏ obfuscate mặc định, dùng ID sheet cũ để đảm bảo hoạt động
// Khôi phục link làm bài trực tiếp (không obfuscate)

interface PersonalStats {
  name: string;
  lmsCode: string;
  totalPoints: number;
  completionRate: number;
  streak: number;
}

interface DashboardProps {
  stats: PersonalStats;
  onLogout: () => void;
  backgroundImage: string;
  userLmsCode: string;
}

export default function Dashboard({ stats, onLogout, backgroundImage, userLmsCode }: DashboardProps) {
  const [activePage, setActivePage] = useState<string>('home');
  const [sheetRows, setSheetRows] = useState<any[]>([]);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [sheetSuccess, setSheetSuccess] = useState<string | null>(null);
  const [queryCode, setQueryCode] = useState<string>(userLmsCode || '');
  // Cấu hình sheet: cho phép người dùng gán link dữ liệu với mật khẩu
  const [sheetId, setSheetId] = useState<string>(() => {
    return localStorage.getItem('aio_sheet_id') || '1WgmLAeasNKCDo1JUm_5iDv9Ww5Wzh8rQ3EXCc8nSVvQ';
  });
  const [sheetLinkInput, setSheetLinkInput] = useState<string>('');
  const [sheetPwdInput, setSheetPwdInput] = useState<string>('');
  const SHEET_PWD = '191103';
  const [openSheetDialog, setOpenSheetDialog] = useState<boolean>(false);
  // State cho tab Đào tạo nâng cao
  const [advCode, setAdvCode] = useState<string>('');
  const [advAllRows, setAdvAllRows] = useState<Record<string, any>[]>([]);
  const [advRows, setAdvRows] = useState<Record<string, any>[]>([]);
  const [advError, setAdvError] = useState<string | null>(null);
  const ADV_SHEET_ID = '19uKKdBq3aZQ3dd2m3B_-Jk8RC7ffUdYRC25CM4zO8f4';

  // Helper: tìm giá trị ô trong row với nhiều chiến lược khớp label
  const findRowValue = (row: Record<string, any>, label: string) => {
    const short = String(label).split('\n')[0];
    const normalize = (s: string) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
    const keys = Object.keys(row || {});
    const exactKey = keys.find((k) => k === label) || keys.find((k) => k === short);
    const startsWithKey = keys.find((k) => normalize(k).startsWith(normalize(short)));
    const includesKey = keys.find((k) => normalize(k).includes(normalize(short)));
    const actualKey = exactKey || startsWithKey || includesKey || keys.find(Boolean) || label;
    return row[actualKey] ?? row[label] ?? row[short] ?? '';
  };

  // Cấu hình link Google Forms cho tính năng "Cải thiện điểm"
  // Lưu ý: điền URL tương ứng cho từng bài nếu có, để trống sẽ ẩn nút.
  const FORM_LINKS: Record<string, string> = {
    // Cập nhật chính xác theo dữ liệu mới do bạn cung cấp
    'Lesson 1\n[kỹ năng trao đổi với PHHS]': 'https://forms.gle/HErPEqqNUoyWX5aP9',
    'Lesson 2\n[Kỹ năng quan sát học viên]': 'https://docs.google.com/forms/d/e/1FAIpQLSfnUtOUnGBzNyfGIV1tvl_XO9UbVyHMDedHB1sznVwL1Fd_2g/viewform',
    'Lesson 3\n[Kỹ năng trao đổi với học viên]': 'https://docs.google.com/forms/d/e/1FAIpQLSdemZdhF4zmXvPAyOQRZvVZyYw_u4DOuYLBStXOKUDqIb8GUg/viewform',
    'Lesson 4\n[Định hướng & tạo động lực trong học tập]': 'https://forms.gle/QqavsiUDDrJWWtVK8',
    'Lesson 5\n[Hướng dẫn tổ chức học sinh làm dự án cuối khóa]': 'https://forms.gle/iVTzyPXyJDFXV4hn6',
    'Lesson 6\nHướng dẫn xây dựng bài giảng, giáo án sáng tạo': 'https://docs.google.com/forms/d/e/1FAIpQLScA88PTaQBGeq9bBGHZajxGvRzP_jkxlemEXPn1f7w06Hnsfw/viewform',
    'Lesson 7\nỨng dụng AI đổi mới phương pháp và nâng cao hiệu quả giảng dạy': 'https://docs.google.com/forms/d/e/1FAIpQLSeBSTU2pLzd7zQyjnjR0MwH8rXE5rhnx_X-TWeAagTC-jZtbQ/viewform',
    'Lesson 8\n[Bài tập] Hướng dẫn đánh giá, phản hồi kết quả học tập': 'https://forms.gle/5kx65SAyVysBJU7JA',
    'Lesson 9\nHướng Dẫn Sử Dụng AI4Student cho Giáo Viên': 'https://docs.google.com/forms/d/e/1FAIpQLSeu9yIgdRcKCgPnHQJDO67Gz4s8f-gAc5yVtS30--BV_Hl0Tw/viewform',
    'Lesson 10\nHướng Dẫn Sử Dụng AI4Teacher cho Giáo Viên': 'https://docs.google.com/forms/d/e/1FAIpQLSepfkGy05KQM0XZsVhgzfxEjtyGaYfWywr0ckpWHSLtyHI5_w/viewform',
    'Lesson 11\nQuản lý, tổ chức lớp học hiệu quả': 'https://docs.google.com/forms/d/e/1FAIpQLSeYKWmRzI2Q18Tk8pTiiBWiBKFXx-wD3aQzTL3xOfzxt3XtjA/viewform',
  };

  // Toggle hiển thị danh sách cải thiện điểm
  const [showImprove, setShowImprove] = useState<boolean>(false);
  // Confirm dialog for improving a 0-point lesson
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [confirmFormUrl, setConfirmFormUrl] = useState<string>('');
  const [confirmEdpuzzleUrl, setConfirmEdpuzzleUrl] = useState<string>('');
  const [confirmLabel, setConfirmLabel] = useState<string>('');

  useEffect(() => {
    let aborted = false;
    async function load() {
      setSheetError(null);
      try {
        if (!queryCode) return;
        if (!sheetId) {
          setSheetError('Chưa cấu hình Sheet ID hợp lệ. Vui lòng mở biểu tượng link để nhập link Google Sheet.');
          return;
        }
        const data = await fetchSheetByLmsCode(sheetId, queryCode);
        if (!aborted) {
          setSheetRows(Array.isArray(data.rows) ? data.rows : []);
          setSheetSuccess(`Tải dữ liệu thành công (${Array.isArray(data.rows) ? data.rows.length : 0} bản ghi).`);
        }
      } catch (e) {
        if (!aborted) setSheetError((e as Error).message);
      }
    }
    load();
    return () => { aborted = true; };
  }, [queryCode, sheetId]);

  // Tải toàn bộ dữ liệu một lần khi vào trang nâng cao
  useEffect(() => {
    let aborted = false;
    async function loadAdvAll() {
      try {
        if (activePage !== 'advanced') return;
        setAdvError(null);
        if (!ADV_SHEET_ID) {
          setAdvError('Chưa cấu hình Sheet nâng cao hợp lệ.');
          return;
        }
        const res = await fetchAdvancedByCode(ADV_SHEET_ID, '');
        if (!aborted) setAdvAllRows(Array.isArray(res.rows) ? res.rows : []);
      } catch (err) {
        if (!aborted) setAdvError((err as Error).message);
      }
    }
    loadAdvAll();
    return () => { aborted = true; };
  }, [activePage]);

  // Filter theo Code phía client để tránh load nhiều
  useEffect(() => {
    const code = advCode.trim().toLowerCase();
    if (!code) {
      setAdvRows([]);
      return;
    }
    // Match entered code against any cell value in the row to tolerate different header names
    const filtered = advAllRows.filter((r) => {
      return Object.values(r).some((v) => String(v ?? '').trim().toLowerCase() === code);
    });
    setAdvRows(filtered);
  }, [advCode, advAllRows]);
  // Ưu tiên tên từ dữ liệu Sheet (cột "Full name"), fallback về tên trong stats
  const displayName = (sheetRows[0]?.['Full name'] as string) || stats.name;
  return (
    <div className="min-h-dvh relative overflow-hidden">
  {/* Background with balanced overlay (grayscale) */}
  <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-neutral-700/60 to-neutral-600/50"></div>
      
      {/* Sidebar */}
  <Sidebar activePage={activePage} onNavigate={setActivePage} />
      
  {/* Content */}
  <div className="relative z-10 min-h-dvh flex flex-col md:ml-64 pb-safe-20 md:pb-0">
        {/* Header */}
        <header className="px-4 py-6 md:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-white mb-1">Trung tâm đào tạo</h1>
              
            </div>
            
            <div className="flex gap-2">
              {/* Icon mở popup đổi link sheet */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setOpenSheetDialog(true)}
                title="Đổi link dữ liệu"
              >
                <LinkIcon className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
              {/* Logout may be hidden in FE-only mode; keeping for clearing local session */}
            
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 flex items-start justify-center px-4 py-8 md:px-8">
          <div className="w-full max-w-7xl grid grid-cols-1 gap-6">
            {activePage === 'home' && (
            /* Query input for LMS code */
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Input
                  value={queryCode}
                  onChange={(e) => setQueryCode(e.target.value)}
                  placeholder="Nhập mã LMS (ví dụ: LMS123456)"
                  className="bg-white/80 text-black placeholder:text-gray-600"
                />
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => setQueryCode((q) => q.trim())}
                >
                  Tìm kiếm
                </Button>
              </div>
              {sheetError && (
                <p className="mt-2 text-red-300">{sheetError}</p>
              )}
              {sheetSuccess && (
                <p className="mt-2 text-green-300 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> {sheetSuccess}
                </p>
              )}
            </div>
            )}
            {activePage === 'advanced' && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 min-h-[50vh] flex flex-col">
              <div className="flex items-center gap-3">
                <Input
                  value={advCode}
                  onChange={(e) => setAdvCode(e.target.value)}
                  placeholder="Nhập mã LMS "
                  className="bg-white/80 text-black placeholder:text-gray-600"
                />
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => setAdvCode((c) => c.trim())}
                >
                  Xem tiến độ
                </Button>
              </div>
              {advError && <p className="mt-2 text-red-300">{advError}</p>}
              {/* Nút mở danh sách cải thiện điểm cho các bài chưa đạt 10 và khác 0 */}
              <div className="mt-3">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setShowImprove((v) => !v)}
                >
                  Cải thiện điểm ở các bài chưa đạt 10 và khác 0
                </Button>
              </div>
              {/* Thống kê: số bài điểm 0 và điểm trung bình (Điểm đánh giá) */}
              {advRows.length > 0 ? (
                <div className="mt-4 bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                  {(() => {
                    const toNumber = (v: any) => {
                      const m = String(v ?? '').replace(/,/g, '').match(/-?\d+(\.\d+)?/);
                      return m ? Number(m[0]) : 0;
                    };
                    // helper: tìm giá trị ô trong row với nhiều chiến lược khớp label
                    const findRowValue = (row: Record<string, any>, label: string) => {
                      const short = String(label).split('\n')[0];
                      const normalize = (s: string) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
                      const keys = Object.keys(row || {});
                      const exactKey = keys.find((k) => k === label) || keys.find((k) => k === short);
                      const startsWithKey = keys.find((k) => normalize(k).startsWith(normalize(short)));
                      const includesKey = keys.find((k) => normalize(k).includes(normalize(short)));
                      const actualKey = exactKey || startsWithKey || includesKey || keys.find(Boolean) || label;
                      return row[actualKey] ?? row[label] ?? row[short] ?? '';
                    };
                    // Danh sách label các bài học cần kiểm tra điểm 0
                    const lessonLabels = [
                      'Lesson 1\n[kỹ năng trao đổi với PHHS]',
                      'Lesson 2\n[Kỹ năng quan sát học viên]',
                      'Lesson 3\n[Kỹ năng trao đổi với học viên]',
                      'Lesson 4\n[Định hướng & tạo động lực trong học tập]',
                      'Lesson 5\n[Hướng dẫn tổ chức học sinh làm dự án cuối khóa]',
                      'Lesson 6\nHướng dẫn xây dựng bài giảng, giáo án sáng tạo',
                      'Lesson 7\nỨng dụng AI đổi mới phương pháp và nâng cao hiệu quả giảng dạy',
                      'Lesson 8\nHướng dẫn đánh giá, phản hồi kết quả học tập',
                      'Lesson 9',
                      'Lesson 10\n[Bài tập] Hướng dẫn đánh giá, phản hồi kết quả học tập',
                      'Lesson 11\nQuản lý, tổ chức lớp học hiệu quả',
                    ];
                    // Đếm số bài có điểm 0 trong bản ghi người dùng (dòng đầu tiên)
                    const first = advRows[0] as Record<string, any>;
                    const zeroLessonCount = lessonLabels.reduce((cnt, label) => {
                      const v = toNumber(findRowValue(first, label));
                      return cnt + (v === 0 ? 1 : 0);
                    }, 0);
                    // Điểm trung bình: lấy từ cột "Điểm đánh giá" (nếu nhiều dòng, lấy trung bình các giá trị)
                    const ratingVals = advRows.map((r) => toNumber(r['Điểm đánh giá']));
                    const avgRating = ratingVals.length ? (ratingVals.reduce((a, b) => a + b, 0) / ratingVals.length) : 0;
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white/30 rounded-xl p-3 border border-white/40">
                          <div className="text-black/60 text-sm">Số bài chưa hoàn thành</div>
                          <div className="text-black text-2xl">{zeroLessonCount}</div>
                        </div>
                        <div className="bg-white/30 rounded-xl p-3 border border-white/40">
                          <div className="text-black/60 text-sm">Điểm trung bình (Điểm đánh giá)</div>
                          <div className="text-black text-2xl">{avgRating.toFixed(2)}</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="mt-4 bg-white/10 rounded-2xl p-6 border border-white/20 flex-1 flex items-center justify-center">
                  <p className="text-white/70">Nhập mã LMS để xem tiến độ và điểm từng bài.</p>
                </div>
              )}
              {/* Hiển thị điểm theo các bài Lesson 1..11 */}
              {advRows.length > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(() => {
                    const row = advRows[0] as Record<string, any>;
                    const toNumber = (v: any) => {
                      const m = String(v ?? '').replace(/,/g, '').match(/-?\d+(\.\d+)?/);
                      return m ? Number(m[0]) : NaN;
                    };
                    const lessonLabels = [
                      'Lesson 1\n[kỹ năng trao đổi với PHHS]',
                      'Lesson 2\n[Kỹ năng quan sát học viên]',
                      'Lesson 3\n[Kỹ năng trao đổi với học viên]',
                      'Lesson 4\n[Định hướng & tạo động lực trong học tập]',
                      'Lesson 5\n[Hướng dẫn tổ chức học sinh làm dự án cuối khóa]',
                      'Lesson 6\nHướng dẫn xây dựng bài giảng, giáo án sáng tạo',
                      'Lesson 7\nỨng dụng AI đổi mới phương pháp và nâng cao hiệu quả giảng dạy',
                      'Lesson 8\nHướng dẫn đánh giá, phản hồi kết quả học tập',
                      'Lesson 9\nHướng Dẫn Sử Dụng AI4Student cho Giáo Viên',
                      'Lesson 10\nHướng Dẫn Sử Dụng AI4Teacher cho Giáo Viên',
                      'Lesson 11\nQuản lý, tổ chức lớp học hiệu quả',
                    ];
                    const edpuzzleClass = 'apfosji';
                    return lessonLabels.map((label) => {
                      const rawVal = findRowValue(row, label);
                      const short = String(label).split('\n')[0];
                      // Nếu dữ liệu là '-' hoặc rỗng thì coi như 0 và đánh dấu cảnh báo
                      const isDash = String(rawVal).trim() === '-' || String(rawVal).trim() === '';
                      const m = String(rawVal ?? '').replace(/,/g, '').match(/-?\d+(\.\d+)?/);
                      const score = isDash ? 0 : (m ? Number(m[0]) : NaN);
                      let formUrl = FORM_LINKS[label] || FORM_LINKS[short];
                      if (!formUrl) {
                        const found = Object.entries(FORM_LINKS).find(([k, v]) => {
                          const kshort = String(k).split('\n')[0];
                          const nk = String(kshort ?? '').toLowerCase();
                          const ns = String(short ?? '').toLowerCase();
                          return nk === ns || nk.startsWith(ns) || nk.includes(ns);
                        });
                        formUrl = found ? found[1] : '';
                      }
                      const edpuzzleUrl = `https://edpuzzle.com/join/${edpuzzleClass}`;
                      return (
                        <div key={label} className="bg-white/10 rounded-xl p-3 border border-white/20">
                          <div className="text-sm text-white/80 whitespace-pre-line">{label}</div>
                          <div className="mt-3 flex items-center gap-3">
                            <div className="text-white font-semibold w-16">{Number.isNaN(score) ? '-' : score}</div>
                            {isDash && (
                              <div className="text-xs text-yellow-300">Dữ liệu gốc: '-' → mặc định 0</div>
                            )}
                            <div className="flex-1 flex gap-3">
                              {/* Cải Thiện Điểm button */}
                              {formUrl ? (
                                Number.isNaN(score) ? (
                                  <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gray-400 text-white font-semibold opacity-60 cursor-not-allowed" disabled>
                                    <LinkIcon className="w-4 h-4 opacity-80" />
                                    <span>Cải Thiện Điểm</span>
                                  </button>
                                ) : score === 0 ? (
                                  <button
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-pink-500 text-white font-semibold shadow-2xl transform transition-transform duration-150 hover:scale-105"
                                    onClick={() => {
                                      setConfirmFormUrl(formUrl);
                                      setConfirmEdpuzzleUrl(edpuzzleUrl);
                                      setConfirmLabel(label);
                                      setConfirmOpen(true);
                                    }}
                                  >
                                    <LinkIcon className="w-4 h-4 opacity-95" />
                                    <span>Cải Thiện Điểm</span>
                                  </button>
                                ) : score > 0 && score < 10 ? (
                                  <a
                                    href={formUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Mở Google Form cho ${label}`}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-semibold shadow-2xl transform transition-transform duration-150 hover:scale-105"
                                  >
                                    <LinkIcon className="w-4 h-4 opacity-95" />
                                    <span>Cải Thiện Điểm</span>
                                  </a>
                                ) : (
                                  <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gray-400 text-white font-semibold opacity-60 cursor-not-allowed" disabled>
                                    <LinkIcon className="w-4 h-4 opacity-80" />
                                    <span>Cải Thiện Điểm</span>
                                  </button>
                                )
                              ) : (
                                <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gray-400 text-white font-semibold opacity-40 cursor-not-allowed" disabled>
                                  <LinkIcon className="w-4 h-4 opacity-80" />
                                  <span>Cải Thiện Điểm</span>
                                </button>
                              )}

                              {/* Edpuzzle button - always available */}
                              <a
                                href={edpuzzleUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Mở Edpuzzle cho ${label}`}
                                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold shadow-lg hover:scale-105"
                              >
                                <ExternalLink className="w-4 h-4 opacity-95" />
                                <span>Edpuzzle</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
              
              {/* Khi không có dữ liệu, khối placeholder phía trên sẽ đảm nhận việc lấp đầy không gian */}
            </div>
            )}
            {/* Removed separate Edpuzzle block - now handled inline with confirmation for 0-point lessons */}

            {/* Khôi phục: Liên kết Google Forms cải thiện điểm (chỉ hiển thị nếu điểm > 0 và < 10) */}
            {activePage === 'advanced' && advRows.length > 0 && showImprove && (
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                <div className="text-black/80 text-sm mb-3">Cải thiện điểm — gửi lại bài qua Google Forms</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(() => {
                    const row = advRows[0] as Record<string, any>;
                    const toNum = (v: any) => {
                      const m = String(v ?? '').replace(/,/g, '').match(/-?\d+(\.\d+)?/);
                      return m ? Number(m[0]) : NaN;
                    };
                    const labels = [
                      'Lesson 1\n[kỹ năng trao đổi với PHHS]',
                      'Lesson 2\n[Kỹ năng quan sát học viên]',
                      'Lesson 3\n[Kỹ năng trao đổi với học viên]',
                      'Lesson 4\n[Định hướng & tạo động lực trong học tập]',
                      'Lesson 5\n[Hướng dẫn tổ chức học sinh làm dự án cuối khóa]',
                      'Lesson 6\nHướng dẫn xây dựng bài giảng, giáo án sáng tạo',
                      'Lesson 7\nỨng dụng AI đổi mới phương pháp và nâng cao hiệu quả giảng dạy',
                      'Lesson 8\nHướng dẫn đánh giá, phản hồi kết quả học tập',
                      'Lesson 9',
                      'Lesson 10\n[Bài tập] Hướng dẫn đánh giá, phản hồi kết quả học tập',
                      'Lesson 11\nQuản lý, tổ chức lớp học hiệu quả',
                      // Bổ sung các form AI nếu cần kích hoạt cải thiện độc lập
                      '[Bài tập] Hướng Dẫn Sử Dụng AI4Student cho Giáo Viên]',
                      '[Bài tập] Hướng Dẫn Sử Dụng AI4Teacher cho Giáo Viên]',
                    ];
                    return labels
                      .filter((lbl) => {
                        const score = toNum(row[lbl]);
                        // Điều kiện cải thiện: >0 và <10
                        return !Number.isNaN(score) && score > 0 && score < 10;
                      })
                      .map((lbl) => {
                        const formUrl = FORM_LINKS[lbl];
                        if (!formUrl) return null; // Không có link thì bỏ qua
                        return (
                          <div key={lbl} className="flex flex-col gap-2 border border-white/40 rounded-xl p-3 bg-white/30">
                            <div className="text-sm whitespace-pre-line text-black/80">{lbl}</div>
                            <div className="flex gap-2">
                              <a
                                href={formUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                                title="Gửi lại bài để cải thiện điểm"
                              >
                                Mở Google Form
                              </a>
                            </div>
                            <div className="text-xs text-black/60">Điều kiện: điểm hiện tại &gt; 0 và &lt; 10</div>
                          </div>
                        );
                      })
                      .filter(Boolean);
                  })()}
                </div>
              </div>
            )}
            {activePage === 'home' && (
              <div className="">
                <LiquidGlassCard stats={stats} sheet={sheetRows[0] || null} />
              </div>
            )}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="px-4 py-6 md:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-white/50 text-sm">
              © 2025 Teacher All In One. Đây là hệ thống mô phỏng kiểm tra chỉ số, các dữ liệu đều là giả để minh họa và không có giá trị khi trong đối chứng tính minh bạch.
            </p>
          </div>
        </footer>
      </div>
      
      {/* Decorative elements - balanced */}
  <div className="absolute top-20 left-10 w-72 h-72 bg-white/25 rounded-full blur-3xl pointer-events-none"></div>
  <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
    {/* Popup đổi link sheet */}
    <Dialog open={openSheetDialog} onOpenChange={setOpenSheetDialog}>
      <DialogContent className="bg-white/90 text-black">
        <DialogHeader>
          <DialogTitle>Đổi link dữ liệu Google Sheet</DialogTitle>
          <DialogDescription>Nhập link sheet mới và mật khẩu để cập nhật</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            value={sheetLinkInput}
            onChange={(e) => setSheetLinkInput(e.target.value)}
            placeholder="Dán link Google Sheet (https://docs.google.com/spreadsheets/d/...)"
          />
          <Input
            value={sheetPwdInput}
            onChange={(e) => setSheetPwdInput(e.target.value)}
            placeholder="Nhập mật khẩu"
            type="password"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpenSheetDialog(false)}>Đóng</Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                try {
                  if (sheetPwdInput !== SHEET_PWD) {
                    setSheetError('Mật khẩu không đúng.');
                    return;
                  }
                  const match = sheetLinkInput.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
                  const newId = match?.[1];
                  if (!newId) {
                    setSheetError('Link Google Sheet không hợp lệ.');
                    return;
                  }
                  localStorage.setItem('aio_sheet_id', newId);
                  setSheetId(newId);
                  setOpenSheetDialog(false);
                  setSheetError(null);
                  setSheetSuccess('Cập nhật link sheet thành công.');
                } catch (err) {
                  setSheetError('Không thể cập nhật link sheet.');
                }
              }}
            >
              Lưu link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    {/* Dialog xác nhận cho cải thiện bài 0 điểm */}
    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <DialogContent className="bg-white/95 text-black max-w-md">
        <DialogHeader>
          <DialogTitle>Cảnh báo trước khi làm lại bài</DialogTitle>
          <DialogDescription>các câu hỏi trong bài tập cần xem video để hoàn thành đúng, bạn vẫn muốn tiếp tục làm bài ?</DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                // mở Edpuzzle
                if (confirmEdpuzzleUrl) window.open(confirmEdpuzzleUrl, '_blank', 'noopener');
                setConfirmOpen(false);
              }}
            >
              Mở Edpuzzle
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                // vẫn làm bài: mở form (nếu có) even if empty
                if (confirmFormUrl) window.open(confirmFormUrl, '_blank', 'noopener');
                setConfirmOpen(false);
              }}
            >
              Vẫn làm bài
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </div>
  );
}

// Note: Dialog component used above for sheet link reuses the project's Dialog.
