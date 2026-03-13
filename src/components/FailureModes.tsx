import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Droplets, Zap, Thermometer, Cpu, Settings, ShieldAlert } from 'lucide-react';

const failureModes = [
  {
    title: "Propellant Issues",
    icon: <Droplets className="text-blue-400" size={18} />,
    points: [
      "Micro-leaks in tanks, lines, or fittings slowly vent propellant.",
      "Misestimated fuel budget or extra maneuvers deplete propellant early."
    ]
  },
  {
    title: "Valve & Regulator Faults",
    icon: <Settings className="text-indigo-400" size={18} />,
    points: [
      "Valves/regulators stuck closed from contamination, wear, or cold-welding.",
      "Valves stuck open causing continuous thrust and uncontrolled attitude."
    ]
  },
  {
    title: "Ignition & Catalyst Failure",
    icon: <Zap className="text-yellow-400" size={18} />,
    points: [
      "Degraded catalyst bed (sintering) prevents proper propellant decomposition.",
      "Igniter malfunction (bad spark/heater) leading to weak or no ignition."
    ]
  },
  {
    title: "Blockages & Contamination",
    icon: <ShieldAlert className="text-red-400" size={18} />,
    points: [
      "Particles, frozen propellant, or gas bubbles blocking tiny injectors.",
      "Residual manufacturing debris or corrosion products clogging passages."
    ]
  },
  {
    title: "Thermal & Structural",
    icon: <Thermometer className="text-orange-400" size={18} />,
    points: [
      "Repeated hot/cold cycling cracking nozzles, joints, or welds.",
      "Local overheating from long burns damaging chambers or catalyst."
    ]
  },
  {
    title: "Electronics & Control",
    icon: <Cpu className="text-emerald-400" size={18} />,
    points: [
      "Failures in driver electronics preventing proper valve commands.",
      "Faulty sensors or software logic causing burn inhibition."
    ]
  },
  {
    title: "Design & Integration",
    icon: <AlertTriangle className="text-amber-400" size={18} />,
    points: [
      "Poor thruster placement causing plume impingement on solar panels.",
      "Insufficient redundancy turning a single fault into total propulsion loss."
    ]
  }
];

export function FailureModes() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="text-orange-500" size={20} />
        <h2 className="text-xl font-medium">Critical Failure Modes</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {failureModes.map((mode, idx) => (
          <motion.div
            key={mode.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              {mode.icon}
              <h3 className="text-sm font-semibold tracking-wide uppercase text-white/80">{mode.title}</h3>
            </div>
            <ul className="space-y-2">
              {mode.points.map((point, pIdx) => (
                <li key={pIdx} className="text-xs text-white/50 leading-relaxed flex gap-2">
                  <span className="text-indigo-500/50">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
