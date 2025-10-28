import { User } from 'lucide-react';

interface PersonalStats {
  name: string;
  lmsCode: string;
  totalPoints: number;
  rank: string;
  completionRate: number;
  streak: number;
}

interface LiquidGlassCardProps {
  stats: PersonalStats;
  sheet?: any | null;
}

export default function LiquidGlassCard({ stats, sheet }: LiquidGlassCardProps) {
  // Header info must come from login info
  const name = stats.name;
  const lms = stats.lmsCode;
  const rank = sheet?.['Rank'] as string | undefined;
  const role = sheet?.['Role'] as string | undefined;
  // Simple formatter (TP with separators)
  const fmt = (label: string, v: any): string => {
    if (v == null || v === '') return '—';
    const num = Number(String(v).replace(/,/g, '').match(/-?\d+(\.\d+)?/)?.[0] ?? NaN);
    if (label === 'TP' && !Number.isNaN(num)) return num.toLocaleString();
    return String(v);
  };
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
            {(rank || role) && (
              <div className="flex flex-col items-end gap-2">
                {rank && (
                  <div className="px-3 py-1 rounded-full bg-white/30 border border-white/40 text-black/80 text-xs">
                    Rank: <span className="font-medium">{rank}</span>
                  </div>
                )}
                {role && (
                  <div className="px-3 py-1 rounded-full bg-white/30 border border-white/40 text-black/80 text-xs">
                    Role: <span className="font-medium">{role}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              {[ 
                { label: 'TP', value: sheet?.['TP'] },
                { label: 'Technical', value: sheet?.['Technical'] },
                { label: 'Điểm đánh giá', value: sheet?.['Điểm đánh giá'] },
              ].map((m) => (
                <div key={m.label} className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
                  <div className="text-black/60 text-sm mb-2">{m.label}</div>
                  <div className="text-black text-3xl leading-tight break-words">{fmt(m.label, m.value)}</div>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              {[ 
                { label: 'Điểm trung bình chuyên môn', value: sheet?.['Điểm trung bình chuyên môn'] },
                { label: 'Trial', value: sheet?.['Trial'] },
                { label: 'Sư Phạm', value: sheet?.['Sư Phạm'] },
                { label: 'Đánh giá', value: sheet?.['Đánh giá'] },
              ].map((m) => (
                <div key={m.label} className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
                  <div className="text-black/60 text-sm mb-2">{m.label}</div>
                  <div className="text-black text-3xl leading-tight break-words">{fmt(m.label, m.value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Subtle glass reflection effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
      </div>
      
  {/* Subtle neutral glow */}
  <div className="absolute inset-0 bg-red-500/12 blur-2xl -z-10 scale-95"></div>
    </div>
  );
}
