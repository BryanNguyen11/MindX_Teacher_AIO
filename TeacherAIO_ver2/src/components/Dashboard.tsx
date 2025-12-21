import { useEffect, useState } from 'react';
import { LogOut, RefreshCw, Link as LinkIcon, CheckCircle } from 'lucide-react';
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
    const filtered = advAllRows.filter((r) => String(r['Code'] ?? '').trim().toLowerCase() === code);
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
              <h1 className="text-white mb-1">CHECK SỐ ĐII !!!!</h1>
              
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
              {/* Thống kê: số bài điểm 0 và điểm trung bình (Điểm đánh giá) */}
              {advRows.length > 0 ? (
                <div className="mt-4 bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                  {(() => {
                    const toNumber = (v: any) => {
                      const m = String(v ?? '').replace(/,/g, '').match(/-?\d+(\.\d+)?/);
                      return m ? Number(m[0]) : 0;
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
                    ];
                    // Đếm số bài có điểm 0 trong bản ghi người dùng (dòng đầu tiên)
                    const first = advRows[0] as Record<string, any>;
                    const zeroLessonCount = lessonLabels.reduce((cnt, label) => {
                      const v = toNumber(first[label]);
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
              {/* Hiển thị điểm theo các bài Lesson 1..9 */}
              {advRows.length > 0 && (
                <div className="mt-4 bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                  <div className="text-black/80 text-sm mb-2">Điểm từng bài</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Lesson 1\n[kỹ năng trao đổi với PHHS]',
                      'Lesson 2\n[Kỹ năng quan sát học viên]',
                      'Lesson 3\n[Kỹ năng trao đổi với học viên]',
                      'Lesson 4\n[Định hướng & tạo động lực trong học tập]',
                      'Lesson 5\n[Hướng dẫn tổ chức học sinh làm dự án cuối khóa]',
                      'Lesson 6\nHướng dẫn xây dựng bài giảng, giáo án sáng tạo',
                      'Lesson 7\nỨng dụng AI đổi mới phương pháp và nâng cao hiệu quả giảng dạy',
                      'Lesson 8\nHướng dẫn đánh giá, phản hồi kết quả học tập',
                      'Lesson 9',
                    ].map((label) => (
                      <div key={label} className="bg-white/30 rounded-xl p-3 border border-white/40">
                        <div className="text-black/60 text-sm whitespace-pre-line">{label}</div>
                        <div className="text-black text-xl">
                          {(() => {
                            const m = String(advRows[0]?.[label] ?? '').replace(/,/g, '').match(/-?\d+(\.\d+)?/);
                            return m ? m[0] : '—';
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Khi không có dữ liệu, khối placeholder phía trên sẽ đảm nhận việc lấp đầy không gian */}
            </div>
            )}
            {/* Liên kết Edpuzzle cho các bài có điểm 0 (chỉ trong trang nâng cao) */}
            {activePage === 'advanced' && advRows.length > 0 && (
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                <div className="text-black/80 text-sm mb-3">Bài điểm 0 — bổ sung trên Edpuzzle</div>
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
                    ];
                    const classCode = 'apfosji';
                    const joinUrl = `https://edpuzzle.com/join/${classCode}`;
                    const guideUrl = 'https://www.youtube.com/watch?v=kgHsDr6pcWg';
                    return labels
                      .filter((lbl) => {
                        const score = toNum(row[lbl]);
                        return !Number.isNaN(score) && score === 0;
                      })
                      .map((lbl) => (
                        <div key={lbl} className="flex flex-col gap-2 border border-white/40 rounded-xl p-3 bg-white/30">
                          <div className="text-sm whitespace-pre-line text-black/80">{lbl}</div>
                          <div className="flex gap-2">
                            <a
                              href={joinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                              title={`Truy cập Edpuzzle (mã lớp: ${classCode})`}
                            >
                              Mở Edpuzzle
                            </a>
                            <a
                              href={guideUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800"
                              title="Hướng dẫn truy cập Edpuzzle"
                            >
                              Xem hướng dẫn
                            </a>
                          </div>
                          <div className="text-xs text-black/60">Mã lớp: {classCode}</div>
                        </div>
                      ));
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
    </div>
  );
}
