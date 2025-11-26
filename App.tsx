import React, { useState, useEffect } from 'react';
import { SalesPage } from './pages/SalesPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { StoreProvider } from './context/StoreContext';
import { Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const App: React.FC = () => {
  const [view, setView] = useState<'sales' | 'login' | 'admin'>('sales');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Check URL for secret admin parameter on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('portal') === 'admin') {
      setView('login');
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple authentication for the template
    // In a real production app with sensitive data, this should be server-side.
    if (password === 'admin123') { 
      setView('admin');
      setError('');
    } else {
      setError('Invalid Access Key');
      // Shake animation trigger could go here
    }
  };

  // --- Render Login Screen ---
  if (view === 'login') {
    return (
      <StoreProvider>
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
          {/* Background Ambience */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05),transparent_70%)]"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md relative z-10"
          >
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                    <Lock size={20} />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">Restricted Access</h1>
                  <p className="text-zinc-500 text-sm">Institutional Trading Blueprint™<br/>Backend Management Console</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <div className="relative">
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Access Key"
                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-center tracking-widest"
                        autoFocus
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center justify-center gap-2 text-red-400 text-xs bg-red-500/10 py-2 rounded-lg border border-red-500/20"
                    >
                      <AlertCircle size={12} /> {error}
                    </motion.div>
                  )}

                  <button 
                    type="submit"
                    className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 group"
                  >
                    Authenticate Access 
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                  </button>
                </form>
              </div>
              <div className="bg-zinc-900/50 border-t border-white/5 p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-600 uppercase tracking-wider">
                  <ShieldCheck size={12} /> End-to-End Encrypted Session
                </div>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <a href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Return to Sales Page</a>
            </div>
          </motion.div>
        </div>
      </StoreProvider>
    );
  }

  return (
    <StoreProvider>
      <div className="relative">
        {view === 'admin' ? <AdminDashboard /> : <SalesPage />}
      </div>
    </StoreProvider>
  );
};

export default App;