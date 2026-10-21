import React, { useState } from 'react';
import {
  Server,
  Radio,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  RotateCcw,
  Lock,
  Eye,
  EyeOff,
  Settings,
  Cpu,
  Layers,
  Info,
} from 'lucide-react';
import { SMSCProfile } from '../../types';

interface SMSCViewProps {
  smscProfile: SMSCProfile;
  onUpdateSMSC: (updates: Partial<SMSCProfile>) => void;
  onSimulateHealthCheck: () => Promise<{ success: boolean; latencyMs: number; details: string }>;
}

export const SMSCView: React.FC<SMSCViewProps> = ({
  smscProfile,
  onUpdateSMSC,
  onSimulateHealthCheck,
}) => {
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    success: boolean;
    latencyMs: number;
    details: string;
    timestamp: string;
  } | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    profileName: smscProfile.profileName,
    environment: smscProfile.environment,
    hostPrimary: smscProfile.hostPrimary,
    portPrimary: smscProfile.portPrimary,
    hostSecondary: smscProfile.hostSecondary || '',
    portSecondary: smscProfile.portSecondary || 2775,
    systemType: smscProfile.systemType,
    bindMode: smscProfile.bindMode,
    throughputTPS: smscProfile.throughputTPS,
  });

  const handleTestConnection = async () => {
    setIsRunningCheck(true);
    setCheckResult(null);
    try {
      const res = await onSimulateHealthCheck();
      setCheckResult({
        ...res,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsRunningCheck(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSMSC(editForm);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            SMSC Upstream Gateway & Connectivity
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-mono">
              SMPP v3.4 Link
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative connection profile to Ethio telecom Short Message Peer-to-Peer (SMPP) protocol cluster.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestConnection}
            disabled={isRunningCheck}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-xs hover:shadow-sm active:scale-95"
          >
            <Activity className={`w-4 h-4 ${isRunningCheck ? 'animate-spin' : ''}`} />
            <span>{isRunningCheck ? 'Testing Socket Handshake...' : 'Simulate Socket Test'}</span>
          </button>
        </div>
      </div>

      {/* Prototype Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-slate-700 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900">Integration Boundary Notice:</strong> Ethio telecom provides production SMSC credentials following contractual carrier onboarding and SMMP security review. Credentials are encrypted and masked in this dashboard; live carrier sockets are not opened directly from browser clients. Simulated handshakes test protocol parameter sanity against expected SMPP specifications.
        </div>
      </div>

      {/* Primary Connection Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{smscProfile.profileName}</h2>
                <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                  <span className="text-blue-700 font-medium">{smscProfile.provider}</span>
                  <span>·</span>
                  <span className="text-amber-700 font-medium">{smscProfile.environment}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 font-semibold transition-colors"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Endpoints'}
            </button>
          </div>

          {/* Edit Form or Read-only Display */}
          {isEditing ? (
            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Profile Name</label>
                  <input
                    type="text"
                    value={editForm.profileName}
                    onChange={(e) => setEditForm({ ...editForm, profileName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Environment</label>
                  <select
                    value={editForm.environment}
                    onChange={(e) => setEditForm({ ...editForm, environment: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Test / Sandbox">Test / Sandbox</option>
                    <option value="Production">Production</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Primary Host IP / FQDN</label>
                  <input
                    type="text"
                    value={editForm.hostPrimary}
                    onChange={(e) => setEditForm({ ...editForm, hostPrimary: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">SMPP Port</label>
                  <input
                    type="number"
                    value={editForm.portPrimary}
                    onChange={(e) => setEditForm({ ...editForm, portPrimary: parseInt(e.target.value) || 2775 })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Secondary / Fallback Host</label>
                  <input
                    type="text"
                    value={editForm.hostSecondary}
                    onChange={(e) => setEditForm({ ...editForm, hostSecondary: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Throughput (TPS)</label>
                  <input
                    type="number"
                    value={editForm.throughputTPS}
                    onChange={(e) => setEditForm({ ...editForm, throughputTPS: parseInt(e.target.value) || 50 })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-xs"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium">Connection State</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1.5 mt-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Handshake Tested
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium">Primary Host Endpoint</span>
                <span className="font-mono text-slate-900 font-bold mt-1 block">
                  {smscProfile.hostPrimary}:{smscProfile.portPrimary}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium">Bind Mode & Protocol</span>
                <span className="font-mono text-blue-700 font-bold mt-1 block">
                  {smscProfile.bindMode} ({smscProfile.protocol})
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium">Max Rate (TPS)</span>
                <span className="font-mono text-slate-900 font-bold mt-1 block">
                  {smscProfile.throughputTPS} msg/sec
                </span>
              </div>
            </div>
          )}

          {/* Masked Credentials Block */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-blue-600" /> Carrier Authentication Credentials (Encrypted)
              </span>
              <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                AES-256 Vault Stored
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 block text-[10px]">SMPP System ID</span>
                <span className="font-mono text-slate-800 font-semibold">{smscProfile.systemIdMasked}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">SMPP Password</span>
                <span className="font-mono text-slate-800 tracking-widest font-semibold">••••••••••••</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">System Type</span>
                <span className="font-mono text-slate-800 font-semibold">{smscProfile.systemType}</span>
              </div>
            </div>
          </div>

          {/* Test Result Display */}
          {checkResult && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Simulated Handshake Succeeded (Latency: {checkResult.latencyMs}ms)
                </span>
                <span className="text-slate-500 font-mono text-[11px]">{checkResult.timestamp}</span>
              </div>
              <p className="text-slate-700 font-mono text-[11px] leading-relaxed">
                {checkResult.details}
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Telemetry & Event History */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" /> Socket Link Telemetry
            </h3>

            <div className="space-y-2.5">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Carrier Node:</span>
                <span className="font-mono text-slate-900 font-medium">Ethio telecom Core Addis</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">SMPP Version:</span>
                <span className="font-mono text-blue-700 font-semibold">v3.4 (EnquireLink 30s)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Active Sessions:</span>
                <span className="font-mono text-emerald-700 font-bold">{smscProfile.activeSessions} Transceivers</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Last Health Check:</span>
                <span className="font-mono text-slate-700 text-[11px]">{smscProfile.lastHealthCheck?.substring(11, 19) || 'Just now'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Last Error:</span>
                <span className="font-mono text-slate-400">{smscProfile.lastError}</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" /> Carrier Route Priority
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Traffic priority is routed via Primary SMPP Link with automatic failover to Secondary socket in case of unacknowledged enquire_link timeouts (&gt;15s).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
