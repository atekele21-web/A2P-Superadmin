import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Search,
} from 'lucide-react';
import { AuditRecord } from '../../types';

interface AuditViewProps {
  auditLogs: AuditRecord[];
}

export const AuditView: React.FC<AuditViewProps> = ({ auditLogs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.requestRef && log.requestRef.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (outcomeFilter !== 'all' && log.outcome !== outcomeFilter) return false;
    return true;
  });

  const getOutcomeBadge = (outcome: AuditRecord['outcome']) => {
    switch (outcome) {
      case 'Success':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Success
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Pending
          </span>
        );
      case 'Denied':
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> {outcome}
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Actor', 'Role', 'Action', 'Target Record', 'Outcome', 'Reason', 'Request Ref'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.actor,
      l.actorRole,
      l.action,
      l.target,
      l.outcome,
      l.reason || '',
      l.requestRef || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `simconnect_audit_log_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            Immutable Audit Trail & Regulatory Compliance
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {filteredLogs.length} Events
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident record of all Super Admin decisions, Sender ID state transitions, credential provisioning, and socket telemetry.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-xs text-slate-700 font-medium transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200/90 text-xs shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by actor, action, target, or reference..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg">
          {(['all', 'Success', 'Pending', 'Denied'] as const).map((ot) => (
            <button
              key={ot}
              onClick={() => setOutcomeFilter(ot)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                outcomeFilter === ot
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {ot}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Table */}
      <div className="rounded-xl bg-white border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Operator / Actor</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Target Record</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Audit Metadata / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-blue-600 font-semibold">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{log.actor}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">{log.action}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-blue-700">{log.target}</td>
                  <td className="py-3 px-4">{getOutcomeBadge(log.outcome)}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-sm leading-relaxed">
                    {log.reason || <span className="text-slate-400">—</span>}
                    {log.requestRef && (
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        Ref: {log.requestRef}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
