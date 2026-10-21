export type PartnerStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'approved' 
  | 'suspended' 
  | 'rejected' 
  | 'closed';

export type SenderIDStatus = 
  | 'draft' 
  | 'submitted_by_partner' 
  | 'received_by_simconnect' 
  | 'pending_internal_review' 
  | 'submitted_to_smmp' 
  | 'pending_external_approval' 
  | 'approved_configured' 
  | 'rejected' 
  | 'suspended' 
  | 'expired';

export type SMSStatus = 
  | 'queued' 
  | 'submitted' 
  | 'accepted_by_upstream' 
  | 'sent' 
  | 'delivered' 
  | 'failed' 
  | 'expired' 
  | 'awaiting_report';

export type SMSChannel = 'API' | 'Dashboard';

export type SMSCStatus = 
  | 'not_configured' 
  | 'awaiting_provisioning' 
  | 'configured_untested' 
  | 'connected' 
  | 'disconnected' 
  | 'error';

export interface Partner {
  id: string;
  code: string;
  companyName: string;
  tradingName: string;
  businessLicense: string;
  tinNumber: string;
  primaryContact: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  status: PartnerStatus;
  onboardingDate: string;
  smsUsageCount: number;
  senderIdCount: number;
  balanceETB: number;
  tariffPerSMS: number;
  lastActivity: string;
  internalNotes?: string;
}

export interface SenderIDRecord {
  id: string;
  senderId: string;
  partnerId: string;
  partnerName: string;
  businessPurpose: string;
  submissionDate: string;
  requestReference: string;
  status: SenderIDStatus;
  internalReviewer?: string;
  internalReviewNotes?: string;
  externalApprovalRef?: string;
  externalSubmissionDate?: string;
  externalApprovalDate?: string;
  rejectionReason?: string;
  isConfiguredAndUsable: boolean;
  lastUpdated: string;
}

export interface SMSMessage {
  id: string;
  messageRef: string;
  partnerId: string;
  partnerName: string;
  senderId: string;
  recipientMasked: string;
  recipientFull: string;
  content: string;
  channel: SMSChannel;
  status: SMSStatus;
  segmentCount: number;
  encoding: 'GSM-7' | 'Unicode';
  providerResponseCode?: string;
  costETB: number;
  submittedAt: string;
  deliveredAt?: string;
  failureReason?: string;
}

export interface SMSCProfile {
  profileName: string;
  provider: string; // e.g., 'Ethio telecom SMSC Gateway'
  environment: 'Test / Sandbox' | 'Production';
  protocol: 'SMPP v3.4' | 'SMPP v5.0' | 'HTTP/REST';
  systemIdMasked: string;
  systemType: string;
  hostPrimary: string;
  portPrimary: number;
  hostSecondary?: string;
  portSecondary?: number;
  bindMode: 'Transceiver' | 'Transmitter' | 'Receiver';
  hasCredentialsStored: boolean;
  provisioningStatus: 'Requested' | 'Pending Review by Ethio telecom' | 'Provisioned' | 'Credentials Received';
  connectionStatus: SMSCStatus;
  lastHealthCheck?: string;
  lastError?: string;
  throughputTPS: number;
  activeSessions: number;
  lastUpdated: string;
}

export interface APIKeyRecord {
  id: string;
  partnerId: string;
  partnerName: string;
  keyLabel: string;
  prefix: string; // e.g., 'sk_live_eth_...'
  createdAt: string;
  lastUsedAt: string | null;
  status: 'active' | 'revoked';
  ipAllowlist: string[];
}

export interface TransactionRecord {
  id: string;
  partnerId: string;
  partnerName: string;
  type: 'credit' | 'debit' | 'adjustment' | 'reversal';
  amountETB: number;
  balanceAfterETB: number;
  reference: string;
  description: string;
  timestamp: string;
}

export interface ContactRecord {
  id: string;
  partnerId?: string;
  name: string;
  phoneMasked: string;
  phoneFull: string;
  group: string;
  createdAt: string;
}

export interface SMSTemplateRecord {
  id: string;
  partnerId?: string;
  title: string;
  content: string;
  category: 'OTP / Security' | 'Transactional' | 'Marketing' | 'Notification';
  senderIdSuggested: string;
  lastUpdated: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  outcome: 'Success' | 'Denied' | 'Pending' | 'Failed';
  reason?: string;
  requestRef?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Administrator' | 'Operations Administrator' | 'Sender ID Reviewer' | 'Billing / Finance' | 'Support Auditor';
  status: 'active' | 'inactive';
  lastLogin: string;
}
