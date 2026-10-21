import React, { useState } from 'react';
import { useSimconnectStore } from './services/store';
import { Sidebar, ActiveView } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { PartnersView } from './components/partners/PartnersView';
import { SenderIDView } from './components/senderids/SenderIDView';
import { SMSCView } from './components/smsc/SMSCView';
import { SMSLogsView } from './components/messaging/SMSLogsView';
import { TemplatesAndScheduleView } from './components/messaging/TemplatesAndScheduleView';
import { APIManagementView } from './components/api/APIManagementView';
import { BillingView } from './components/billing/BillingView';
import { ContactsView } from './components/contacts/ContactsView';
import { AuditView } from './components/compliance/AuditView';
import { SettingsView } from './components/settings/SettingsView';
import { QuickSMSModal } from './components/messaging/QuickSMSModal';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickSMSOpen, setIsQuickSMSOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Load centralized reactive store
  const store = useSimconnectStore();

  const pendingApprovalsCount = store.senderIds.filter(
    (s) => s.status === 'submitted_to_smmp' || s.status === 'pending_internal_review'
  ).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row antialiased selection:bg-blue-500/20 selection:text-blue-900">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
        pendingApprovalsCount={pendingApprovalsCount}
        onResetDemo={store.resetToFactoryDemo}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Top Header */}
        <Header
          activeView={activeView}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenQuickSMS={() => setIsQuickSMSOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          unreadNotifications={3}
        />

        {/* Dynamic Route View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeView === 'dashboard' && (
            <DashboardView
              partners={store.partners}
              senderIds={store.senderIds}
              messages={store.messages}
              smscProfile={store.smscProfile}
              onNavigate={(view) => setActiveView(view)}
              onOpenQuickSMS={() => setIsQuickSMSOpen(true)}
            />
          )}

          {activeView === 'partners_all' && (
            <PartnersView
              mode="all"
              partners={store.partners}
              senderIds={store.senderIds}
              onUpdateStatus={store.updatePartnerStatus}
              onAddPartner={store.addPartner}
              onOpenQuickSMS={() => setIsQuickSMSOpen(true)}
            />
          )}

          {activeView === 'partner_applications' && (
            <PartnersView
              mode="applications"
              partners={store.partners}
              senderIds={store.senderIds}
              onUpdateStatus={store.updatePartnerStatus}
              onAddPartner={store.addPartner}
              onOpenQuickSMS={() => setIsQuickSMSOpen(true)}
            />
          )}

          {activeView === 'sender_id_registry' && (
            <SenderIDView
              mode="registry"
              senderIds={store.senderIds}
              partners={store.partners}
              onRequestSenderID={store.requestSenderID}
              onReviewInternal={store.reviewSenderIDInternal}
              onRecordExternalSMMP={store.recordExternalSMMPResult}
              onOpenQuickSMS={() => setIsQuickSMSOpen(true)}
            />
          )}

          {activeView === 'sender_id_pending_smmp' && (
            <SenderIDView
              mode="pending_smmp"
              senderIds={store.senderIds}
              partners={store.partners}
              onRequestSenderID={store.requestSenderID}
              onReviewInternal={store.reviewSenderIDInternal}
              onRecordExternalSMMP={store.recordExternalSMMPResult}
              onOpenQuickSMS={() => setIsQuickSMSOpen(true)}
            />
          )}

          {activeView === 'smsc_gateway' && (
            <SMSCView
              smscProfile={store.smscProfile}
              onUpdateSMSC={store.updateSMSCSettings}
              onSimulateHealthCheck={store.simulateSMSCHealthCheck}
            />
          )}

          {activeView === 'sms_log' && (
            <SMSLogsView
              mode="log"
              messages={store.messages}
              partners={store.partners}
              senderIds={store.senderIds}
              onOpenQuickSMS={() => setIsQuickSMSOpen(true)}
            />
          )}

          {activeView === 'send_sms' && (
            <SMSLogsView
              mode="send"
              messages={store.messages}
              partners={store.partners}
              senderIds={store.senderIds}
              onOpenQuickSMS={() => setIsQuickSMSOpen(true)}
            />
          )}

          {activeView === 'approval_queue' && (
            <SMSLogsView
              mode="approval_queue"
              messages={store.messages}
              partners={store.partners}
              senderIds={store.senderIds}
              onOpenQuickSMS={() => setIsQuickSMSOpen(true)}
            />
          )}

          {activeView === 'templates' && (
            <TemplatesAndScheduleView
              mode="templates"
              templates={store.templates}
              partners={store.partners}
              senderIds={store.senderIds}
              onOpenQuickSMS={() => setIsQuickSMSOpen(true)}
            />
          )}

          {activeView === 'schedule_sms' && (
            <TemplatesAndScheduleView
              mode="schedule"
              templates={store.templates}
              partners={store.partners}
              senderIds={store.senderIds}
              onOpenQuickSMS={() => setIsQuickSMSOpen(true)}
            />
          )}

          {activeView === 'bulk_monitor' && (
            <TemplatesAndScheduleView
              mode="bulk_monitor"
              templates={store.templates}
              partners={store.partners}
              senderIds={store.senderIds}
              onOpenQuickSMS={() => setIsQuickSMSOpen(true)}
            />
          )}

          {activeView === 'api_keys' && (
            <APIManagementView
              mode="keys"
              apiKeys={store.apiKeys}
              partners={store.partners}
              onCreateKey={store.createAPIKey}
              onRevokeKey={store.revokeAPIKey}
            />
          )}

          {activeView === 'ip_whitelist' && (
            <APIManagementView
              mode="ip_whitelist"
              apiKeys={store.apiKeys}
              partners={store.partners}
              onCreateKey={store.createAPIKey}
              onRevokeKey={store.revokeAPIKey}
            />
          )}

          {activeView === 'billing_management' && (
            <BillingView
              mode="management"
              partners={store.partners}
              transactions={store.transactions}
              onAddTransaction={store.addTransaction}
            />
          )}

          {activeView === 'transaction_log' && (
            <BillingView
              mode="transactions"
              partners={store.partners}
              transactions={store.transactions}
              onAddTransaction={store.addTransaction}
            />
          )}

          {activeView === 'contacts' && (
            <ContactsView
              contacts={store.contacts}
              onOpenQuickSMS={() => setIsQuickSMSOpen(true)}
            />
          )}

          {activeView === 'audit_trail' && (
            <AuditView auditLogs={store.auditLogs} />
          )}

          {activeView === 'notifications' && (
            <SettingsView mode="notifications" />
          )}

          {activeView === 'admin_settings' && (
            <SettingsView mode="settings" />
          )}
        </main>
      </div>

      {/* Global Quick SMS Modal */}
      <QuickSMSModal
        isOpen={isQuickSMSOpen}
        onClose={() => setIsQuickSMSOpen(false)}
        partners={store.partners}
        senderIds={store.senderIds}
        templates={store.templates}
        onSend={store.sendQuickSMS}
      />
    </div>
  );
}
