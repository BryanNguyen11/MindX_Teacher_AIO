import { useState, useEffect } from "react";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";
import { motion, AnimatePresence } from "motion/react";

interface User {
  name: string;
  lmsCode: string;
}

interface PersonalStats {
  name: string;
  lmsCode: string;
  totalPoints: number;
  rank: string;
  completionRate: number;
  streak: number;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(
    null,
  );
  const [backgroundImage] = useState(
    "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80",
  );

  // Check for stored session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("lms_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("lms_user");
      }
    }
  }, []);

  const handleLogin = async (lmsCode: string, password: string) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lmsCode, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Đăng nhập thất bại');
      const user: User = { name: data.user.name, lmsCode: data.user.lmsCode };
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('lms_user', JSON.stringify(user));
      localStorage.setItem('lms_token', data.token);
    } catch (e) {
      console.error(e);
      alert((e as Error).message);
    }
  };

  const handleRegister = async (
    lmsCode: string,
    password: string,
    name: string,
  ) => {
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lmsCode, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Đăng ký thất bại');
      const user: User = { name: data.user.name, lmsCode: data.user.lmsCode };
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('lms_user', JSON.stringify(user));
      localStorage.setItem('lms_token', data.token);
    } catch (e) {
      console.error(e);
      alert((e as Error).message);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("lms_user");
  };

  // Generate mock stats based on user
  const getPersonalStats = (): PersonalStats => {
    if (!currentUser) {
      return {
        name: "",
        lmsCode: "",
        totalPoints: 0,
        rank: "",
        completionRate: 0,
        streak: 0,
      };
    }

    // Generate consistent random-looking stats based on LMS code
    const seed = currentUser.lmsCode
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (min: number, max: number) =>
      min +
      (((seed * 9301 + 49297) % 233280) / 233280) * (max - min);

    return {
      name: currentUser.name,
      lmsCode: currentUser.lmsCode,
      totalPoints: Math.floor(random(1000, 9999)),
      rank: ["Đồng", "Bạc", "Vàng", "Bạch kim", "Kim cương"][
        Math.floor(random(0, 5))
      ],
      completionRate: Math.floor(random(60, 99)),
      streak: Math.floor(random(5, 45)),
    };
  };

  return (
  <div className="min-h-dvh bg-white">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-dvh relative overflow-hidden flex items-center justify-center p-4"
          >
            {/* Background (grayscale to match new palette) */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-neutral-700/60 to-neutral-600/50" />
            <div className="absolute top-20 left-10 w-72 h-72 bg-white/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full max-w-2xl mx-auto">
              <AuthForm
                onLogin={handleLogin}
                onRegister={handleRegister}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Dashboard
              stats={getPersonalStats()}
              onLogout={handleLogout}
              backgroundImage={backgroundImage}
              userLmsCode={currentUser?.lmsCode || ''}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}