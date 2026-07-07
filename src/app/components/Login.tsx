import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './ui/input';
import loginBg from 'figma:asset/8880ee036b2a210f106e7e0d171904ef9c01ce28.png';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation - in production, this would call an API
    if (username && password) {
      onLogin();
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="bg-[#4a4a4a] rounded-3xl p-12 w-full max-w-[540px] shadow-2xl">
        <h1 className="text-white text-4xl font-bold text-center mb-10">CARGAIN</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">USERNAME</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Budget Calgary"
              className="w-full h-10 bg-white rounded-full px-4 text-gray-900 placeholder:text-gray-500 border-0"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-white text-sm font-medium">PASSWORD</label>
              <button
                type="button"
                className="text-[#5eb3d6] text-xs hover:text-[#4a9ac0] transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="········"
                className="w-full h-10 bg-white rounded-full px-4 pr-12 text-gray-900 placeholder:text-gray-500 border-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-[#d99a4e] hover:bg-[#c88a3e] text-white font-semibold rounded-full transition-colors shadow-lg"
          >
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}
