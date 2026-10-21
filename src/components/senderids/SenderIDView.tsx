import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Building,
  FileText,
  Calendar,
  X,
  ExternalLink,
  ShieldAlert,
  Send,
  Info,
} from 'lucide-react';
import { SenderIDRecord, SenderIDStatus, Partner } from '../../types';

interface SenderIDViewProps {
  mode: 'registry' | 'pending_smmp';
  senderIds: SenderIDRecord[];
  partners: Partner[];
  onRequestSenderID: (partnerId: string, proposedSenderId: string, businessPurpose: string) => void;
  onReviewInternal: (id: string, action: 'approve_forward' | 'reject', notes: string) => void;
  onRecordExternalSMMP: (id: string, action: 'approved' | 'rejected', refOrReason: string) => void;
  onOpenQuickSMS: () => void;
}

export const SenderIDView: React.FC<SenderIDViewProps> = ({
  mode,
  senderIds,
  partners,
  onRequestSenderID,
  onReviewInternal,
  onRecordExternalSMMP,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(mode === 'pending_smmp' ? 'smmp' : 'all');
  const [selectedRecord, setSelectedRecord] = useState<SenderIDRecord | null>(null);

  // Modals state
  const [showNewModal, setShowNewModal] = useState(false);
  const [newPartnerId, setNewPartnerId] = useState(partners[0]?.id || '');
  const [newSenderName, setNewSenderName] = useState('');
  const [newPurpose, setNewPurpose] = useState('');
  const [newError, setNewError] = useState<string | null>(null);

  // Review modal state
  const [reviewModalRecord, setReviewModalRecord] = useState<SenderIDRecord | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // External SMMP outcome modal state
  const [smmpModalRecord, setSmmpModalRecord] = useState<SenderIDRecord | null>(null);
  const [smmpAction, setSmmpAction] = useState<'approved' | 'rejected'>('approved');
  const [smmpRefOrReason, setSmmpRefOrReason] = useState('ETHIO-SMMP-APP-');

  const filteredRecords = senderIds.filter((s) => {
    const matchesSearch =
      s.senderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.requestReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.externalApprovalRef && s.externalApprovalRef.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (mode === 'pending_smmp') {
      return s.status === 'submitted_to_smmp' || s.status === 'pending_internal_review';
    }

    if (statusFilter === 'all') return true;
    if (statusFilter === 'smmp') return s.status === 'submitted_to_smmp';
    if (statusFilter === 'approved') return s.status === 'approved_configured';
    if (statusFilter === 'pending') return s.status === 'pending_internal_review';
    if (statusFilter === 'rejected') return s.status === 'rejected';
    if (statusFilter === 'suspended') return s.status === 'suspended';
    return true;
  });

  const getStatusBadge = (status: SenderIDStatus, isUsable: boolean) => {
    switch (status) {
      case 'approved_configured':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Carrier Configured (Usable)
          </span>
        );
      case 'submitted_to_smmp':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
            <Clock className="w-3 h-3 text-blue-600 animate-pulse" /> Awaiting Ethio telecom
          </span>
        );
      case 'pending_internal_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 font-mono">
            <Clock className="w-3 h-3 text-amber-600" /> Pending Admin Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 font-mono">
            <XCircle className="w-3 h-3 text-rose-600" /> Rejected
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 font-mono">
            <AlertTriangle className="w-3 h-3 text-slate-500" /> Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const handleCreateSenderID = (e: React.FormEvent) => {
    e.preventDefault();
    setNewError(null);

    const cleanSender = newSenderName.trim();
    if (!cleanSender || cleanSender.length < 3 || cleanSender.length > 11) {
      setNewError('Sender ID must be between 3 and 11 alphanumeric characters according to GSM standards.');
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(cleanSender)) {
      setNewError('Sender ID can only contain alphanumeric characters (no spaces or special punctuation).');
      return;
    }

    if (!newPurpose.trim()) {
      setNewError('Please provide the business purpose and use case for this Sender ID.');
      return;
    }

    onRequestSenderID(newPartnerId, cleanSender, newPurpose.trim());
    setShowNewModal(false);
    setNewSenderName('');
    setNewPurpose('');
  };

  const handleExecuteInternalReview = (action: 'approve_forward' | 'reject') => {
    if (!reviewModalRecord) return;
    onReviewInternal(reviewModalRecord.id, action, reviewNotes);
    setReviewModalRecord(null);
    setReviewNotes('');
  };

  const handleExecuteSmmpOutcome = () => {
    if (!smmpModalRecord) return;
    onRecordExternalSMMP(smmpModalRecord.id, smmpAction, smmpRefOrReason);
    setSmmpModalRecord(null);
    setSmmpRefOrReason('ETHIO-SMMP-APP-');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            {mode === 'pending_smmp' ? 'Ethio telecom SMMP Approval Queue' : 'Sender ID Registry & Approvals'}
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/70">
              {filteredRecords.length} Records
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'pending_smmp'
              ? 'Track submissions to Ethio telecom SMMP portal and record carrier provisioning codes.'
              : 'Official alphanumeric Sender IDs mapped to downstream partners with explicit two-tier authorization.'}
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs transition-all shadow-xs hover:shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Sender ID Request</span>
        </button>
      </div>

      {/* Two-Tier Workflow Explainer Banner */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-slate-700 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900">Two-Tier Compliance Model:</strong> Downstream partner requests are first vetted internally by SIMConnect Super Admins (<span className="text-amber-700 font-semibold">Tier 1: Internal Review</span>). Once verified, the submission is forwarded to Ethio telecom via SMMP (<span className="text-blue-700 font-semibold">Tier 2: Carrier Sync</span>). Messages can <strong className="text-slate-900 underline">ONLY</strong> be transmitted when the external approval reference code has been recorded and confirmed.
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Sender ID, partner, reference code..."
            className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
          />
        </div>

        {mode !== 'pending_smmp' && (
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-slate-500 text-[11px] mr-1 flex items-center gap-1 font-medium">
              <Filter className="w-3 h-3" /> Status:
            </span>
            {(['all', 'approved', 'smmp', 'pending', 'rejected', 'suspended'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {st === 'smmp' ? 'Ethio telecom SMMP' : st === 'approved' ? 'Configured' : st.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sender ID Table */}
      <div className="rounded-xl bg-white border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-3 px-4">Sender ID</th>
                <th className="py-3 px-4">Partner Name</th>
                <th className="py-3 px-4">Business Purpose</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Carrier Reference</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4 text-center">Messaging Usable?</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No Sender ID records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((sid) => (
                  <tr
                    key={sid.id}
                    onClick={() => setSelectedRecord(sid)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-blue-700 font-mono text-sm">
                        {sid.senderId}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Ref: {sid.requestReference}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{sid.partnerName}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                      {sid.businessPurpose}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(sid.status, sid.isConfiguredAndUsable)}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {sid.externalApprovalRef ? (
                        <span className="text-blue-700 font-semibold">{sid.externalApprovalRef}</span>
                      ) : (
                        <span className="text-slate-400 italic">None yet</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{sid.submissionDate}</td>
                    <td className="py-3 px-4 text-center">
                      {sid.isConfiguredAndUsable ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> YES
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" /> NO
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {sid.status === 'pending_internal_review' && (
                          <button
                            onClick={() => {
                              setReviewModalRecord(sid);
                              setReviewNotes('Business registry and trade name verified against trade license.');
                            }}
                            className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[11px] font-semibold transition-colors"
                          >
                            Review
                          </button>
                        )}

                        {sid.status === 'submitted_to_smmp' && (
                          <button
                            onClick={() => {
                              setSmmpModalRecord(sid);
                              setSmmpRefOrReason(`ETHIO-SMMP-APP-${Math.floor(100000 + Math.random() * 900000)}`);
                            }}
                            className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-semibold transition-colors"
                          >
                            Sync SMMP
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedRecord(sid)}
                          className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Details Drawer */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-xl h-full bg-white border-l border-slate-200 p-6 overflow-y-auto space-y-6 text-slate-800 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-mono text-blue-600 font-semibold">
                  Request Ref: {selectedRecord.requestReference}
                </span>
                <h2 className="text-xl font-bold text-slate-900 font-mono mt-1 text-blue-700">
                  {selectedRecord.senderId}
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                  {getStatusBadge(selectedRecord.status, selectedRecord.isConfiguredAndUsable)}
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Partner Ownership & Business Justification
              </h3>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div>
                  <span className="text-slate-500 block text-[11px]">Owning Partner:</span>
                  <span className="font-semibold text-slate-900">{selectedRecord.partnerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Stated Business Purpose:</span>
                  <p className="text-slate-700 leading-relaxed mt-0.5">{selectedRecord.businessPurpose}</p>
                </div>
              </div>
            </div>

            {/* Approval Milestones */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Two-Tier Verification Timeline
              </h3>
              <div className="space-y-2 text-xs">
                {/* Milestone 1: Submission */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">1. Submission by Downstream Partner</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">Recorded on {selectedRecord.submissionDate}</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>

                {/* Milestone 2: Internal Review */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">2. SIMConnect Super Admin Internal Vetting</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {selectedRecord.internalReviewer ? `Reviewed by ${selectedRecord.internalReviewer}` : 'Pending review'}
                    </div>
                    {selectedRecord.internalReviewNotes && (
                      <div className="text-[11px] text-blue-700 font-mono mt-1">"{selectedRecord.internalReviewNotes}"</div>
                    )}
                  </div>
                  {selectedRecord.internalReviewer ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500" />
                  )}
                </div>

                {/* Milestone 3: Ethio telecom SMMP */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">3. Ethio telecom SMMP Configuration</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {selectedRecord.externalApprovalRef
                        ? `Carrier Ref: ${selectedRecord.externalApprovalRef} (${selectedRecord.externalApprovalDate})`
                        : selectedRecord.status === 'submitted_to_smmp'
                        ? 'Submitted to carrier portal; awaiting configuration'
                        : 'Not submitted yet'}
                    </div>
                  </div>
                  {selectedRecord.externalApprovalRef ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions in Drawer */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Operator Actions
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedRecord.status === 'pending_internal_review' && (
                  <button
                    onClick={() => {
                      setReviewModalRecord(selectedRecord);
                      setSelectedRecord(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                  >
                    Open Internal Review
                  </button>
                )}

                {selectedRecord.status === 'submitted_to_smmp' && (
                  <button
                    onClick={() => {
                      setSmmpModalRecord(selectedRecord);
                      setSmmpRefOrReason(`ETHIO-SMMP-APP-${Math.floor(100000 + Math.random() * 900000)}`);
                      setSelectedRecord(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    Record Ethio telecom SMMP Code
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Internal Review Action Modal */}
      {reviewModalRecord && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg p-6 bg-white border border-slate-200 rounded-2xl shadow-2xl text-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" /> Tier 1: Internal Super Admin Vetting
            </h3>
            <p className="text-xs text-slate-600">
              Review Sender ID <strong className="text-blue-700 font-mono text-sm">{reviewModalRecord.senderId}</strong> for{' '}
              <strong className="text-slate-900">{reviewModalRecord.partnerName}</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Internal Verification Notes:
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Verified brand copyright, trade registry certificate, and official authorization letter."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                onClick={() => handleExecuteInternalReview('reject')}
                className="px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs"
              >
                Reject Request
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReviewModalRecord(null)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleExecuteInternalReview('approve_forward')}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-xs"
                >
                  Approve & Forward to Ethio telecom SMMP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* External SMMP Outcome Modal */}
      {smmpModalRecord && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg p-6 bg-white border border-slate-200 rounded-2xl shadow-2xl text-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-blue-600" /> Tier 2: Ethio telecom SMMP Carrier Outcome
            </h3>
            <p className="text-xs text-slate-600">
              Record carrier outcome for <strong className="text-blue-700 font-mono text-sm">{smmpModalRecord.senderId}</strong> ({smmpModalRecord.partnerName}).
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSmmpAction('approved')}
                className={`flex-1 py-2.5 rounded-lg border text-xs font-semibold transition-all ${
                  smmpAction === 'approved'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Ethio telecom Approved & Configured
              </button>
              <button
                type="button"
                onClick={() => setSmmpAction('rejected')}
                className={`flex-1 py-2.5 rounded-lg border text-xs font-semibold transition-all ${
                  smmpAction === 'rejected'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Carrier Rejected
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {smmpAction === 'approved'
                  ? 'Carrier Authorization Reference Code *'
                  : 'Carrier Rejection Reason *'}
              </label>
              <input
                type="text"
                value={smmpRefOrReason}
                onChange={(e) => setSmmpRefOrReason(e.target.value)}
                placeholder={smmpAction === 'approved' ? 'ETHIO-SMMP-APP-...' : 'Reason from carrier'}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setSmmpModalRecord(null)}
                className="px-3 py-2 text-slate-600 hover:text-slate-900 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteSmmpOutcome}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
              >
                Confirm Carrier Outcome
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Sender ID Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" /> New Sender ID Request
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {newError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{newError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSenderID} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Downstream Partner Account *</label>
                <select
                  value={newPartnerId}
                  onChange={(e) => setNewPartnerId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.companyName} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Proposed Alphanumeric Sender ID *
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={newSenderName}
                  onChange={(e) => setNewSenderName(e.target.value)}
                  placeholder="e.g. AwashAlert (3-11 alphanumeric characters)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  GSM standard maximum length is 11 alphanumeric characters. Must match registered brand or trade license.
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Business Purpose & Message Sample *</label>
                <textarea
                  rows={3}
                  value={newPurpose}
                  onChange={(e) => setNewPurpose(e.target.value)}
                  placeholder="State the exact type of notifications, alerts, or OTP messages to be transmitted..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Submit for Internal Vetting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
