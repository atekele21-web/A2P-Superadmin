import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  AlertTriangle,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Smartphone,
  Info,
} from 'lucide-react';
import { Partner, SenderIDRecord, SMSTemplateRecord } from '../../types';

interface QuickSMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  partners: Partner[];
  senderIds: SenderIDRecord[];
  templates: SMSTemplateRecord[];
  onSend: (data: {
    partnerId: string;
    senderId: string;
    recipient: string;
    content: string;
  }) => { success: boolean; message?: string };
}

export const QuickSMSModal: React.FC<QuickSMSModalProps> = ({
  isOpen,
  onClose,
  partners,
  senderIds,
  templates,
  onSend,
}) => {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [selectedSenderId, setSelectedSenderId] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('+251 91 142 8890');
  const [content, setContent] = useState<string>('Your Awash Express Cargo consignment has arrived at Bole Hub. Pickup code: 4921.');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && partners.length > 0 && !selectedPartnerId) {
      const firstApproved = partners.find((p) => p.status === 'approved') || partners[0];
      setSelectedPartnerId(firstApproved.id);
    }
  }, [isOpen, partners, selectedPartnerId]);

  const partnerSenderIds = senderIds.filter((s) => s.partnerId === selectedPartnerId);
  const approvedSenderIds = partnerSenderIds.filter(
    (s) => s.status === 'approved_configured' && s.isConfiguredAndUsable
  );

  useEffect(() => {
    if (approvedSenderIds.length > 0) {
      if (!approvedSenderIds.some((s) => s.senderId === selectedSenderId)) {
        setSelectedSenderId(approvedSenderIds[0].senderId);
      }
    } else {
      setSelectedSenderId('');
    }
  }, [selectedPartnerId, approvedSenderIds]);

  if (!isOpen) return null;

  const currentPartner = partners.find((p) => p.id === selectedPartnerId);
  const isUnicode = /[^\u0000-\u007F]/.test(content);
  const maxPerSegment = isUnicode ? 70 : 160;
  const charCount = content.length;
  const segments = charCount === 0 ? 1 : Math.ceil(charCount / maxPerSegment);
  const estimatedCost = currentPartner ? (currentPartner.tariffPerSMS * segments).toFixed(2) : '0.00';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedPartnerId) {
      setErrorMsg('Please select a downstream partner account.');
      return;
    }

    if (!selectedSenderId) {
      setErrorMsg('An authorized, Ethio telecom-configured Sender ID is required. This partner has no approved Sender IDs available.');
      return;
    }

    if (!recipient.trim() || recipient.trim().length < 9) {
      setErrorMsg('Enter a valid mobile phone number (e.g., +251 91 142 8890).');
      return;
    }

    if (!content.trim()) {
      setErrorMsg('Message content cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = onSend({
        partnerId: selectedPartnerId,
        senderId: selectedSenderId,
        recipient: recipient.trim(),
        content: content.trim(),
      });

      setIsSubmitting(false);
      if (result.success) {
        setSuccessMsg(`Simulated SMS submitted successfully! Message logged with Sender ID "${selectedSenderId}".`);
        setTimeout(() => {
          onClose();
          setSuccessMsg(null);
        }, 1200);
      } else {
        setErrorMsg(result.message || 'Failed to submit simulated SMS.');
      }
    }, 400);
  };

  const handleApplyTemplate = (tpl: SMSTemplateRecord) => {
    setContent(tpl.content);
    if (approvedSenderIds.some((s) => s.senderId === tpl.senderIdSuggested)) {
      setSelectedSenderId(tpl.senderIdSuggested);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-slate-200/90 rounded-2xl shadow-2xl text-slate-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Quick SMS Dispatch
                <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                  Super Admin Console
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Send manual transactional message under strict partner context & authorized Sender ID rules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: 7 cols */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* 1. Downstream Partner Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Downstream Partner Context <span className="text-blue-600">*</span>
              </label>
              <select
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
              >
                {partners.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.status !== 'approved'}>
                    {p.companyName} ({p.code}) — {p.status.toUpperCase()} (Bal: ETB {p.balanceETB.toFixed(2)})
                  </option>
                ))}
              </select>
              {currentPartner && currentPartner.status !== 'approved' && (
                <p className="mt-1 text-[11px] text-amber-600 font-medium">
                  ⚠️ This partner is currently <strong className="uppercase">{currentPartner.status}</strong>. Messages cannot be dispatched until account is approved.
                </p>
              )}
            </div>

            {/* 2. Sender ID Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Authorized Sender ID <span className="text-blue-600">*</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  Ethio telecom Configured
                </span>
              </div>

              {approvedSenderIds.length === 0 ? (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  <div className="font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> No Approved Sender IDs Available
                  </div>
                  <p className="text-[11px] text-amber-700 mt-1">
                    {currentPartner?.companyName} does not have any Sender IDs with confirmed Ethio telecom SMMP approval. 
                    Please review pending Sender IDs in the Sender ID Registry before sending.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {approvedSenderIds.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSenderId(s.senderId)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                        selectedSenderId === s.senderId
                          ? 'bg-blue-50/90 border-blue-600 text-blue-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold font-mono text-blue-700 flex items-center justify-between">
                        <span>{s.senderId}</span>
                        <CheckCircle2 className={`w-3.5 h-3.5 ${selectedSenderId === s.senderId ? 'text-blue-600' : 'text-slate-300'}`} />
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        Ref: {s.externalApprovalRef || 'Carrier Active'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Recipient Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Recipient Mobile Number <span className="text-blue-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="+251 91 142 8890"
                  className="w-full px-3 py-2 pl-9 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Format: Ethiopian mobile (+251 9... / +251 7... / 09...)
              </p>
            </div>

            {/* 4. Message Content */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Message Content <span className="text-blue-600">*</span>
                </label>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className={charCount > maxPerSegment ? 'text-amber-600 font-semibold' : 'text-blue-600 font-semibold'}>
                    {charCount} chars
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-500">
                    {segments} segment{segments > 1 ? 's' : ''} ({isUnicode ? 'Unicode 70' : 'GSM-7 160'})
                  </span>
                </div>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Type your message text here..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors leading-relaxed"
              />
            </div>

            {/* Pre-approved Template loader */}
            <div>
              <span className="text-[11px] text-slate-500 font-medium block mb-1">Insert Pre-approved Template:</span>
              <div className="flex flex-wrap gap-1.5">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded text-[11px] text-slate-700 font-medium transition-colors"
                  >
                    {tpl.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Cost and Action Strip */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-slate-500 font-medium">Estimated Cost:</span>{' '}
                <strong className="text-slate-900 font-mono text-sm">ETB {estimatedCost}</strong>
                <span className="text-[10px] text-slate-500 ml-1">
                  ({segments} x {currentPartner?.tariffPerSMS || 0.35} ETB)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || approvedSenderIds.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs transition-all shadow-xs hover:shadow-sm active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Simulating Send...' : 'Dispatch Quick SMS'}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Right Column: Handset Screen Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-600 font-semibold mb-3 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>Handset Screen Preview</span>
            </div>

            {/* Handset Frame */}
            <div className="w-64 bg-slate-900 rounded-3xl p-3 shadow-xl relative border-4 border-slate-800">
              <div className="w-16 h-1 bg-slate-700 rounded-full mx-auto mb-3" />

              <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono px-1 mb-2">
                <span>05:15</span>
                <span>Ethio telecom 4G</span>
              </div>

              <div className="bg-slate-800/90 rounded-lg p-2 text-center border border-slate-700 mb-3">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">SMS from</div>
                <div className="text-xs font-bold text-white font-mono">
                  {selectedSenderId || 'Select Sender ID'}
                </div>
              </div>

              <div className="bg-blue-600 text-white rounded-xl p-3 text-xs shadow-md">
                <p className="text-[11px] leading-relaxed break-words font-medium">
                  {content || 'Enter message content to preview...'}
                </p>
                <div className="text-[9px] text-blue-100 text-right mt-1.5 font-mono">
                  Just now · Delivered
                </div>
              </div>

              <div className="mt-4 p-2 bg-slate-800/70 rounded-lg border border-slate-700 text-[10px] text-slate-400 text-center">
                <Info className="w-3 h-3 text-blue-400 inline mr-1" />
                <span>Simulated delivery in Super Admin testing environment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
