import React, { useState } from 'react';
import {
  Bell,
  Lock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import { INITIAL_ADMIN_USERS } from '../../data/mockData';

interface SettingsViewProps {
  mode: 'settings' | 'notifications';
}

export const SettingsView: React.FC<SettingsViewProps> = ({ mode }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'security' | 'notifications'>(
    mode === 'notifications' ? 'notifications' : 'users'
  );

  const [notifications, setNotifications] = useState([
    {
      id: 'notif_1',
      title: 'New Partner Onboarding Submission',
      desc: 'Wegagen Agri-Supply Co-operative Union submitted registration documents for review.',
      time: '18 minutes ago',
      unread: true,
      category: 'Onboarding',
    },
    {
      id: 'notif_2',
      title: 'Ethio telecom SMMP Pending Review',
      desc: 'Sender ID "AbyssiniaOTP" has been in carrier queue for 48 hours. Follow-up recommended.',
      time: '1 hour ago',
      unread: true,
      category: 'Sender ID',
    },
    {
      id: 'notif_3',
      title: 'SMSC Socket Keep-Alive Succeeded',
      desc: 'EnquireLink periodic heartbeat acknowledged by Ethio telecom Primary SMPP host.',
      time: '3 hours ago',
      unread: false,
      category: 'Gateway',
    },
  ]);

  const permissionMatrix = [
    { module: 'View Messaging & Traffic Logs', superAdmin: true, opsAdmin: true, reviewer: true, billing: true, auditor: true },
    { module: 'Onboard & Edit Downstream Partners', superAdmin: true, opsAdmin: true, reviewer: false, billing: false, auditor: false },
    { module: 'Review Partner Trade Licenses', superAdmin: true, opsAdmin: true, reviewer: true, billing: false, auditor: false },
    { module: 'Sender ID Internal Review & Vetting', superAdmin: true, opsAdmin: true, reviewer: true, billing: false, auditor: false },
    { module: 'Record Ethio telecom SMMP Carrier Approval', superAdmin: true, opsAdmin: true, reviewer: false, billing: false, auditor: false },
    { module: 'Configure Upstream SMSC Gateway', superAdmin: true, opsAdmin: false, reviewer: false, billing: false, auditor: false },
    { module: 'Edit SMS Tariffs & Pre-funds', superAdmin: true, opsAdmin: false, reviewer: false, billing: true, auditor: false },
    { module: 'Provision & Revoke API Client Keys', superAdmin: true, opsAdmin: true, reviewer: false, billing: false, auditor: false },
    { module: 'Manage Admin Users & Security Roles', superAdmin: true, opsAdmin: false, reviewer: false, billing: false, auditor: false },
  ];

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            {activeTab === 'notifications'
              ? 'Operational Notifications & Alerts'
              : 'System Administration & Security Policies'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'notifications'
              ? 'Action items, compliance deadlines, and gateway connectivity notifications.'
              : 'Role-based access control (RBAC), Super Admin accounts, and security compliance configuration.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin Users
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'roles'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Permission Matrix
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'security'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Security Policies
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'notifications'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Notifications ({notifications.filter((n) => n.unread).length})
          </button>
        </div>
      </div>

      {/* Tab 1: Admin Users */}
      {activeTab === 'users' && (
        <div className="rounded-xl bg-white border border-slate-200/90 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-3 px-4">Operator Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {INITIAL_ADMIN_USERS.map((adm) => (
                <tr key={adm.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{adm.name}</td>
                  <td className="py-3 px-4 font-mono text-blue-600 font-medium">{adm.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-700 font-medium">
                      {adm.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">{adm.lastLogin}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Permission Matrix */}
      {activeTab === 'roles' && (
        <div className="rounded-xl bg-white border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC) Specification</h3>
            <p className="text-[11px] text-slate-500">Strict permission boundaries enforced before sensitive gateway or approval actions.</p>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-3 px-4">Operational Capability</th>
                <th className="py-3 px-4 text-center">Super Admin</th>
                <th className="py-3 px-4 text-center">Ops Admin</th>
                <th className="py-3 px-4 text-center">Sender ID Reviewer</th>
                <th className="py-3 px-4 text-center">Billing / Finance</th>
                <th className="py-3 px-4 text-center">Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionMatrix.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-800">{p.module}</td>
                  <td className="py-3 px-4 text-center">
                    {p.superAdmin ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.opsAdmin ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.reviewer ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.billing ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.auditor ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Security Policies */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" /> Authentication & Session Governance
            </h3>
            <div className="space-y-3 text-slate-700">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span>Two-Factor Authentication (MFA)</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Enforced for all Admins</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span>Idle Session Inactivity Timeout</span>
                <span className="font-mono text-blue-700 font-bold">30 Minutes</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span>Carrier Password Rotation Interval</span>
                <span className="font-mono text-slate-800 font-medium">90 Days</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Regulatory Audit Retention Period</span>
                <span className="font-mono text-slate-800 font-medium">7 Years (ECA Mandate)</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> Regulatory Compliance Context
            </h3>
            <p className="text-slate-600 leading-relaxed">
              SIMConnect SMS operates subject to Ethiopian Communications Authority (ECA) A2P messaging licensing and Ethio telecom SMMP anti-spam regulations.
            </p>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 font-mono text-[11px] text-slate-700">
              <div>· Alphanumeric Sender IDs: Pre-registration required</div>
              <div>· Promotional Broadcast Window: 08:00 - 20:00 EAT</div>
              <div>· Opt-out keywords (&quot;STOP&quot;): Mandatory on marketing SMS</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Notifications */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">{notifications.length} alerts recorded</span>
            <button
              onClick={handleMarkAllRead}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Mark all as read
            </button>
          </div>

          <div className="space-y-2.5">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition-colors shadow-xs ${
                  n.unread
                    ? 'bg-blue-50/50 border-blue-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-700 shrink-0 mt-0.5 border border-blue-100">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                          {n.category}
                        </span>
                        {n.unread && (
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.desc}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-4">{n.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
