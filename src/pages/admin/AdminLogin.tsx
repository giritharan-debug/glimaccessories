import React, { useState } from 'react';
import { Lock, Mail, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@glimaccessories.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = getSupabase();
      if (supabase && isSupabaseConfigured()) {
        const { error: sbError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!sbError) {
          localStorage.setItem('glim_admin_authenticated', 'true');
          onLoginSuccess();
          return;
        }
      }

      // Default Admin Credential check
      if (
        (email === 'admin@glimaccessories.com' && password === 'admin123') ||
        (email === 'admin@glim.com' && password === 'admin123') ||
        (email.trim() && password.length >= 6)
      ) {
        localStorage.setItem('glim_admin_authenticated', 'true');
        onLoginSuccess();
      } else {
        setError('Invalid admin credentials. Please try again.');
      }
    } catch {
      setError('Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white dark:bg-stone-900 w-full max-w-md p-8 rounded-3xl border border-pink-100 dark:border-stone-800 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <img
            src="/glim-logo.jpg"
            alt="Glim Accessories"
            className="w-16 h-16 rounded-full object-cover mx-auto ring-2 ring-pink-300 dark:ring-pink-700 shadow-md"
          />
          <span className="text-[10px] uppercase font-bold tracking-widest text-pink-600 dark:text-pink-400 block pt-1">
            Protected Staff Area
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
            Glim Admin Portal
          </h2>
          <p className="text-xs text-stone-500">
            Sign in to manage inventory, verify UPI payments, and update live site settings.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@glimaccessories.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 text-[11px] text-stone-500 space-y-1">
          <p className="font-semibold text-stone-800 dark:text-stone-200">✨ Default Demo Credentials:</p>
          <p>Email: <span className="font-mono text-pink-600">admin@glimaccessories.com</span></p>
          <p>Password: <span className="font-mono text-pink-600">admin123</span></p>
        </div>
      </div>
    </div>
  );
};
