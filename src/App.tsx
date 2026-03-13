import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SatelliteForm } from './components/SatelliteForm';
import { RiskDashboard } from './components/RiskDashboard';
import { analyzeSatelliteRisk, SatelliteData, PredictionResult } from './services/prediction';
import { Sparkles, Info, Globe, Rocket, ShieldAlert, Satellite as SatelliteIcon } from 'lucide-react';

import { PredictionHistory } from './components/PredictionHistory';
import { FailureModes } from './components/FailureModes';

const SatelliteLogo = ({ className, size = 32 }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Main Body */}
    <path d="M7 11L11 7L17 13L13 17L7 11Z" />
    {/* Solar Panels */}
    <path d="M11 7L15 3" />
    <path d="M13 17L17 21" />
    <path d="M7 11L3 7" />
    <path d="M9 13L5 17" />
    
    {/* Signal Arcs */}
    <motion.path 
      d="M4 14C3 15 3 17 4 18" 
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 0 }}
    />
    <motion.path 
      d="M6 12C4 14 4 18 6 20" 
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
    />
    <motion.path 
      d="M8 10C5 13 5 19 8 22" 
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
    />
  </svg>
);

export default function App() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<PredictionResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleAnalyze = async (data: SatelliteData) => {
    setIsLoading(true);
    setError(null);
    try {
      const prediction = await analyzeSatelliteRisk(data);
      setResult(prediction);
      setRefreshKey(prev => prev + 1); // Refresh history
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen p-4 md:p-8 lg:p-12 overflow-x-hidden">
      <div className="atmosphere fixed inset-0 z-0" />
      
      {/* Cinematic Background Image (Satellite) */}
      <div className="fixed inset-0 z-[-1] opacity-30 pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072" 
          alt="Satellite in Space" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto space-y-16">
        {/* Vertical Header */}
        <header className="text-center space-y-4 pt-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="text-xs font-medium tracking-widest uppercase text-white/60 bg-black/20 backdrop-blur-md px-4 py-1 rounded-full border border-white/10">
              AI-Powered Orbital Intelligence
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-light tracking-tight"
          >
            Satellite<span className="aura-text font-medium">Thrive</span> 🛰️
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 max-w-2xl mx-auto text-lg font-serif italic"
          >
            Predicting mission longevity and orbital dangers through advanced atmospheric and celestial data synthesis.
          </motion.p>
        </header>

        <div className="space-y-12">
          {/* Input Section */}
          <section className="glass-card p-8 md:p-12">
            <h2 className="text-2xl font-medium mb-8 flex items-center gap-3">
              <Info className="text-indigo-400" size={24} /> Mission Parameters
            </h2>
            <SatelliteForm onSubmit={handleAnalyze} isLoading={isLoading} />
          </section>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3"
            >
              <ShieldAlert size={20} />
              {error}
            </motion.div>
          )}

          {/* Results Section */}
          <section>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-h-[400px] flex flex-col items-center justify-center text-center space-y-8"
                >
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Globe className="text-indigo-400 animate-pulse" size={32} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-light aura-text">Synthesizing Aura Data</h3>
                    <p className="text-white/40">Calculating orbital decay and radiation impact...</p>
                  </div>
                </motion.div>
              ) : result ? (
                <div className="space-y-12">
                  <RiskDashboard key="result" result={result} />
                  <div className="glass-card p-8 md:p-12">
                    <FailureModes />
                  </div>
                </div>
              ) : (
                <div className="space-y-12">
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card flex flex-col items-center justify-center text-center p-12 py-24 space-y-8"
                  >
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center animate-float">
                      <Rocket className="text-white/20" size={48} />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-light text-white/60">Ready for Analysis</h3>
                      <p className="text-white/30 max-w-sm mx-auto">
                        Enter your satellite's parameters above to generate a comprehensive risk and lifespan prediction.
                      </p>
                    </div>
                  </motion.div>
                  
                  <div className="glass-card p-8 md:p-12">
                    <FailureModes />
                  </div>
                </div>
              )}
            </AnimatePresence>
          </section>

          {/* History Section */}
          <section className="pt-8">
            <PredictionHistory key={refreshKey} />
          </section>
        </div>

        {/* Footer */}
        <footer className="pt-16 pb-12 border-t border-white/5 text-center space-y-4">
          <div className="flex justify-center gap-8 mb-4">
            <span className="text-white/10 text-[10px] uppercase tracking-[0.3em]">Precision Analytics</span>
            <span className="text-white/10 text-[10px] uppercase tracking-[0.3em]">Mission Critical</span>
          </div>
          <p className="text-white/20 text-xs tracking-widest uppercase">
            &copy; 2026 SatelliteThrive Aerospace Intelligence &bull; Orbital Risk Synthesis
          </p>
        </footer>
      </main>
    </div>
  );
}

