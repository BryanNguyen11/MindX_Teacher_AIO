import { Home, User, BookOpen, Award, Settings, BarChart3, Calendar, Bell } from 'lucide-react';

interface SidebarProps {
  activePage?: string;
}

export default function Sidebar({ activePage = 'home' }: SidebarProps) {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Trang chủ' },
    { id: 'schedule', icon: Calendar, label: 'Lịch làm việc' },
    { id: 'notifications', icon: Bell, label: 'Thông báo' },
  ];

  return (
    <>
      {/* Mobile bottom nav */}
      <aside className="fixed md:hidden bottom-0 left-0 right-0 h-16 bg-white/10 backdrop-blur-xl border-t border-white/20 z-[9999]">
        <nav className="h-full pb-[env(safe-area-inset-bottom,0px)]">
          <ul className="grid grid-cols-4 gap-1 h-full px-2 py-2">
            {menuItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <li key={item.id} className="flex">
                  <button
                    className={`flex-1 flex flex-col items-center justify-center rounded-xl text-xs transition ${
                      isActive ? 'bg-red-500 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                    aria-label={item.label}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="mt-1 leading-none">{item.label.split(' ')[0]}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Desktop/Tablet left sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 z-40">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 overflow-hidden shadow-lg flex items-center justify-center">
                <img
                  src="https://th.bing.com/th/id/OIP.jpYgt7LLopR9SBXyUNb4DwHaHa?w=149&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3"
                  alt="App logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-white">Teacher AIO</h2>
                
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <li key={item.id}>
                    <button
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-red-500 text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/20">
            <div className="text-left">
              <p className="text-white/40 text-xs">© 2025 Teacher All In One</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
