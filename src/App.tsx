import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SatelliteForm } from './components/SatelliteForm';
import { RiskDashboard } from './components/RiskDashboard';
import { analyzeSatelliteRisk, SatelliteData, PredictionResult } from './services/prediction';
import { Sparkles, Info, Globe, Rocket, ShieldAlert, Satellite } from 'lucide-react';

import { PredictionHistory } from './components/PredictionHistory';
import { FailureModes } from './components/FailureModes';

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
    <div className="relative min-h-screen p-4 md:p-8 lg:p-12">
      <div className="atmosphere" />
      
      <main className="max-w-4xl mx-auto space-y-16">
        {/* Vertical Header */}
        <header className="text-center space-y-4 pt-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
              <Satellite className="text-indigo-400" size={32} />
            </div>
            <div className="text-xs font-medium tracking-widest uppercase text-white/40">
              AI-Powered Orbital Intelligence
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-light tracking-tight"
          >
            Satellite<span className="aura-text font-medium">Thrive</span>
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

