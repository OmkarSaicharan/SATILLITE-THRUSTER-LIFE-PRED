import React from 'react';
import { PredictionResult } from '../services/prediction';
import { motion } from 'motion/react';
import { AlertTriangle, ShieldCheck, Clock, TrendingUp, Zap, Flame, Percent, Activity, BarChart3 } from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';

interface Props {
  result: PredictionResult;
}

export const RiskDashboard: React.FC<Props> = ({ result }) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-emerald-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-orange-400';
      case 'Critical': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getPercentageColor = (val: number) => {
    if (val < 10) return 'text-emerald-400';
    if (val < 30) return 'text-yellow-400';
    if (val < 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const radarData = [
    { subject: 'Explosion', A: result.explosionRisk, fullMark: 100 },
    { subject: 'Failure', A: result.failureProbability, fullMark: 100 },
    { subject: 'Degradation', A: Math.min(100, (1 / (result.estimatedLifespan || 1)) * 100), fullMark: 100 },
    { subject: 'Engine Wear', A: Math.max(0, 100 - (result.engineLifeRemaining / 100)), fullMark: 100 },
    { subject: 'Anomalies', A: result.risks.length * 20, fullMark: 100 },
  ];

  const barData = [
    { name: 'Explosion', value: result.explosionRisk, color: '#f87171' },
    { name: 'Failure', value: result.failureProbability, color: '#fb923c' },
    { name: 'Health', value: Math.max(0, 100 - result.failureProbability), color: '#34d399' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <Clock className="text-indigo-400 mb-3" size={32} />
          <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Satellite Life</h3>
          <div className="text-3xl font-light aura-text">
            {result.estimatedLifespan} <span className="text-xs">Years</span>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <Zap className="text-orange-400 mb-3" size={32} />
          <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Engine Life</h3>
          <div className="text-3xl font-light text-orange-400">
            {result.engineLifeRemaining} <span className="text-xs">Hours</span>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <Flame className={`${getPercentageColor(result.explosionRisk)} mb-3`} size={32} />
          <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Explosion Risk</h3>
          <div className={`text-3xl font-light ${getPercentageColor(result.explosionRisk)}`}>
            {result.explosionRisk}<span className="text-xs">%</span>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <Percent className={`${getPercentageColor(result.failureProbability)} mb-3`} size={32} />
          <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Failure Prob</h3>
          <div className={`text-3xl font-light ${getPercentageColor(result.failureProbability)}`}>
            {result.failureProbability}<span className="text-xs">%</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 min-h-[350px]">
          <h3 className="text-sm font-medium mb-6 flex items-center gap-2 text-white/60">
            <Activity size={16} className="text-indigo-400" /> Risk Vector Analysis
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <Radar
                  name="Risk"
                  dataKey="A"
                  stroke="#ff4e00"
                  fill="#ff4e00"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 min-h-[350px]">
          <h3 className="text-sm font-medium mb-6 flex items-center gap-2 text-white/60">
            <BarChart3 size={16} className="text-orange-400" /> Critical Probability Comparison
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 flex flex-col items-center justify-center text-center border-orange-500/20">
        <AlertTriangle className={`${getRiskColor(result.riskLevel)} mb-4`} size={48} />
        <h3 className="text-white/60 text-sm uppercase tracking-widest mb-2">Overall Mission Risk</h3>
        <div className={`text-5xl font-light ${getRiskColor(result.riskLevel)}`}>
          {result.riskLevel}
        </div>
      </div>

      <div className="glass-card p-8">
        <h3 className="text-xl font-medium mb-6 flex items-center gap-2">
          <TrendingUp className="text-orange-400" /> Mission Health Summary
        </h3>
        <p className="text-white/80 leading-relaxed text-lg italic font-serif">
          "{result.summary}"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-8">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-red-400">
            <AlertTriangle size={20} /> Critical Anomalies
          </h3>
          <ul className="space-y-3">
            {result.risks.map((risk, i) => (
              <li key={i} className="flex items-start gap-3 text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                {risk}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-8">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-emerald-400">
            <ShieldCheck size={20} /> Stabilization Protocols
          </h3>
          <ul className="space-y-3">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};
