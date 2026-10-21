import React, { useState } from 'react';
import {
  Plus,
  Copy,
  Check,
  Lock,
  Globe,
  X,
} from 'lucide-react';
import { APIKeyRecord, Partner } from '../../types';

interface APIManagementViewProps {
  mode: 'keys' | 'ip_whitelist';
  apiKeys: APIKeyRecord[];
  partners: Partner[];
  onCreateKey: (partnerId: string, label: string, allowlist: string[]) => { keyRecord: APIKeyRecord; oneTimeSecret: string };
  onRevokeKey: (keyId: string) => void;
}

export const APIManagementView: React.FC<APIManagementViewProps> = ({
  mode,
  apiKeys,
  partners,
  onCreateKey,
  onRevokeKey,
}) => {
  const [activeTab, setActiveTab] = useState<'keys' | 'ip'>(mode === 'ip_whitelist' ? 'ip' : 'keys');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState(partners[0]?.id || '');
  const [keyLabel, setKeyLabel] = useState('');
  const [ipInput, setIpInput] = useState('');
  const [createdSecretData, setCreatedSecretData] = useState<{ secret: string; label: string } | null>(null);
  const [hasCopiedSecret, setHasCopiedSecret] = useState(false);

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyLabel.trim() || !selectedPartnerId) return;

    const ips = ipInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const result = onCreateKey(selectedPartnerId, keyLabel.trim(), ips);
    setShowGenerateModal(false);
    setKeyLabel('');
    setIpInput('');
    setCreatedSecretData({
      secret: result.oneTimeSecret,
      label: result.keyRecord.keyLabel,
    });
  };

  const handleCopySecret = () => {
    if (createdSecretData) {
      navigator.clipboard.writeText(createdSecretData.secret);
      setHasCopiedSecret(true);
      setTimeout(() => setHasCopiedSecret(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            {activeTab === 'keys' ? 'API Client Credentials & Secrets' : 'IP Whitelist & CIDR Ingress Control'}
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {apiKeys.length} Active Keys
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise partner REST/HTTP API authentication keys with mandatory IP gateway restrictions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('keys')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'keys'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              API Keys
            </button>
            <button
              onClick={() => setActiveTab('ip')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'ip'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              IP Whitelist
            </button>
          </div>

          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Provision API Key</span>
          </button>
        </div>
      </div>

      {/* Security Best Practices Banner */}
      <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-slate-700 flex items-start gap-3">
        <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900">Zero-Exposure Policy:</strong> Raw API secrets are only generated once and transmitted immediately to the partner. Only the non-sensitive key identifier prefix (<code className="text-blue-700 font-semibold">sk_live_eth_...</code>) is stored in the database. Upstream Ethio telecom SMSC credentials are strictly isolated from partner access tokens.
        </div>
      </div>

      {/* Tab 1: API Keys List */}
      {activeTab === 'keys' && (
        <div className="rounded-xl bg-white border border-slate-200/90 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-3 px-4">Key Label & Partner</th>
                <th className="py-3 px-4">Key Prefix (Masked)</th>
                <th className="py-3 px-4">Allowed IP Ingress</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Last Dispatched</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {apiKeys.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{k.keyLabel}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{k.partnerName}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                    {k.prefix}••••••••
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {k.ipAllowlist.map((ip, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-700 font-medium"
                        >
                          {ip}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">{k.createdAt}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {k.lastUsedAt || <span className="text-slate-400 italic">Never</span>}
                  </td>
                  <td className="py-3 px-4">
                    {k.status === 'active' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold">
                        REVOKED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {k.status === 'active' && (
                      <button
                        onClick={() => {
                          if (confirm(`Revoke key "${k.keyLabel}"? Any downstream services using this key will be disconnected immediately.`)) {
                            onRevokeKey(k.id);
                          }
                        }}
                        className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-medium transition-colors"
                      >
                        Revoke Key
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: IP Whitelist Manager */}
      {activeTab === 'ip' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apiKeys.map((k) => (
              <div
                key={k.id}
                className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-3.5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{k.partnerName}</h3>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{k.keyLabel}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                    {k.ipAllowlist.length} Allowed Ingress IP(s)
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] text-slate-600 block font-medium">Configured CIDR / Static IPs:</span>
                  <div className="space-y-1.5">
                    {k.ipAllowlist.map((ip, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono"
                      >
                        <span className="text-slate-900 font-medium flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-blue-600" /> {ip}
                        </span>
                        <span className="text-[10px] text-slate-500">Fixed Node</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate API Key Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" /> Provision API Client Key
              </h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateKey} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Downstream Partner Account *</label>
                <select
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                >
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.companyName} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Key Label / System Description *</label>
                <input
                  type="text"
                  required
                  value={keyLabel}
                  onChange={(e) => setKeyLabel(e.target.value)}
                  placeholder="e.g. Production ERP Dispatch Gateway"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Allowed Ingress IPs (Comma-separated)
                </label>
                <input
                  type="text"
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  placeholder="e.g. 196.189.12.44, 197.156.90.0/24"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Leave empty to default to 0.0.0.0/0 (not recommended for production).
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
                >
                  Generate Secret Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* One-Time Secret Modal */}
      {createdSecretData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg p-6 bg-white border border-blue-200 rounded-2xl shadow-2xl text-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" /> API Secret Generated Successfully
            </h3>
            <p className="text-xs text-amber-800 bg-amber-50 p-3.5 rounded-lg border border-amber-200 leading-relaxed">
              ⚠️ <strong>Copy this secret key immediately!</strong> It will never be displayed again. If you lose this key, you will need to rotate and generate a new one.
            </p>

            <div>
              <span className="text-xs font-semibold text-slate-600 block mb-1">
                API Secret Key for {createdSecretData.label}:
              </span>
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 flex items-center justify-between text-xs font-mono text-blue-900 break-all select-all">
                <span className="font-semibold">{createdSecretData.secret}</span>
                <button
                  onClick={handleCopySecret}
                  className="ml-3 p-2 rounded-lg bg-white hover:bg-slate-50 text-blue-600 shrink-0 border border-slate-300 transition-colors shadow-xs"
                >
                  {hasCopiedSecret ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setCreatedSecretData(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
              >
                I Have Saved This Secret
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
