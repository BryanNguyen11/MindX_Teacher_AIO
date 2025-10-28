import { useState } from 'react';
import { motion } from 'motion/react';
import { Key, LogIn, UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import '../styles/auth.css';

interface AuthFormProps {
  onLogin: (lmsCode: string, password: string) => void;
  onRegister: (lmsCode: string, password: string, name: string) => void;
}

export default function AuthForm({ onLogin, onRegister }: AuthFormProps) {
  const [loginLmsCode, setLoginLmsCode] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerLmsCode, setRegisterLmsCode] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginLmsCode && loginPassword) {
      onLogin(loginLmsCode, loginPassword);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerLmsCode && registerPassword && registerName) {
      onRegister(registerLmsCode, registerPassword, registerName);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
  <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 border border-white/30">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white overflow-hidden shadow-lg flex items-center justify-center">
            <img
              src="https://th.bing.com/th/id/OIP.jpYgt7LLopR9SBXyUNb4DwHaHa?w=149&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3"
              alt="App logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-black mb-2">Teacher All IN ONE</h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              Đăng nhập
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              Đăng ký
            </TabsTrigger>
          </TabsList>

          {/* Login Form */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-lms" className="text-gray-700">Mã LMS</Label>
                <Input
                  id="login-lms"
                  type="text"
                  placeholder="LMS123456"
                  value={loginLmsCode}
                  onChange={(e) => setLoginLmsCode(e.target.value)}
                  className="border-gray-200 focus:border-black focus:ring-black/30"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-gray-700">Mật khẩu</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="border-gray-200 focus:border-black focus:ring-black/30"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Đăng nhập
              </Button>
            </form>
          </TabsContent>

          {/* Register Form */}
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name" className="text-gray-700">Họ và tên</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="border-gray-200 focus:border-black focus:ring-black/30"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-lms" className="text-gray-700">Mã LMS</Label>
                <Input
                  id="register-lms"
                  type="text"
                  placeholder="LMS123456"
                  value={registerLmsCode}
                  onChange={(e) => setRegisterLmsCode(e.target.value)}
                  className="border-gray-200 focus:border-black focus:ring-black/30"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-gray-700">Mật khẩu</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="border-gray-200 focus:border-black focus:ring-black/30"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Đăng ký
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-center text-sm text-black">
            Hệ thống quản lý thông tin học tập
          </p>
        </div>
      </div>
    </motion.div>
  );
}
