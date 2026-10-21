import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Building,
  Mail,
  Phone,
  FileText,
  Calendar,
  X,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Partner, PartnerStatus, SenderIDRecord } from '../../types';

interface PartnersViewProps {
  mode: 'all' | 'applications';
  partners: Partner[];
  senderIds: SenderIDRecord[];
  onUpdateStatus: (partnerId: string, status: PartnerStatus, reason: string) => void;
  onAddPartner: (data: Omit<Partner, 'id' | 'smsUsageCount' | 'senderIdCount' | 'lastActivity'>) => void;
  onOpenQuickSMS: () => void;
}

export const PartnersView: React.FC<PartnersViewProps> = ({
  mode,
  partners,
  senderIds,
  onUpdateStatus,
  onAddPartner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(mode === 'applications' ? 'pending' : 'all');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusChangeConfirm, setStatusChangeConfirm] = useState<{
    targetStatus: PartnerStatus;
    reason: string;
  } | null>(null);

  // New partner form state
  const [newPartnerData, setNewPartnerData] = useState({
    code: '',
    companyName: '',
    tradingName: '',
    businessLicense: '',
    tinNumber: '',
    primaryContact: '',
    contactEmail: '',
    contactPhone: '+251 9',
    address: '',
    city: 'Addis Ababa',
    status: 'under_review' as PartnerStatus,
    onboardingDate: new Date().toISOString().substring(0, 10),
    balanceETB: 1000,
    tariffPerSMS: 0.35,
    internalNotes: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Filter partners
  const filteredPartners = partners.filter((p) => {
    const matchesSearch =
      p.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tradingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.primaryContact.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (mode === 'applications') {
      return p.status === 'submitted' || p.status === 'under_review';
    }

    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return p.status === 'submitted' || p.status === 'under_review';
    return p.status === statusFilter;
  });

  const getStatusBadge = (status: PartnerStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
            <Clock className="w-3 h-3 text-amber-600" /> Under Review
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
            <FileText className="w-3 h-3 text-blue-600" /> Submitted
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
            <XCircle className="w-3 h-3 text-rose-600" /> Suspended
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200/80">
            <AlertTriangle className="w-3 h-3 text-red-600" /> Rejected
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

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newPartnerData.companyName.trim() || !newPartnerData.code.trim()) {
      setFormError('Legal company name and unique partner code are required.');
      return;
    }
    if (!newPartnerData.contactEmail.includes('@')) {
      setFormError('Please provide a valid company contact email.');
      return;
    }
    if (!newPartnerData.tinNumber.trim()) {
      setFormError('Ethiopian Tax Identification Number (TIN) is required.');
      return;
    }

    onAddPartner(newPartnerData);
    setShowAddModal(false);
    setNewPartnerData({
      code: '',
      companyName: '',
      tradingName: '',
      businessLicense: '',
      tinNumber: '',
      primaryContact: '',
      contactEmail: '',
      contactPhone: '+251 9',
      address: '',
      city: 'Addis Ababa',
      status: 'under_review',
      onboardingDate: new Date().toISOString().substring(0, 10),
      balanceETB: 1000,
      tariffPerSMS: 0.35,
      internalNotes: '',
    });
  };

  const handleConfirmStatusChange = () => {
    if (!selectedPartner || !statusChangeConfirm) return;
    onUpdateStatus(selectedPartner.id, statusChangeConfirm.targetStatus, statusChangeConfirm.reason);
    setSelectedPartner((prev) =>
      prev ? { ...prev, status: statusChangeConfirm.targetStatus } : null
    );
    setStatusChangeConfirm(null);
  };

  const partnerSenderIds = selectedPartner
    ? senderIds.filter((s) => s.partnerId === selectedPartner.id)
    : [];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            {mode === 'applications' ? 'Partner Onboarding Applications' : 'Downstream Business Partners'}
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/70">
              {filteredPartners.length} Total
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'applications'
              ? 'Review pending commercial registration, NBE license records, and tax clearance submissions.'
              : 'Enterprise clients onboarded to dispatch A2P messages via SIMConnect SMS.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs transition-all shadow-xs hover:shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Partner</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by partner name, trade name, code, contact..."
            className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
          />
        </div>

        {mode !== 'applications' && (
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-slate-500 text-[11px] mr-1 flex items-center gap-1 font-medium">
              <Filter className="w-3 h-3" /> Status:
            </span>
            {(['all', 'approved', 'under_review', 'suspended'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors capitalize ${
                  statusFilter === st
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Partner Table */}
      <div className="rounded-xl bg-white border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-3 px-4">Partner Name & Code</th>
                <th className="py-3 px-4">Primary Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Onboarding Date</th>
                <th className="py-3 px-4 text-center">Sender IDs</th>
                <th className="py-3 px-4 text-center">SMS Sent</th>
                <th className="py-3 px-4 text-right">Balance (ETB)</th>
                <th className="py-3 px-4 text-right">Tariff / SMS</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No partners found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPartners.map((partner) => (
                  <tr
                    key={partner.id}
                    onClick={() => setSelectedPartner(partner)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{partner.companyName}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                        <span className="text-blue-700 font-semibold">{partner.code}</span>
                        <span>·</span>
                        <span>{partner.tradingName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{partner.primaryContact}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{partner.contactEmail}</div>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(partner.status)}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{partner.onboardingDate}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200/60 text-blue-700 font-mono text-[11px] font-semibold">
                        {partner.senderIdCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700 tabular-nums">
                      {partner.smsUsageCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ETB {partner.balanceETB.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 tabular-nums">
                      ETB {partner.tariffPerSMS.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPartner(partner);
                        }}
                        className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-semibold transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partner Detail Drawer */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-xl h-full bg-white border-l border-slate-200 p-6 overflow-y-auto space-y-6 text-slate-800 shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="text-xs font-mono text-blue-600 uppercase tracking-wider font-semibold">
                  Partner ID: {selectedPartner.id} · {selectedPartner.code}
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedPartner.companyName}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  {getStatusBadge(selectedPartner.status)}
                  <span className="text-[11px] text-slate-500 font-medium">Trade: {selectedPartner.tradingName}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPartner(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial & Usage Strip */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Account Balance</div>
                <div className="text-base font-bold text-blue-700 font-mono tabular-nums mt-0.5">
                  ETB {selectedPartner.balanceETB.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Tariff / Segment</div>
                <div className="text-base font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                  ETB {selectedPartner.tariffPerSMS.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Total SMS Sent</div>
                <div className="text-base font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                  {selectedPartner.smsUsageCount}
                </div>
              </div>
            </div>

            {/* Business Verification Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Registration & Compliance Data
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Business License Ref:</span>
                  <span className="font-mono text-slate-900 font-semibold">{selectedPartner.businessLicense}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Tax Identification (TIN):</span>
                  <span className="font-mono text-slate-900 font-semibold">{selectedPartner.tinNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Primary Contact:</span>
                  <span className="text-slate-800 font-medium">{selectedPartner.primaryContact}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Contact Phone:</span>
                  <span className="font-mono text-slate-800">{selectedPartner.contactPhone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[11px]">Email Address:</span>
                  <span className="font-mono text-blue-700 font-medium">{selectedPartner.contactEmail}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[11px]">Registered Address:</span>
                  <span className="text-slate-700">{selectedPartner.address}, {selectedPartner.city}</span>
                </div>
              </div>
            </div>

            {/* Operator Notes */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Super Admin Operator Notes
              </h3>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
                {selectedPartner.internalNotes || 'No administrative notes recorded.'}
              </div>
            </div>

            {/* Assigned Sender IDs */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Configured Sender IDs ({partnerSenderIds.length})
              </h3>
              {partnerSenderIds.length === 0 ? (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500">
                  No Sender IDs requested or registered for this partner yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {partnerSenderIds.map((sid) => (
                    <div
                      key={sid.id}
                      className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs shadow-xs"
                    >
                      <div>
                        <div className="font-bold font-mono text-blue-700">{sid.senderId}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{sid.businessPurpose}</div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {sid.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status Change Action Buttons */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Account Status Controls
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedPartner.status !== 'approved' && (
                  <button
                    onClick={() =>
                      setStatusChangeConfirm({
                        targetStatus: 'approved',
                        reason: 'Trade license and corporate verification approved by Super Admin.',
                      })
                    }
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve Partner
                  </button>
                )}

                {selectedPartner.status !== 'suspended' && (
                  <button
                    onClick={() =>
                      setStatusChangeConfirm({
                        targetStatus: 'suspended',
                        reason: 'Account suspended by Super Admin pending inquiry.',
                      })
                    }
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Suspend Account
                  </button>
                )}

                {selectedPartner.status === 'suspended' && (
                  <button
                    onClick={() =>
                      setStatusChangeConfirm({
                        targetStatus: 'approved',
                        reason: 'Account reactivated after review.',
                      })
                    }
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Reactivate Account
                  </button>
                )}

                {selectedPartner.status === 'submitted' && (
                  <button
                    onClick={() =>
                      setStatusChangeConfirm({
                        targetStatus: 'under_review',
                        reason: 'Compliance documentation moved to under review.',
                      })
                    }
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    <Clock className="w-3.5 h-3.5" /> Mark Under Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Status Change */}
      {statusChangeConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-white border border-slate-200 rounded-2xl shadow-2xl text-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Confirm Partner Status Change
            </h3>
            <p className="text-xs text-slate-600">
              Change status of <strong className="text-slate-900">{selectedPartner?.companyName}</strong> to{' '}
              <span className="font-mono text-blue-700 font-bold uppercase">{statusChangeConfirm.targetStatus}</span>?
            </p>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Reason / Internal Audit Record:
              </label>
              <textarea
                value={statusChangeConfirm.reason}
                onChange={(e) =>
                  setStatusChangeConfirm((prev) => (prev ? { ...prev, reason: e.target.value } : null))
                }
                rows={2}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setStatusChangeConfirm(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-xs"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard New Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" /> Onboard Downstream Partner
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePartner} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Company Registered Name *</label>
                  <input
                    type="text"
                    required
                    value={newPartnerData.companyName}
                    onChange={(e) => setNewPartnerData({ ...newPartnerData, companyName: e.target.value })}
                    placeholder="e.g. Oromia Agro Logistics S.C."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Trading / Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={newPartnerData.tradingName}
                    onChange={(e) => setNewPartnerData({ ...newPartnerData, tradingName: e.target.value })}
                    placeholder="e.g. OromiaAgro"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Partner Code *</label>
                  <input
                    type="text"
                    required
                    value={newPartnerData.code}
                    onChange={(e) => setNewPartnerData({ ...newPartnerData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. OROMIA-AGRO"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono uppercase focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Business License Ref *</label>
                  <input
                    type="text"
                    required
                    value={newPartnerData.businessLicense}
                    onChange={(e) => setNewPartnerData({ ...newPartnerData, businessLicense: e.target.value })}
                    placeholder="BL/AA/2026/..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">TIN Number *</label>
                  <input
                    type="text"
                    required
                    value={newPartnerData.tinNumber}
                    onChange={(e) => setNewPartnerData({ ...newPartnerData, tinNumber: e.target.value })}
                    placeholder="0098234190"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Primary Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={newPartnerData.primaryContact}
                    onChange={(e) => setNewPartnerData({ ...newPartnerData, primaryContact: e.target.value })}
                    placeholder="Full name"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Business Email *</label>
                  <input
                    type="email"
                    required
                    value={newPartnerData.contactEmail}
                    onChange={(e) => setNewPartnerData({ ...newPartnerData, contactEmail: e.target.value })}
                    placeholder="contact@company.et"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={newPartnerData.contactPhone}
                    onChange={(e) => setNewPartnerData({ ...newPartnerData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Initial Balance (ETB)</label>
                  <input
                    type="number"
                    value={newPartnerData.balanceETB}
                    onChange={(e) => setNewPartnerData({ ...newPartnerData, balanceETB: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tariff / SMS (ETB)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPartnerData.tariffPerSMS}
                    onChange={(e) => setNewPartnerData({ ...newPartnerData, tariffPerSMS: parseFloat(e.target.value) || 0.35 })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Office Address & Subcity</label>
                <input
                  type="text"
                  value={newPartnerData.address}
                  onChange={(e) => setNewPartnerData({ ...newPartnerData, address: e.target.value })}
                  placeholder="e.g. Bole Subcity, Woreda 04"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Save & Initiate Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
