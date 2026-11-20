import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { isSupabaseConfigured } from '../../../lib/supabase';
import { ScrollReveal } from '../../MedianStudio/ScrollReveal';

interface PortalLoginProps {
  navigate: (route: string) => void;
}

export const PortalLogin: React.FC<PortalLoginProps> = ({ navigate }) => {
  const { login, loginDemo, isAuthenticated, role } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect immediately
  React.useEffect(() => {
    if (isAuthenticated && role) {
      navigate(role === 'admin' ? '/portal/admin' : '/portal/client');
    }
  }, [isAuthenticated, role, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both your authorized email and password.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success && res.role) {
      navigate(res.role === 'admin' ? '/portal/admin' : '/portal/client');
    } else {
      setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleDemoSandbox = (targetRole: 'admin' | 'client') => {
    const res = loginDemo(targetRole);
    navigate(res.role === 'admin' ? '/portal/admin' : '/portal/client');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-black relative flex flex-col justify-between pt-24 pb-12 px-6 sm:px-12 selection:bg-median-taupe selection:text-white">
      {/* Background Architectural Grid Lines */}
      <div className="absolute inset-0 pointer-events-none flex justify-between px-6 md:px-16 overflow-hidden opacity-10">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="w-[1px] h-full bg-median-taupe" />
        ))}
      </div>

      {/* Top Breadcrumb & Status */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between text-[11px] uppercase tracking-widest text-median-taupe/80 relative z-10 mb-8">
        <button
          onClick={() => navigate('/')}
          className="hover:text-black transition-colors flex items-center gap-1.5 font-semibold"
        >
          <span>←</span>
          <span>Return to Site</span>
        </button>
        <div className="flex items-center gap-2 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{isSupabaseConfigured ? 'Supabase Auth: Ready' : 'Sandbox Mode'}</span>
        </div>
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full mx-auto relative z-10">
        <ScrollReveal variant="badge-drop" duration={800}>
          <div className="p-8 sm:p-10 rounded-2xl bg-white border border-median-taupe/20 shadow-xl shadow-median-taupe/5">
            {/* Monolith Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-4 h-4 bg-black flex items-center justify-center text-white text-[9px] font-bold">
                  ■
                </span>
                <span className="font-oswald text-xl font-bold tracking-[0.2em] text-black uppercase">
                  MONOLITH<span className="text-median-taupe ml-1">LK</span>
                </span>
              </div>
              <h1 className="font-oswald text-2xl sm:text-3xl font-bold uppercase tracking-tight text-black">
                Unified Portal Access
              </h1>
              <p className="text-xs text-median-taupe/80 font-normal uppercase tracking-wider mt-1">
                Client VIP Lounge & Executive Studio OS
              </p>
            </div>

            {/* Quick Demo Sandbox Pills */}
            <div className="mb-6 p-4 rounded-xl bg-median-taupe/5 border border-median-taupe/20">
              <span className="text-[10px] uppercase tracking-widest text-median-taupe/80 block mb-2 font-bold">
                Offline Preview Sandbox (Local Storage)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoSandbox('admin')}
                  className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-black bg-black text-white hover:bg-median-taupe hover:border-median-taupe transition-colors text-center"
                >
                  Admin Sandbox
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSandbox('client')}
                  className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-median-taupe text-black hover:bg-median-taupe hover:text-white transition-colors text-center"
                >
                  Client Sandbox
                </button>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Live Supabase Auth Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-black mb-1.5">
                  Authorized Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@monolith.lk or client@shadowtopup.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-black text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-black">
                    Security Passkey / Password
                  </label>
                  <span className="text-[10px] text-median-taupe/70">Live Supabase Auth</span>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-black text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-black text-white font-oswald text-base uppercase tracking-widest hover:bg-median-taupe transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Live DB</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-median-taupe/15 text-center text-[10px] text-median-taupe/60">
              SOC2 & HIPAA Compliant End-to-End Encryption · Monolith LK v2.4
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Footer Info */}
      <div className="max-w-md w-full mx-auto text-center text-[10px] uppercase text-median-taupe/60 relative z-10">
        Kurunegala · Giriulla · Colombo · Global Operations
      </div>
    </div>
  );
};
