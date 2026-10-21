import { useState, useEffect } from 'react';
import {
  Partner,
  SenderIDRecord,
  SMSMessage,
  SMSCProfile,
  APIKeyRecord,
  TransactionRecord,
  ContactRecord,
  SMSTemplateRecord,
  AuditRecord,
  PartnerStatus,
} from '../types';
import {
  INITIAL_PARTNERS,
  INITIAL_SENDER_IDS,
  INITIAL_SMS_MESSAGES,
  INITIAL_SMSC_PROFILE,
  INITIAL_API_KEYS,
  INITIAL_TRANSACTIONS,
  INITIAL_CONTACTS,
  INITIAL_TEMPLATES,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';

const STORAGE_KEYS = {
  PARTNERS: 'simconnect_partners_v1',
  SENDER_IDS: 'simconnect_sender_ids_v1',
  SMS_MESSAGES: 'simconnect_sms_messages_v1',
  SMSC_PROFILE: 'simconnect_smsc_profile_v1',
  API_KEYS: 'simconnect_api_keys_v1',
  TRANSACTIONS: 'simconnect_transactions_v1',
  CONTACTS: 'simconnect_contacts_v1',
  TEMPLATES: 'simconnect_templates_v1',
  AUDIT_LOGS: 'simconnect_audit_logs_v1',
};

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota or private mode errors
  }
}

