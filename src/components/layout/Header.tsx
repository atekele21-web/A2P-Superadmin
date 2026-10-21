import React from 'react';
import { Menu, Moon, Send, Info } from 'lucide-react';
import { ActiveView } from './Sidebar';

interface HeaderProps {
  activeView: ActiveView;
  onOpenMobileMenu: () => void;
  onOpenQuickSMS: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  unreadNotifications: number;
}

const VIEW_TITLES: Record<ActiveView, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboards',
    subtitle: "Welcome back! Here's what's happening with your SMS campaigns and downstream partner traffic.",
  },
  billing_management: {
    title: 'Billing Management',
    subtitle: 'Manage partner balances, configurable ETB tariffs per SMS segment, and settlement accounts.',
  },
  transaction_log: {
    title: 'Transaction Log',
    subtitle: 'Full audit ledger of partner pre-funding, usage deductions, and credit adjustments.',
  },
  api_keys: {
    title: 'API Management — API Keys',
    subtitle: 'Provision and rotate partner authentication tokens with strict masked credential display.',
  },
  ip_whitelist: {
    title: 'API Management — IP Whitelist',
    subtitle: 'Restrict downstream API message submission to authorized CIDR ranges and fixed IP gateways.',
  },
  send_sms: {
    title: 'SMS Management — Send SMS',
    subtitle: 'Super Administrator manual message dispatch console with authorized Sender ID enforcement.',
  },
  templates: {
    title: 'SMS Management — Templates',
    subtitle: 'Pre-approved message templates for OTP, transactional alerts, and customer notifications.',
  },
  schedule_sms: {
    title: 'SMS Management — Schedule SMS',
    subtitle: 'Monitor time-released batches and scheduled messaging queues across partners.',
  },
  approval_queue: {
    title: 'SMS Management — Approval SMS Queue',
    subtitle: 'Review high-volume promotional queues requiring Super Admin sign-off before transmission.',
  },
  bulk_monitor: {
    title: 'SMS Management — Bulk Monitor',
    subtitle: 'Real-time progress tracker for multi-recipient batches submitted via API and dashboard.',
  },
  sms_log: {
    title: 'SMS Management — SMS Log',
    subtitle: 'Authoritative audit record of message submissions, recipient masks, and delivery reports.',
  },
  partners_all: {
    title: 'Downstream Partners — All Partners',
    subtitle: 'Manage Ethiopian enterprise partners, verify trade licenses, and configure messaging limits.',
  },
  partner_applications: {
    title: 'Downstream Partners — Applications',
    subtitle: 'Review onboarding submissions, NBE fintech approvals, and commercial registry documents.',
  },
  sender_id_registry: {
    title: 'Sender ID Registry',
    subtitle: 'Registry of proposed alphanumeric Sender IDs mapped to verified downstream partners.',
  },
  sender_id_pending_smmp: {
    title: 'Sender IDs — Ethio telecom SMMP Approval',
    subtitle: 'Track external sender name submissions and record carrier configuration authorization codes.',
  },
  smsc_gateway: {
    title: 'SMSC & Upstream Connectivity',
    subtitle: 'Monitor Ethio telecom SMPP v3.4 socket links, bind sessions, and simulated test handshakes.',
  },
  contacts: {
    title: 'Contacts & Groups',
    subtitle: 'Manage partner address books, distribution lists, and verified recipient contacts.',
  },
  notifications: {
    title: 'System Notifications',
    subtitle: 'Operational alerts, pending verification items, and gateway telemetry announcements.',
  },
  audit_trail: {
    title: 'Compliance & Audit Trail',
    subtitle: 'Immutable record of all Super Admin actions, approvals, secret rotations, and gateway changes.',
  },
  admin_settings: {
    title: 'System Administration & Security',
    subtitle: 'Super Admin team accounts, role-based permission matrices, and security controls.',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onOpenMobileMenu,
  onOpenQuickSMS,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const meta = VIEW_TITLES[activeView] || {
    title: 'Super Administrator',
    subtitle: 'SIMConnect SMS Management Console',
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 md:hidden focus:outline-hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* View Indicator / Breadcrumb */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">SIMConnect SMS</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold">{meta.title}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Honest Demonstration Boundary Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/70 text-blue-700 text-xs">
          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="font-semibold">Prototype / Demo Mode</span>
          <span className="text-slate-400 font-mono text-[10px]">| Ethio telecom boundary</span>
        </div>

        {/* Theme mode toggle */}
        <button
          onClick={onToggleDarkMode}
          title="Toggle display mode"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-hidden"
        >
          <Moon className="w-4 h-4 text-slate-600" />
        </button>

        {/* Prominent Quick SMS Action Button (Professional Blue) */}
        <button
          onClick={onOpenQuickSMS}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs transition-all shadow-xs hover:shadow-sm active:scale-95 focus:outline-hidden"
        >
          <Send className="w-3.5 h-3.5 text-white" />
          <span>Quick SMS</span>
        </button>
      </div>
    </header>
  );
};
