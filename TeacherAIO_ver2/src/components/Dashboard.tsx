import { useEffect, useState } from 'react';
import { LogOut, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import LiquidGlassCard from './LiquidGlassCard';
import Sidebar from './Sidebar';

interface PersonalStats {
  name: string;
  lmsCode: string;
  totalPoints: number;
  rank: string;
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
  const [sheetRows, setSheetRows] = useState<any[]>([]);
  const [sheetError, setSheetError] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    async function load() {
      setSheetError(null);
      try {
        if (!userLmsCode) return;
        const url = `/api/sheet?lmsCode=${encodeURIComponent(userLmsCode)}`;
        const res = await fetch(url);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || `Lỗi tải sheet (HTTP ${res.status})`);
  if (!aborted) setSheetRows(Array.isArray(data.rows) ? data.rows : []);
      } catch (e) {
        if (!aborted) setSheetError((e as Error).message);
      }
    }
    load();
    return () => { aborted = true; };
  }, [userLmsCode]);
  const displayName = stats.name; // greeting should use login name
  return (
    <div className="min-h-screen relative overflow-hidden">
  {/* Background with balanced overlay (grayscale) */}
  <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-neutral-700/60 to-neutral-600/50"></div>
      
      {/* Sidebar */}
      <Sidebar activePage="home" />
      
  {/* Content */}
  <div className="relative z-10 min-h-screen flex flex-col md:ml-64 pb-safe-20 md:pb-0">
        {/* Header */}
        <header className="px-4 py-6 md:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-white mb-1">Bảng điều khiển</h1>
              <p className="text-white/80">Chào mừng trở lại, {displayName}</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-8 md:px-8">
          <div className="w-full max-w-7xl grid grid-cols-1 gap-6">
            <div className="">
              <LiquidGlassCard stats={stats} sheet={sheetRows[0] || null} />
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="px-4 py-6 md:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-white/50 text-sm">
              © 2025 LMS System. Hệ thống quản lý học tập.
            </p>
          </div>
        </footer>
      </div>
      
      {/* Decorative elements - balanced */}
  <div className="absolute top-20 left-10 w-72 h-72 bg-white/25 rounded-full blur-3xl pointer-events-none"></div>
  <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}