export function useSimconnectStore() {
  const [partners, setPartners] = useState<Partner[]>(() =>
    getStorage(STORAGE_KEYS.PARTNERS, INITIAL_PARTNERS)
  );
  const [senderIds, setSenderIds] = useState<SenderIDRecord[]>(() =>
    getStorage(STORAGE_KEYS.SENDER_IDS, INITIAL_SENDER_IDS)
  );
  const [messages, setMessages] = useState<SMSMessage[]>(() =>
    getStorage(STORAGE_KEYS.SMS_MESSAGES, INITIAL_SMS_MESSAGES)
  );
  const [smscProfile, setSmscProfile] = useState<SMSCProfile>(() =>
    getStorage(STORAGE_KEYS.SMSC_PROFILE, INITIAL_SMSC_PROFILE)
  );
  const [apiKeys, setApiKeys] = useState<APIKeyRecord[]>(() =>
    getStorage(STORAGE_KEYS.API_KEYS, INITIAL_API_KEYS)
  );
  const [transactions, setTransactions] = useState<TransactionRecord[]>(() =>
    getStorage(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS)
  );
  const [contacts, setContacts] = useState<ContactRecord[]>(() =>
    getStorage(STORAGE_KEYS.CONTACTS, INITIAL_CONTACTS)
  );
  const [templates, setTemplates] = useState<SMSTemplateRecord[]>(() =>
    getStorage(STORAGE_KEYS.TEMPLATES, INITIAL_TEMPLATES)
  );
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(() =>
    getStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS)
  );

  // Sync to local storage
  useEffect(() => setStorage(STORAGE_KEYS.PARTNERS, partners), [partners]);
  useEffect(() => setStorage(STORAGE_KEYS.SENDER_IDS, senderIds), [senderIds]);
  useEffect(() => setStorage(STORAGE_KEYS.SMS_MESSAGES, messages), [messages]);
  useEffect(() => setStorage(STORAGE_KEYS.SMSC_PROFILE, smscProfile), [smscProfile]);
  useEffect(() => setStorage(STORAGE_KEYS.API_KEYS, apiKeys), [apiKeys]);
  useEffect(() => setStorage(STORAGE_KEYS.TRANSACTIONS, transactions), [transactions]);
  useEffect(() => setStorage(STORAGE_KEYS.CONTACTS, contacts), [contacts]);
  useEffect(() => setStorage(STORAGE_KEYS.TEMPLATES, templates), [templates]);
  useEffect(() => setStorage(STORAGE_KEYS.AUDIT_LOGS, auditLogs), [auditLogs]);

  const logAudit = (
    action: string,
    target: string,
    outcome: 'Success' | 'Denied' | 'Pending' | 'Failed',
    reason?: string,
    requestRef?: string
  ) => {
    const newEntry: AuditRecord = {
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: 'Tina Martin (CTO)',
      actorRole: 'Super Administrator',
      action,
      target,
      outcome,
      reason,
      requestRef,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Partner operations
  const updatePartnerStatus = (partnerId: string, newStatus: PartnerStatus, reason: string) => {
    setPartners((prev) =>
      prev.map((p) => {
        if (p.id === partnerId) {
          return {
            ...p,
            status: newStatus,
            lastActivity: new Date().toISOString().replace('T', ' ').substring(0, 16),
            internalNotes: reason ? `${p.internalNotes || ''}\n[${new Date().toLocaleDateString()}] Status -> ${newStatus}: ${reason}` : p.internalNotes,
          };
        }
        return p;
      })
    );
    const targetPartner = partners.find((p) => p.id === partnerId);
    logAudit(
      `Partner Status Changed to ${newStatus}`,
      targetPartner ? `${targetPartner.companyName} (${targetPartner.code})` : partnerId,
      'Success',
      reason
    );
  };

  const addPartner = (data: Omit<Partner, 'id' | 'smsUsageCount' | 'senderIdCount' | 'lastActivity'>) => {
    const newId = `part_${String(partners.length + 1).padStart(3, '0')}`;
    const newPartner: Partner = {
      ...data,
      id: newId,
      smsUsageCount: 0,
      senderIdCount: 0,
      lastActivity: 'Just now',
    };
    setPartners((prev) => [newPartner, ...prev]);
    logAudit(
      'New Partner Onboarded',
      `${newPartner.companyName} (${newPartner.code})`,
      'Success',
      'Initial application recorded by Super Admin'
    );
    return newPartner;
  };

  // Sender ID operations
  const requestSenderID = (partnerId: string, proposedSenderId: string, businessPurpose: string) => {
    const partner = partners.find((p) => p.id === partnerId);
    if (!partner) throw new Error('Partner not found');

    const newRecord: SenderIDRecord = {
      id: `sid_${String(senderIds.length + 1).padStart(3, '0')}`,
      senderId: proposedSenderId.trim(),
      partnerId,
      partnerName: partner.companyName,
      businessPurpose,
      submissionDate: new Date().toISOString().substring(0, 10),
      requestReference: `REQ-ETH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      status: 'pending_internal_review',
      isConfiguredAndUsable: false,
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setSenderIds((prev) => [newRecord, ...prev]);
    // increment partner sender count
    setPartners((prev) =>
      prev.map((p) => (p.id === partnerId ? { ...p, senderIdCount: p.senderIdCount + 1 } : p))
    );
    logAudit(
      'Sender ID Request Created',
      `${proposedSenderId} (${partner.companyName})`,
      'Pending',
      'Submitted for internal administrative verification',
      newRecord.requestReference
    );
    return newRecord;
  };

  const reviewSenderIDInternal = (
    id: string,
    action: 'approve_forward' | 'reject',
    notes: string
  ) => {
    const target = senderIds.find((s) => s.id === id);
    if (!target) return;

    if (action === 'approve_forward') {
      setSenderIds((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status: 'submitted_to_smmp',
                internalReviewer: 'Tina Martin (CTO)',
                internalReviewNotes: notes,
                externalSubmissionDate: new Date().toISOString().substring(0, 10),
                lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
              }
            : s
        )
      );
      logAudit(
        'Sender ID Approved Internally & Submitted to Ethio telecom SMMP',
        `${target.senderId} (${target.partnerName})`,
        'Success',
        notes,
        target.requestReference
      );
    } else {
      setSenderIds((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status: 'rejected',
                internalReviewer: 'Tina Martin (CTO)',
                internalReviewNotes: notes,
                rejectionReason: notes,
                isConfiguredAndUsable: false,
                lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
              }
            : s
        )
      );
      logAudit(
        'Sender ID Rejected in Internal Review',
        `${target.senderId} (${target.partnerName})`,
        'Denied',
        notes,
        target.requestReference
      );
    }
  };

  const recordExternalSMMPResult = (
    id: string,
    action: 'approved' | 'rejected',
    referenceOrReason: string
  ) => {
    const target = senderIds.find((s) => s.id === id);
    if (!target) return;

    if (action === 'approved') {
      setSenderIds((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status: 'approved_configured',
                externalApprovalRef: referenceOrReason,
                externalApprovalDate: new Date().toISOString().substring(0, 10),
                isConfiguredAndUsable: true,
                lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
              }
            : s
        )
      );
      logAudit(
        'Ethio telecom SMMP Configuration Confirmed',
        `${target.senderId} (${target.partnerName})`,
        'Success',
        `Carrier authorization reference: ${referenceOrReason}`,
        target.requestReference
      );
    } else {
      setSenderIds((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status: 'rejected',
                rejectionReason: referenceOrReason,
                isConfiguredAndUsable: false,
                lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
              }
            : s
        )
      );
      logAudit(
        'Ethio telecom SMMP Rejected Sender ID',
        `${target.senderId} (${target.partnerName})`,
        'Denied',
        `Carrier rejection response: ${referenceOrReason}`,
        target.requestReference
      );
    }
  };

  // Quick SMS Dispatch
  const sendQuickSMS = (params: {
    partnerId: string;
    senderId: string;
    recipient: string;
    content: string;
  }): { success: boolean; message?: string; smsRecord?: SMSMessage } => {
    const partner = partners.find((p) => p.id === params.partnerId);
    if (!partner) {
      return { success: false, message: 'Select an authorized partner account.' };
    }

    // CRITICAL: Check sender ID authorization
    const senderRecord = senderIds.find(
      (s) =>
        s.senderId.toLowerCase() === params.senderId.trim().toLowerCase() &&
        s.partnerId === params.partnerId
    );

    if (!senderRecord) {
      return {
        success: false,
        message: `Sender ID "${params.senderId}" is not registered to ${partner.companyName}.`,
      };
    }

    if (!senderRecord.isConfiguredAndUsable || senderRecord.status !== 'approved_configured') {
      return {
        success: false,
        message: `Sender ID "${params.senderId}" cannot be used for sending. Current status: "${senderRecord.status}". Messages can only be dispatched after confirmed Ethio telecom approval and configuration.`,
      };
    }

    if (partner.status !== 'approved') {
      return {
        success: false,
        message: `Partner "${partner.companyName}" is currently ${partner.status}. Messaging is disabled until the partner account is approved.`,
      };
    }

    // Calculate segments (GSM 160 chars per segment)
    const isUnicode = /[^\u0000-\u007F]/.test(params.content);
    const limit = isUnicode ? 70 : 160;
    const segments = Math.max(1, Math.ceil(params.content.length / limit));
    const cost = partner.tariffPerSMS * segments;

    // Mask recipient
    const cleanPhone = params.recipient.trim();
    const masked =
      cleanPhone.length >= 8
        ? `${cleanPhone.substring(0, 7)}*** ${cleanPhone.substring(cleanPhone.length - 3)}`
        : cleanPhone;

    const newSMS: SMSMessage = {
      id: `sms_${Date.now()}`,
      messageRef: `MSG-${new Date().toISOString().replace(/[-:T]/g, '').substring(0, 8)}-${Math.floor(1000 + Math.random() * 9000)}`,
      partnerId: partner.id,
      partnerName: partner.companyName,
      senderId: senderRecord.senderId,
      recipientMasked: masked,
      recipientFull: cleanPhone,
      content: params.content,
      channel: 'Dashboard',
      status: 'delivered', // simulated successful delivery in demo mode
      segmentCount: segments,
      encoding: isUnicode ? 'Unicode' : 'GSM-7',
      providerResponseCode: 'DELIVRD_000',
      costETB: cost,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      deliveredAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setMessages((prev) => [newSMS, ...prev]);

    // Update partner usage & balance
    setPartners((prev) =>
      prev.map((p) =>
        p.id === partner.id
          ? {
              ...p,
              smsUsageCount: p.smsUsageCount + 1,
              balanceETB: Math.max(0, Number((p.balanceETB - cost).toFixed(2))),
              lastActivity: 'Just now',
            }
          : p
      )
    );

    logAudit(
      'Quick SMS Dispatched (Demo Simulator)',
      `${newSMS.messageRef} to ${masked}`,
      'Success',
      `Cost: ETB ${cost.toFixed(2)} | Sender ID: ${senderRecord.senderId}`,
      newSMS.messageRef
    );

    return { success: true, smsRecord: newSMS };
  };

  // API Key generation
  const createAPIKey = (partnerId: string, label: string, allowlist: string[]) => {
    const partner = partners.find((p) => p.id === partnerId);
    if (!partner) throw new Error('Partner not found');

    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const prefix = `sk_live_eth_${partner.code.toLowerCase().substring(0, 4)}_${randomSuffix}`;
    const generatedSecret = `${prefix}_${Math.random().toString(36).substring(2, 14)}${Math.random().toString(36).substring(2, 14)}`;

    const newKey: APIKeyRecord = {
      id: `key_${Date.now()}`,
      partnerId,
      partnerName: partner.companyName,
      keyLabel: label,
      prefix,
      createdAt: new Date().toISOString().substring(0, 10),
      lastUsedAt: null,
      status: 'active',
      ipAllowlist: allowlist.length > 0 ? allowlist : ['0.0.0.0/0'],
    };

    setApiKeys((prev) => [newKey, ...prev]);
    logAudit(
      'API Key Provisioned',
      `${label} (${partner.companyName})`,
      'Success',
      `Key ID: ${prefix} | IPs allowed: ${newKey.ipAllowlist.join(', ')}`
    );

    return { keyRecord: newKey, oneTimeSecret: generatedSecret };
  };

  const revokeAPIKey = (keyId: string) => {
    const target = apiKeys.find((k) => k.id === keyId);
    setApiKeys((prev) =>
      prev.map((k) => (k.id === keyId ? { ...k, status: 'revoked' } : k))
    );
    if (target) {
      logAudit(
        'API Key Revoked',
        `${target.keyLabel} (${target.partnerName})`,
        'Success',
        'Revoked by Super Administrator'
      );
    }
  };

  // SMSC Profile updates & health check simulation
  const updateSMSCSettings = (updates: Partial<SMSCProfile>) => {
    setSmscProfile((prev) => ({
      ...prev,
      ...updates,
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19),
    }));
    logAudit('SMSC Gateway Configuration Updated', updates.profileName || 'SMSC Profile', 'Success');
  };

  const simulateSMSCHealthCheck = (): Promise<{ success: boolean; latencyMs: number; details: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const checkTime = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
        setSmscProfile((prev) => ({
          ...prev,
          lastHealthCheck: `${checkTime} (Simulation Handshake OK)`,
          connectionStatus: 'configured_untested',
        }));
        logAudit(
          'SMSC Health Check Simulated',
          smscProfile.provider,
          'Success',
          'Socket handshake simulation responded with bind_transceiver_resp status=0'
        );
        resolve({
          success: true,
          latencyMs: 42,
          details: 'SMPP bind_transceiver_resp(0x00000000) simulation acknowledged. Note: Real production connection requires Ethio telecom SMSC provisioning.',
        });
      }, 700);
    });
  };

  // Transaction recharge
  const addTransaction = (partnerId: string, amount: number, ref: string, desc: string) => {
    const partner = partners.find((p) => p.id === partnerId);
    if (!partner) return;

    const newBalance = Number((partner.balanceETB + amount).toFixed(2));
    const newTx: TransactionRecord = {
      id: `tx_${Date.now()}`,
      partnerId,
      partnerName: partner.companyName,
      type: 'credit',
      amountETB: amount,
      balanceAfterETB: newBalance,
      reference: ref,
      description: desc,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setTransactions((prev) => [newTx, ...prev]);
    setPartners((prev) =>
      prev.map((p) => (p.id === partnerId ? { ...p, balanceETB: newBalance } : p))
    );
    logAudit(
      'Partner Account Credited',
      partner.companyName,
      'Success',
      `Amount: ETB ${amount.toFixed(2)} | Ref: ${ref}`
    );
  };

  // Reset demo data
  const resetToFactoryDemo = () => {
    localStorage.clear();
    setPartners(INITIAL_PARTNERS);
    setSenderIds(INITIAL_SENDER_IDS);
    setMessages(INITIAL_SMS_MESSAGES);
    setSmscProfile(INITIAL_SMSC_PROFILE);
    setApiKeys(INITIAL_API_KEYS);
    setTransactions(INITIAL_TRANSACTIONS);
    setContacts(INITIAL_CONTACTS);
    setTemplates(INITIAL_TEMPLATES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    logAudit('Factory Reset', 'All Local Datastores', 'Success', 'Restored pristine demonstration datasets.');
  };

  return {
    partners,
    senderIds,
    messages,
    smscProfile,
    apiKeys,
    transactions,
    contacts,
    templates,
    auditLogs,
    addPartner,
    updatePartnerStatus,
    requestSenderID,
    reviewSenderIDInternal,
    recordExternalSMMPResult,
    sendQuickSMS,
    createAPIKey,
    revokeAPIKey,
    updateSMSCSettings,
    simulateSMSCHealthCheck,
    addTransaction,
    resetToFactoryDemo,
  };
}
