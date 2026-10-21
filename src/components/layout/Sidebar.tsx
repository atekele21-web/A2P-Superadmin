import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  KeyRound,
  MessageSquare,
  Users,
  ShieldCheck,
  Radio,
  Contact,
  Bell,
  Settings,
  ChevronDown,
  ChevronRight,
  Send,
  FileText,
  Clock,
  ListOrdered,
  Layers,
  History,
  ShieldAlert,
  Server,
  RotateCcw,
} from 'lucide-react';

export type ActiveView =
  | 'dashboard'
  | 'billing_management'
  | 'transaction_log'
  | 'api_keys'
  | 'ip_whitelist'
  | 'send_sms'
  | 'templates'
  | 'schedule_sms'
  | 'approval_queue'
  | 'bulk_monitor'
  | 'sms_log'
  | 'partners_all'
  | 'partner_applications'
  | 'sender_id_registry'
  | 'sender_id_pending_smmp'
  | 'smsc_gateway'
  | 'contacts'
  | 'notifications'
  | 'audit_trail'
  | 'admin_settings';

interface SidebarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  pendingApprovalsCount: number;
  onResetDemo: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  pendingApprovalsCount,
  onResetDemo,
  isOpenMobile,
  onCloseMobile,
}) => {
  // Collapsible sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    billing: true,
    api: true,
    sms: true,
    partners: true,
    senderIds: true,
    settings: false,
  });

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleNavClick = (view: ActiveView) => {
    onNavigate(view);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-slate-200/90 text-slate-700 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white shadow-xs">
            <Radio className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              SIMConnect <span className="text-emerald-700 text-xs font-semibold px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200/80">SMS</span>
            </span>
            <span className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold">
              Ethiopia A2P Operator
            </span>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 text-xs">
          {/* Main Dashboard item */}
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'dashboard'
                ? 'bg-blue-50/90 text-blue-700 font-semibold border border-blue-200/70 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${activeView === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="text-sm">Dashboard</span>
          </button>

          {/* Section: Partner Management */}
          <div className="pt-2">
            <button
              onClick={() => toggleSection('partners')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-slate-400 hover:text-slate-700 uppercase font-semibold text-[11px] tracking-wider"
            >
              <span className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Partners
              </span>
              {openSections.partners ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {openSections.partners && (
              <div className="mt-1 pl-4 space-y-0.5 border-l border-slate-200 ml-4">
                <button
                  onClick={() => handleNavClick('partners_all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors ${
                    activeView === 'partners_all'
                      ? 'bg-blue-50/90 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  All Partners
                </button>
                <button
                  onClick={() => handleNavClick('partner_applications')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${
                    activeView === 'partner_applications'
                      ? 'bg-blue-50/90 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <span>Applications</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-amber-50 text-amber-700 rounded border border-amber-200/80 font-medium">
                    2 Pending
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Section: Sender ID Management */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection('senderIds')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-slate-400 hover:text-slate-700 uppercase font-semibold text-[11px] tracking-wider"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Sender IDs
              </span>
              {openSections.senderIds ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {openSections.senderIds && (
              <div className="mt-1 pl-4 space-y-0.5 border-l border-slate-200 ml-4">
                <button
                  onClick={() => handleNavClick('sender_id_registry')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors ${
                    activeView === 'sender_id_registry'
                      ? 'bg-blue-50/90 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  Sender ID Registry
                </button>
                <button
                  onClick={() => handleNavClick('sender_id_pending_smmp')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${
                    activeView === 'sender_id_pending_smmp'
                      ? 'bg-blue-50/90 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <span>Ethio telecom SMMP</span>
                  {pendingApprovalsCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 font-mono font-medium">
                      {pendingApprovalsCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Section: Billing */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection('billing')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-slate-400 hover:text-slate-700 uppercase font-semibold text-[11px] tracking-wider"
            >
              <span className="flex items-center gap-2">
                <Receipt className="w-3.5 h-3.5 text-blue-600" />
                Billing
              </span>
              {openSections.billing ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {openSections.billing && (
              <div className="mt-1 pl-4 space-y-0.5 border-l border-slate-200 ml-4">
                <button
                  onClick={() => handleNavClick('billing_management')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors ${
                    activeView === 'billing_management'
                      ? 'bg-blue-50/90 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  Billing Management
                </button>
                <button
                  onClick={() => handleNavClick('transaction_log')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors ${
                    activeView === 'transaction_log'
                      ? 'bg-blue-50/90 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  Transaction Log
                </button>
              </div>
            )}
          </div>

          {/* Section: API Management */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection('api')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-slate-400 hover:text-slate-700 uppercase font-semibold text-[11px] tracking-wider"
            >
              <span className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                API Management
              </span>
              {openSections.api ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {openSections.api && (
              <div className="mt-1 pl-4 space-y-0.5 border-l border-slate-200 ml-4">
                <button
                  onClick={() => handleNavClick('api_keys')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors ${
                    activeView === 'api_keys'
                      ? 'bg-blue-50/90 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  API Keys
                </button>
                <button
                  onClick={() => handleNavClick('ip_whitelist')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors ${
                    activeView === 'ip_whitelist'
                      ? 'bg-blue-50/90 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  IP Whitelist
                </button>
              </div>
            )}
          </div>

          {/* Section: SMS Management */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection('sms')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-slate-400 hover:text-slate-700 uppercase font-semibold text-[11px] tracking-wider"
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                SMS Management
              </span>
              {openSections.sms ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {openSections.sms && (
              <div className="mt-1 pl-4 space-y-0.5 border-l border-slate-200 ml-4">
                <button
                  onClick={() => handleNavClick('send_sms')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                    activeView === 'send_sms'
                      ? 'bg-blue-50/90 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Send className="w-3 h-3 text-blue-600" />
                  <span>Send SMS</span>
                </button>
                <button
                  onClick={() => handleNavClick('templates')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                    activeView === 'templates'
                      ? 'bg-blue-50/90 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <FileText className="w-3 h-3 text-slate-400" />
                  <span>Templates</span>
                </button>
                <button
                  onClick={() => handleNavClick('schedule_sms')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                    activeView === 'schedule_sms'
                      ? 'bg-blue-50/90 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Schedule SMS</span>
                </button>
                <button
                  onClick={() => handleNavClick('approval_queue')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                    activeView === 'approval_queue'
                      ? 'bg-blue-50/90 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <ListOrdered className="w-3 h-3 text-slate-400" />
                  <span>Approval SMS Queue</span>
                </button>
                <button
                  onClick={() => handleNavClick('bulk_monitor')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                    activeView === 'bulk_monitor'
                      ? 'bg-blue-50/90 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Layers className="w-3 h-3 text-slate-400" />
                  <span>Bulk Monitor</span>
                </button>
                <button
                  onClick={() => handleNavClick('sms_log')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                    activeView === 'sms_log'
                      ? 'bg-blue-50/90 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <History className="w-3 h-3 text-slate-400" />
                  <span>SMS Log</span>
                </button>
              </div>
            )}
          </div>

          {/* Direct Item: SMSC & Connectivity */}
          <div className="pt-1">
            <button
              onClick={() => handleNavClick('smsc_gateway')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'smsc_gateway'
                  ? 'bg-blue-50/90 text-blue-700 font-semibold border border-blue-200/70 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
              }`}
            >
              <Server className={`w-4 h-4 ${activeView === 'smsc_gateway' ? 'text-blue-600' : 'text-slate-400'}`} />
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold">SMSC Gateway</span>
                <span className="text-[10px] text-slate-400">Ethio telecom SMPP</span>
              </div>
            </button>
          </div>

          {/* Direct Item: Contacts */}
          <div>
            <button
              onClick={() => handleNavClick('contacts')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'contacts'
                  ? 'bg-blue-50/90 text-blue-700 font-semibold border border-blue-200/70 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
              }`}
            >
              <Contact className={`w-4 h-4 ${activeView === 'contacts' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="text-xs">Contacts</span>
            </button>
          </div>

          {/* Direct Item: Audit Trail */}
          <div>
            <button
              onClick={() => handleNavClick('audit_trail')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'audit_trail'
                  ? 'bg-blue-50/90 text-blue-700 font-semibold border border-blue-200/70 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className={`w-4 h-4 ${activeView === 'audit_trail' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="text-xs">Audit & Compliance</span>
            </button>
          </div>

          {/* Direct Item: Notifications */}
          <div>
            <button
              onClick={() => handleNavClick('notifications')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'notifications'
                  ? 'bg-blue-50/90 text-blue-700 font-semibold border border-blue-200/70 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className={`w-4 h-4 ${activeView === 'notifications' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-xs">Notifications</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-mono font-medium">
                3
              </span>
            </button>
          </div>

          {/* Section: Settings */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection('settings')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-slate-400" />
                <span className="text-xs">Settings</span>
              </div>
              {openSections.settings ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
            {openSections.settings && (
              <div className="mt-1 pl-4 space-y-0.5 border-l border-slate-200 ml-4">
                <button
                  onClick={() => handleNavClick('admin_settings')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors ${
                    activeView === 'admin_settings'
                      ? 'bg-blue-50/90 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  Admin Users & Roles
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User / Profile area at the bottom */}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50/60 relative">
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-slate-200/60"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs shrink-0 shadow-xs">
                T
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-slate-900 truncate">
                  Tina Martin
                </span>
                <span className="text-[10px] text-slate-500 truncate font-mono">
                  cto@teamart.com
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {/* Profile popover menu */}
          {showProfileMenu && (
            <div className="absolute bottom-16 left-3 right-3 p-3 bg-white border border-slate-200 rounded-xl shadow-lg space-y-1.5 z-50 text-xs">
              <div className="px-2 py-0.5 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Super Admin Account
              </div>
              <div className="px-2 py-1 text-slate-700 flex items-center justify-between">
                <span>Role:</span>
                <span className="text-blue-700 font-semibold text-[11px]">Super Administrator</span>
              </div>
              <div className="px-2 py-1 text-slate-700 flex items-center justify-between">
                <span>Platform:</span>
                <span className="text-emerald-700 font-medium text-[11px]">SIMConnect Ethiopia</span>
              </div>
              <hr className="border-slate-100 my-1" />
              <button
                onClick={() => {
                  if (confirm('Reset all demo data back to pristine initial state?')) {
                    onResetDemo();
                    setShowProfileMenu(false);
                  }
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors text-left font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Reset Demo Datasets</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
