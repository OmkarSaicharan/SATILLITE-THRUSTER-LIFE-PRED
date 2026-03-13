import React from 'react';
import { SatelliteData } from '../services/prediction';
import { Rocket, Gauge, Zap, Thermometer, Activity, Cpu, Compass, Settings } from 'lucide-react';

interface Props {
  onSubmit: (data: SatelliteData) => void;
  isLoading: boolean;
}

type Tab = 'propellant' | 'valve' | 'ignition' | 'flow' | 'thermal' | 'electronics' | 'guidance';

export const SatelliteForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [activeTab, setActiveTab] = React.useState<Tab>('propellant');
  const [formData, setFormData] = React.useState<SatelliteData>({
    name: 'Aura-Prime',
    tankPressure: 22,
    tankTemperature: 295,
    propellantMass: 1200,
    leakRate: 0.002,
    propellantPurity: 99.99,
    valveDutyCycle: 8,
    valveResponseTime: 22,
    regulatedPressure: 18,
    valveCycles: 450,
    igniterPulseDuration: 45,
    catalystTemp: 480,
    ignitionDelay: 8,
    catalystAgeing: 0.05,
    massFlowRate: 4.5,
    injectorDeltaP: 1.8,
    lineTemp: 285,
    particulateLevel: 2,
    nozzleTemp: 1150,
    thermalCycleRange: 120,
    vibrationLevel: 6.2,
    structuralIntegrityProxy: 0.98,
    busVoltage: 28.2,
    faultCodes: 'None',
    fdirThresholds: 'Nominal',
    thrustLevel: 20,
    isp: 235,
    redundancyLevel: 2,
    deltaVBudgetUsed: 5
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof SatelliteData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'propellant', label: 'Propellant', icon: Gauge },
    { id: 'valve', label: 'Valve', icon: Settings },
    { id: 'ignition', label: 'Ignition', icon: Zap },
    { id: 'flow', label: 'Flow', icon: Activity },
    { id: 'thermal', label: 'Thermal', icon: Thermometer },
    { id: 'electronics', label: 'Control', icon: Cpu },
    { id: 'guidance', label: 'Guidance', icon: Compass },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/60 flex items-center gap-2">
          <Rocket size={14} /> Satellite Name
        </label>
        <input
          type="text"
          required
          className="input-field w-full"
          placeholder="e.g. Aura-X1"
          value={formData.name}
          onChange={e => updateField('name', e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                : 'text-white/40 hover:bg-white/5'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px]">
        {activeTab === 'propellant' && (
          <>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Tank Pressure (bar)</label>
              <input type="number" className="input-field w-full" value={formData.tankPressure} onChange={e => updateField('tankPressure', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Tank Temp (K)</label>
              <input type="number" className="input-field w-full" value={formData.tankTemperature} onChange={e => updateField('tankTemperature', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Propellant Mass (kg)</label>
              <input type="number" className="input-field w-full" value={formData.propellantMass} onChange={e => updateField('propellantMass', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Leak Rate (bar/day)</label>
              <input type="number" step="0.001" className="input-field w-full" value={formData.leakRate} onChange={e => updateField('leakRate', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Purity (%)</label>
              <input type="number" step="0.1" className="input-field w-full" value={formData.propellantPurity} onChange={e => updateField('propellantPurity', Number(e.target.value))} />
            </div>
          </>
        )}

        {activeTab === 'valve' && (
          <>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Valve Duty Cycle (%)</label>
              <input type="number" className="input-field w-full" value={formData.valveDutyCycle} onChange={e => updateField('valveDutyCycle', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Response Time (ms)</label>
              <input type="number" className="input-field w-full" value={formData.valveResponseTime} onChange={e => updateField('valveResponseTime', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Regulated Pressure (bar)</label>
              <input type="number" className="input-field w-full" value={formData.regulatedPressure} onChange={e => updateField('regulatedPressure', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Actuation Cycles</label>
              <input type="number" className="input-field w-full" value={formData.valveCycles} onChange={e => updateField('valveCycles', Number(e.target.value))} />
            </div>
          </>
        )}

        {activeTab === 'ignition' && (
          <>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Igniter Pulse (ms)</label>
              <input type="number" className="input-field w-full" value={formData.igniterPulseDuration} onChange={e => updateField('igniterPulseDuration', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Catalyst Temp (K)</label>
              <input type="number" className="input-field w-full" value={formData.catalystTemp} onChange={e => updateField('catalystTemp', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Ignition Delay (ms)</label>
              <input type="number" className="input-field w-full" value={formData.ignitionDelay} onChange={e => updateField('ignitionDelay', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Catalyst Ageing Metric</label>
              <input type="number" step="0.01" className="input-field w-full" value={formData.catalystAgeing} onChange={e => updateField('catalystAgeing', Number(e.target.value))} />
            </div>
          </>
        )}

        {activeTab === 'flow' && (
          <>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Mass Flow Rate (g/s)</label>
              <input type="number" className="input-field w-full" value={formData.massFlowRate} onChange={e => updateField('massFlowRate', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Injector DeltaP (bar)</label>
              <input type="number" className="input-field w-full" value={formData.injectorDeltaP} onChange={e => updateField('injectorDeltaP', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Line Temp (K)</label>
              <input type="number" className="input-field w-full" value={formData.lineTemp} onChange={e => updateField('lineTemp', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Particulate Level (ppm)</label>
              <input type="number" className="input-field w-full" value={formData.particulateLevel} onChange={e => updateField('particulateLevel', Number(e.target.value))} />
            </div>
          </>
        )}

        {activeTab === 'thermal' && (
          <>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Nozzle Temp (K)</label>
              <input type="number" className="input-field w-full" value={formData.nozzleTemp} onChange={e => updateField('nozzleTemp', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Thermal Cycle Range (K)</label>
              <input type="number" className="input-field w-full" value={formData.thermalCycleRange} onChange={e => updateField('thermalCycleRange', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Vibration (g-rms)</label>
              <input type="number" step="0.1" className="input-field w-full" value={formData.vibrationLevel} onChange={e => updateField('vibrationLevel', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Structural Proxy (0-1)</label>
              <input type="number" step="0.01" className="input-field w-full" value={formData.structuralIntegrityProxy} onChange={e => updateField('structuralIntegrityProxy', Number(e.target.value))} />
            </div>
          </>
        )}

        {activeTab === 'electronics' && (
          <>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Bus Voltage (V)</label>
              <input type="number" className="input-field w-full" value={formData.busVoltage} onChange={e => updateField('busVoltage', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Fault Codes</label>
              <input type="text" className="input-field w-full" value={formData.faultCodes} onChange={e => updateField('faultCodes', e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs text-white/40">FDIR Thresholds</label>
              <input type="text" className="input-field w-full" value={formData.fdirThresholds} onChange={e => updateField('fdirThresholds', e.target.value)} />
            </div>
          </>
        )}

        {activeTab === 'guidance' && (
          <>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Thrust Level (N)</label>
              <input type="number" className="input-field w-full" value={formData.thrustLevel} onChange={e => updateField('thrustLevel', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Isp (s)</label>
              <input type="number" className="input-field w-full" value={formData.isp} onChange={e => updateField('isp', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Redundancy (Spares)</label>
              <input type="number" className="input-field w-full" value={formData.redundancyLevel} onChange={e => updateField('redundancyLevel', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Delta-V Used (%)</label>
              <input type="number" className="input-field w-full" value={formData.deltaVBudgetUsed} onChange={e => updateField('deltaVBudgetUsed', Number(e.target.value))} />
            </div>
          </>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing Telemetry...' : 'Generate Full Risk Profile'}
      </button>
    </form>
  );
};
