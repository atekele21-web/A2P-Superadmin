import React, { useState } from 'react';
import {
  Clock,
} from 'lucide-react';
import { SMSTemplateRecord, Partner, SenderIDRecord } from '../../types';

interface TemplatesAndScheduleViewProps {
  mode: 'templates' | 'schedule' | 'bulk_monitor';
  templates: SMSTemplateRecord[];
  partners: Partner[];
  senderIds: SenderIDRecord[];
  onOpenQuickSMS: () => void;
}

export const TemplatesAndScheduleView: React.FC<TemplatesAndScheduleViewProps> = ({
  mode,
  templates,
  partners,
  senderIds,
  onOpenQuickSMS,
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'schedule' | 'bulk'>(
    mode === 'bulk_monitor' ? 'bulk' : mode === 'schedule' ? 'schedule' : 'templates'
  );

  // Simulated scheduled messages
  const [scheduledBatches, setScheduledBatches] = useState([
    {
      id: 'sch_001',
      title: 'Awash Northern Route Shift Reminders',
      partner: 'Awash Express Cargo',
      senderId: 'AwashAlert',
      recipientsCount: 45,
      scheduledFor: '2026-10-22 05:30 EAT',
      status: 'scheduled',
    },
    {
      id: 'sch_002',
      title: 'Zemen Mart Weekend Discount Blast',
      partner: 'Zemen Commerce & Distribution',
      senderId: 'ZemenMart',
      recipientsCount: 250,
      scheduledFor: '2026-10-24 09:00 EAT',
      status: 'scheduled',
    },
  ]);

  // Simulated bulk monitor jobs
  const [bulkJobs] = useState([
    {
      id: 'bulk_001',
      batchRef: 'BATCH-20261021-9901',
      partner: 'Awash Express Cargo',
      senderId: 'AwashCargo',
      totalRecipients: 120,
      processed: 120,
      delivered: 120,
      failed: 0,
      status: 'completed',
      submittedAt: '2026-10-21 02:00',
    },
    {
      id: 'bulk_002',
      batchRef: 'BATCH-20261020-8841',
      partner: 'Addis Rides On-Demand',
      senderId: 'AddisRide',
      totalRecipients: 50,
      processed: 50,
      delivered: 50,
      failed: 0,
      status: 'completed',
      submittedAt: '2026-10-20 18:30',
    },
  ]);

  const handleCancelSchedule = (id: string) => {
    if (confirm('Are you sure you want to cancel this scheduled message batch?')) {
      setScheduledBatches((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            {activeTab === 'templates' && 'Pre-approved Message Templates'}
            {activeTab === 'schedule' && 'Scheduled SMS Message Queue'}
            {activeTab === 'bulk' && 'Bulk SMS Dispatch Monitor'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'templates' && 'Manage reusable message bodies with standard parameter tokens ({OTP}, {TRACKING_NO}).'}
            {activeTab === 'schedule' && 'Monitor and manage timed release message batches scheduled across enterprise partners.'}
            {activeTab === 'bulk' && 'Real-time progress tracker and delivery metrics for multi-recipient broadcast batches.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'templates'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'schedule'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Scheduled Queue
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'bulk'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulk Monitor
          </button>
        </div>
      </div>

      {/* Tab 1: Templates */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3 hover:border-blue-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                      {tpl.category}
                    </span>
                    <span className="text-[11px] text-slate-400">{tpl.lastUpdated}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-2.5">{tpl.title}</h3>
                  <p className="text-xs text-slate-700 mt-2 font-mono bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                    {tpl.content}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">
                    Sender ID: <strong className="text-blue-700 font-mono font-semibold">{tpl.senderIdSuggested}</strong>
                  </span>
                  <button
                    onClick={onOpenQuickSMS}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Use Template &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Scheduled Messages */}
      {activeTab === 'schedule' && (
        <div className="rounded-xl bg-white border border-slate-200/90 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-3 px-4">Batch Title</th>
                <th className="py-3 px-4">Partner</th>
                <th className="py-3 px-4">Sender ID</th>
                <th className="py-3 px-4 text-center">Recipients</th>
                <th className="py-3 px-4">Scheduled Release</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scheduledBatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No scheduled message batches pending in the release queue.
                  </td>
                </tr>
              ) : (
                scheduledBatches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{b.title}</td>
                    <td className="py-3 px-4 text-slate-600">{b.partner}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600">{b.senderId}</td>
                    <td className="py-3 px-4 text-center font-mono font-medium text-slate-800">{b.recipientsCount}</td>
                    <td className="py-3 px-4 font-mono font-medium text-amber-700">{b.scheduledFor}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" /> Scheduled
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleCancelSchedule(b.id)}
                        className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-medium transition-colors"
                      >
                        Cancel Release
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Bulk Monitor */}
      {activeTab === 'bulk' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bulkJobs.map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-blue-600 font-semibold">{job.batchRef}</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{job.partner}</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                    Completed (100%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>Processed: {job.processed} / {job.totalRecipients}</span>
                    <span className="text-emerald-700 font-semibold">100%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-full" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block">Sender ID:</span>
                    <span className="font-mono text-blue-700 font-semibold">{job.senderId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Delivered:</span>
                    <span className="font-mono text-emerald-700 font-bold">{job.delivered}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Failed:</span>
                    <span className="font-mono text-slate-500">{job.failed}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
