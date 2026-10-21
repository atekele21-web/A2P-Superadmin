import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Download,
  Send,
  X,
} from 'lucide-react';
import { SMSMessage, Partner, SenderIDRecord } from '../../types';

interface SMSLogsViewProps {
  mode: 'log' | 'send' | 'approval_queue';
  messages: SMSMessage[];
  partners: Partner[];
  senderIds: SenderIDRecord[];
  onOpenQuickSMS: () => void;
}

export const SMSLogsView: React.FC<SMSLogsViewProps> = ({
  mode,
  messages,
  partners,
  senderIds,
  onOpenQuickSMS,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'API' | 'Dashboard'>('all');
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<SMSMessage | null>(null);
  const [revealRecipient, setRevealRecipient] = useState(false);

  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      m.messageRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.recipientMasked.includes(searchQuery) ||
      m.senderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (channelFilter !== 'all' && m.channel !== channelFilter) return false;
    if (partnerFilter !== 'all' && m.partnerId !== partnerFilter) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;

    if (mode === 'approval_queue') {
      return m.status === 'queued';
    }

    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Message Reference', 'Partner', 'Sender ID', 'Recipient', 'Channel', 'Status', 'Segments', 'Cost ETB', 'Timestamp'];
    const rows = filteredMessages.map((m) => [
      m.messageRef,
      m.partnerName,
      m.senderId,
      m.recipientMasked,
      m.channel,
      m.status,
      m.segmentCount,
      m.costETB.toFixed(2),
      m.submittedAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `simconnect_sms_export_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            {mode === 'approval_queue'
              ? 'Promotional SMS Approval Queue'
              : mode === 'send'
              ? 'SMS Messaging Console'
              : 'SMS Operations & Delivery Logs'}
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {filteredMessages.length} Messages
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative audit log of message submissions, recipient masks, multipart segment counts, and upstream carrier receipt codes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-xs text-slate-700 font-medium transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenQuickSMS}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send SMS</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200/90 text-xs shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by message reference, recipient, sender, keywords..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Partner Dropdown */}
          <select
            value={partnerFilter}
            onChange={(e) => setPartnerFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:border-blue-500 shadow-xs"
          >
            <option value="all">All Partners</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.companyName}
              </option>
            ))}
          </select>

          {/* Channel selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg">
            {(['all', 'API', 'Dashboard'] as const).map((ch) => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
                  channelFilter === ch
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="rounded-xl bg-white border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-3 px-4">Message Ref</th>
                <th className="py-3 px-4">Partner</th>
                <th className="py-3 px-4">Sender ID</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Content Sample</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Segs</th>
                <th className="py-3 px-4 text-right">Cost (ETB)</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No message records match the current filters.
                  </td>
                </tr>
              ) : (
                filteredMessages.map((msg) => (
                  <tr
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      setRevealRecipient(false);
                    }}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                      {msg.messageRef}
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium truncate max-w-[140px]">
                      {msg.partnerName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-mono text-[11px] font-semibold">
                        {msg.senderId}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {msg.recipientMasked}
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-xs">
                      {msg.content}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-semibold ${
                          msg.channel === 'API' ? 'text-blue-700' : 'text-emerald-700'
                        }`}
                      >
                        {msg.channel}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Delivered
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700">
                      {msg.segmentCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-900 font-medium tabular-nums">
                      {msg.costETB.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500 text-[11px]">
                      {msg.submittedAt.substring(11)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Details Drawer */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg h-full bg-white border-l border-slate-200 p-6 overflow-y-auto space-y-6 text-slate-800 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-mono text-blue-600 uppercase font-semibold">Message Audit Record</span>
                <h2 className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                  {selectedMessage.messageRef}
                </h2>
                <div className="text-xs text-slate-500 mt-1">
                  Submitted: {selectedMessage.submittedAt}
                </div>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient & Partner card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Partner Account:</span>
                <span className="font-semibold text-slate-900">{selectedMessage.partnerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Sender ID:</span>
                <span className="font-mono text-blue-700 font-bold px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                  {selectedMessage.senderId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Recipient Mobile:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-900 font-semibold">
                    {revealRecipient ? selectedMessage.recipientFull : selectedMessage.recipientMasked}
                  </span>
                  <button
                    onClick={() => setRevealRecipient(!revealRecipient)}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    {revealRecipient ? 'Mask' : 'Reveal'}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Submission Channel:</span>
                <span className="font-semibold text-slate-900">{selectedMessage.channel}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Carrier Response Code:</span>
                <span className="font-mono text-emerald-700 font-semibold">{selectedMessage.providerResponseCode}</span>
              </div>
            </div>

            {/* Content text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Full Message Payload
                </span>
                <span className="font-mono text-slate-500 text-[11px]">
                  {selectedMessage.segmentCount} Segment(s) · {selectedMessage.encoding}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 leading-relaxed break-words font-mono">
                {selectedMessage.content}
              </div>
            </div>

            {/* Financial deduction */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 font-medium">Recorded Tariff Charge:</span>
                <span className="font-bold font-mono text-blue-700 text-sm">
                  ETB {selectedMessage.costETB.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Deducted from {selectedMessage.partnerName} pre-funded balance upon carrier acceptance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
