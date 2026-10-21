import React, { useState } from 'react';
import {
  FileText,
  MessageSquare,
  TrendingUp,
  LayoutGrid,
  Users,
  Server,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Partner, SenderIDRecord, SMSMessage, SMSCProfile } from '../../types';
import { CHART_DAILY_SMS, CHART_WEEKLY_API } from '../../data/mockData';
import { ActiveView } from '../layout/Sidebar';

interface DashboardViewProps {
  partners: Partner[];
  senderIds: SenderIDRecord[];
  messages: SMSMessage[];
  smscProfile: SMSCProfile;
  onNavigate: (view: ActiveView) => void;
  onOpenQuickSMS: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  partners,
  senderIds,
  messages,
  smscProfile,
  onNavigate,
  onOpenQuickSMS,
}) => {
  // Chart tooltip state
  const [hoveredDay, setHoveredDay] = useState<typeof CHART_DAILY_SMS[0] | null>(null);
  const [hoveredApiDay, setHoveredApiDay] = useState<typeof CHART_WEEKLY_API[0] | null>(null);
  const [recentFilter, setRecentFilter] = useState<'all' | 'API' | 'Dashboard'>('all');

  // Derive counts from actual store
  const totalBalance = partners.reduce((sum, p) => sum + p.balanceETB, 0);
  const totalSMS = messages.length;
  const apiSentSMS = messages.filter((m) => m.channel === 'API').length;
  const dashboardSentSMS = messages.filter((m) => m.channel === 'Dashboard').length;
  const activePartnersCount = partners.filter((p) => p.status === 'approved').length;
  const pendingPartnersCount = partners.filter((p) => p.status === 'under_review' || p.status === 'submitted').length;
  const pendingSenderIDsCount = senderIds.filter(
    (s) => s.status === 'submitted_to_smmp' || s.status === 'pending_internal_review'
  ).length;

  const filteredMessages = recentFilter === 'all' 
    ? messages.slice(0, 7)
    : messages.filter((m) => m.channel === recentFilter).slice(0, 7);

  // SVG dimensions for Daily SMS Volume
  const chartW = 540;
  const chartH = 170;
  const paddingX = 40;
  const paddingY = 25;
  const maxY = 5;

  // Compute points
  const pointsApi = CHART_DAILY_SMS.map((d, i) => {
    const x = paddingX + (i * (chartW - 2 * paddingX)) / (CHART_DAILY_SMS.length - 1);
    const y = chartH - paddingY - (d.apiSent / maxY) * (chartH - 2 * paddingY);
    return `${x},${y}`;
  }).join(' ');

  const pointsDash = CHART_DAILY_SMS.map((d, i) => {
    const x = paddingX + (i * (chartW - 2 * paddingX)) / (CHART_DAILY_SMS.length - 1);
    const y = chartH - paddingY - (d.dashboardSent / maxY) * (chartH - 2 * paddingY);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-6">
      {/* Title & Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboards</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome back! Here's what's happening with your SMS campaigns and downstream partner traffic.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
            Carrier Link: <span className="text-blue-700 font-semibold">{smscProfile.provider.split(' ')[0]} SMPP</span>
          </span>
        </div>
      </div>

      {/* Primary 5 Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Metric 1: Balance (ETB 6.34K) */}
        <div
          onClick={() => onNavigate('billing_management')}
          className="group p-4 rounded-xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Balance</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-mono tabular-nums">
              ETB {(totalBalance / 1000).toFixed(2)}K
            </span>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 font-semibold">
              <span>+0%</span>
              <span className="text-slate-400 font-normal text-[10px]">vs prior cycle</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Number of SMS (25) */}
        <div
          onClick={() => onNavigate('sms_log')}
          className="group p-4 rounded-xl bg-white border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Number of SMS</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-mono tabular-nums">
              {totalSMS}
            </span>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 font-semibold">
              <span>+0%</span>
              <span className="text-slate-400 font-normal text-[10px]">delivered</span>
            </div>
          </div>
        </div>

        {/* Metric 3: API Sent SMS (14) */}
        <div
          onClick={() => onNavigate('api_keys')}
          className="group p-4 rounded-xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>API Sent SMS</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-mono tabular-nums">
              {apiSentSMS}
            </span>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-blue-600 font-semibold">
              <span>+0%</span>
              <span className="text-slate-400 font-normal text-[10px]">56% share</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Dashboard Sent SMS (11) */}
        <div
          onClick={() => onNavigate('send_sms')}
          className="group p-4 rounded-xl bg-white border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Dashboard Sent SMS</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-105 transition-transform">
              <LayoutGrid className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-mono tabular-nums">
              {dashboardSentSMS}
            </span>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 font-semibold">
              <span>+0%</span>
              <span className="text-slate-400 font-normal text-[10px]">44% share</span>
            </div>
          </div>
        </div>

        {/* Metric 5: Active Contacts / Partners (6) */}
        <div
          onClick={() => onNavigate('contacts')}
          className="group p-4 rounded-xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer shadow-xs col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Contacts</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-mono tabular-nums">
              {partners.length}
            </span>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-blue-600 font-semibold">
              <span>+0%</span>
              <span className="text-slate-400 font-normal text-[10px]">{activePartnersCount} approved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Queue Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('partner_applications')}
          className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200/90 hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/70">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Partner Applications</div>
              <div className="text-[11px] text-slate-500">{pendingPartnersCount} awaiting trade license review</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>

        <div
          onClick={() => onNavigate('sender_id_pending_smmp')}
          className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/70">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Ethio telecom SMMP Queue</div>
              <div className="text-[11px] text-slate-500">{pendingSenderIDsCount} Sender IDs awaiting carrier sync</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>

        <div
          onClick={() => onNavigate('smsc_gateway')}
          className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200/90 hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/70">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">SMSC Socket Gateway</div>
              <div className="text-[11px] text-slate-500">SMPP v3.4 Simulated Handshake OK</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Two Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Chart: SMS Volume */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">SMS Volume</h2>
              <p className="text-[11px] text-slate-500">Daily SMS sending patterns over the last week</p>
            </div>
            <span className="text-[10px] font-mono font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/70">
              Demo Data
            </span>
          </div>

          {/* SVG Line Chart */}
          <div className="mt-4 relative h-48 w-full">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              {/* Horizontal Grid lines */}
              {[0, 1, 2, 3, 4, 5].map((val) => {
                const y = chartH - paddingY - (val / maxY) * (chartH - 2 * paddingY);
                return (
                  <g key={val}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartW - paddingX}
                      y2={y}
                      stroke="#F1F5F9"
                      strokeWidth="1.5"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 3}
                      fill="#94A3B8"
                      fontSize="9"
                      textAnchor="end"
                      fontFamily="JetBrains Mono"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* API Sent Path (Professional Blue) */}
              <polyline
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                points={pointsApi}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Dashboard Sent Path (Professional Green Dotted) */}
              <polyline
                fill="none"
                stroke="#16A34A"
                strokeWidth="2"
                strokeDasharray="4 4"
                points={pointsDash}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Data points for API */}
              {CHART_DAILY_SMS.map((d, i) => {
                const x = paddingX + (i * (chartW - 2 * paddingX)) / (CHART_DAILY_SMS.length - 1);
                const yApi = chartH - paddingY - (d.apiSent / maxY) * (chartH - 2 * paddingY);
                return (
                  <g key={`point-api-${i}`}>
                    <circle
                      cx={x}
                      cy={yApi}
                      r="4"
                      fill="#2563EB"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="cursor-pointer hover:r-6 transition-all shadow-xs"
                      onMouseEnter={() => setHoveredDay(d)}
                      onMouseLeave={() => setHoveredDay(null)}
                    />
                    {/* Date label */}
                    <text
                      x={x}
                      y={chartH - 6}
                      fill="#64748B"
                      fontSize="9"
                      textAnchor="middle"
                      fontFamily="JetBrains Mono"
                    >
                      {d.date}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip */}
            {hoveredDay && (
              <div className="absolute top-2 right-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-[11px] shadow-lg text-slate-700 pointer-events-none">
                <div className="font-semibold text-slate-900 font-mono">Date: {hoveredDay.date}</div>
                <div className="text-slate-600">API Sent: <span className="font-mono text-blue-600 font-bold">{hoveredDay.apiSent}</span></div>
                <div className="text-slate-600">Dashboard: <span className="font-mono text-emerald-600 font-bold">{hoveredDay.dashboardSent}</span></div>
                <div className="text-slate-900 font-semibold border-t border-slate-100 mt-1 pt-0.5">Total: <span className="font-mono">{hoveredDay.total}</span> SMS</div>
              </div>
            )}
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-blue-600 rounded-full inline-block" />
              <span>API Sent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-emerald-600 rounded-full inline-block" />
              <span>Dashboard Sent</span>
            </div>
          </div>
        </div>

        {/* Right Chart: Weekly API Call */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Weekly API Call</h2>
              <p className="text-[11px] text-slate-500">Weekly API call distribution</p>
            </div>
            <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Total: 14 Calls
            </span>
          </div>

          {/* Bar / Column Chart */}
          <div className="mt-4 relative h-48 w-full flex items-end justify-between px-6 pb-6 pt-2">
            {CHART_WEEKLY_API.map((item, index) => {
              const maxCall = 5;
              const heightPercent = (item.calls / maxCall) * 100;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center gap-2 flex-1 group cursor-pointer"
                  onMouseEnter={() => setHoveredApiDay(item)}
                  onMouseLeave={() => setHoveredApiDay(null)}
                >
                  <div className="w-full flex justify-center">
                    <span className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.calls}
                    </span>
                  </div>
                  <div className="w-7 sm:w-9 bg-slate-100 rounded-t-md relative overflow-hidden h-32 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-md transition-all duration-300 group-hover:brightness-105"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono tracking-tight font-medium">
                    {item.day}
                  </span>
                </div>
              );
            })}

            {/* Hover Tooltip */}
            {hoveredApiDay && (
              <div className="absolute top-2 right-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] shadow-lg text-slate-700 pointer-events-none">
                <span className="font-semibold text-slate-900">{hoveredApiDay.day}:</span>{' '}
                <span className="font-mono text-blue-600 font-bold">{hoveredApiDay.calls} API calls</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-2 pt-2 border-t border-slate-100">
            <span>Peak Day: <strong className="text-slate-800">Friday (4 calls)</strong></span>
            <span>Avg Latency: <strong className="text-blue-600 font-mono">38ms</strong></span>
          </div>
        </div>
      </div>

      {/* Recent Message Traffic Activity Table */}
      <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent A2P Message Traffic</h3>
            <p className="text-[11px] text-slate-500">Latest message submissions across downstream partners</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setRecentFilter('all')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  recentFilter === 'all' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setRecentFilter('API')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  recentFilter === 'API' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                API
              </button>
              <button
                onClick={() => setRecentFilter('Dashboard')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  recentFilter === 'Dashboard' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dashboard
              </button>
            </div>

            <button
              onClick={() => onNavigate('sms_log')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <span>View All ({totalSMS})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-3 px-3">Reference</th>
                <th className="py-3 px-3">Partner</th>
                <th className="py-3 px-3">Sender ID</th>
                <th className="py-3 px-3">Recipient</th>
                <th className="py-3 px-3">Channel</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Cost (ETB)</th>
                <th className="py-3 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMessages.map((msg) => (
                <tr key={msg.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono text-blue-600 font-semibold">
                    {msg.messageRef}
                  </td>
                  <td className="py-3 px-3 text-slate-900 font-medium truncate max-w-[140px]">
                    {msg.partnerName}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200/60 text-blue-700 font-mono text-[11px] font-medium">
                      {msg.senderId}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {msg.recipientMasked}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[11px] font-semibold ${
                        msg.channel === 'API' ? 'text-indigo-600' : 'text-emerald-600'
                      }`}
                    >
                      {msg.channel}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Delivered
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700 font-medium tabular-nums">
                    {msg.costETB.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-500 text-[11px]">
                    {msg.submittedAt.substring(11)}
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
