import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import { motion } from "motion/react";

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
  // Frontend-only: default mock user and no auth screen
  const [currentUser, setCurrentUser] = useState<User | null>({
    name: "Teacher A",
    lmsCode: "LMS123456",
  });
  const [backgroundImage] = useState(
    "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80",
  );

  // Persist default user once mounted (optional)
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("lms_user", JSON.stringify(currentUser));
    }
  }, [currentUser]);

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
      <motion.div
        key="dashboard"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Dashboard
          stats={getPersonalStats()}
          // Frontend-only: hide logout or repurpose
          onLogout={() => {
            // Optional: clear local mock session
            localStorage.removeItem("lms_user");
          }}
          backgroundImage={backgroundImage}
          userLmsCode={currentUser?.lmsCode || ''}
        />
      </motion.div>
    </div>
  );
}