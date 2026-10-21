import React, { useState } from 'react';
import {
  Plus,
  CreditCard,
  X,
} from 'lucide-react';
import { Partner, TransactionRecord } from '../../types';

interface BillingViewProps {
  mode: 'management' | 'transactions';
  partners: Partner[];
  transactions: TransactionRecord[];
  onAddTransaction: (partnerId: string, amount: number, ref: string, desc: string) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  mode,
  partners,
  transactions,
  onAddTransaction,
}) => {
  const [activeTab, setActiveTab] = useState<'management' | 'transactions'>(
    mode === 'transactions' ? 'transactions' : 'management'
  );

  const [searchQuery] = useState('');
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpPartnerId, setTopUpPartnerId] = useState(partners[0]?.id || '');
  const [topUpAmount, setTopUpAmount] = useState(1000);
  const [topUpRef, setTopUpRef] = useState('');
  const [topUpBank, setTopUpBank] = useState('Commercial Bank of Ethiopia (CBE)');

  const totalBalance = partners.reduce((sum, p) => sum + p.balanceETB, 0);
  const totalBilledUsage = partners.reduce((sum, p) => sum + p.smsUsageCount * p.tariffPerSMS, 0);

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpPartnerId || topUpAmount <= 0) return;

    const ref = topUpRef.trim() || `BANK-DEP-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const desc = `${topUpBank} deposit pre-fund credit`;
    onAddTransaction(topUpPartnerId, topUpAmount, ref, desc);
    setShowTopUpModal(false);
    setTopUpAmount(1000);
    setTopUpRef('');
  };

  const filteredTransactions = transactions.filter((t) => {
    return (
      t.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            {activeTab === 'management' ? 'Billing Accounts & Tariffs' : 'Billing Transaction Ledger'}
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 font-mono">
              ETB (Ethiopian Birr)
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Downstream partner pre-funded accounts, per-segment SMS tariffs, and reconciliation ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('management')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'management'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Account Balances
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'transactions'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Transaction Log
            </button>
          </div>

          <button
            onClick={() => setShowTopUpModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Credit Pre-fund</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-slate-500 text-xs font-medium block">Total Partner Escrow Balances</span>
          <div className="text-2xl font-bold text-blue-600 font-mono tabular-nums mt-1.5">
            ETB {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Active across {partners.length} downstream accounts</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-slate-500 text-xs font-medium block">Recorded SMS Usage Charges</span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1.5">
            ETB {totalBilledUsage.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Accumulated demo period charges</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-slate-500 text-xs font-medium block">Settlement Model</span>
          <div className="text-xl font-bold text-emerald-600 font-mono mt-1.5">
            Pre-Paid Escrow
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Real-time debit per delivered segment</span>
        </div>
      </div>

      {/* Tab 1: Account Balances & Tariffs */}
      {activeTab === 'management' && (
        <div className="rounded-xl bg-white border border-slate-200/90 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-3 px-4">Partner Name & Code</th>
                <th className="py-3 px-4">TIN Number</th>
                <th className="py-3 px-4 text-right">Current Balance</th>
                <th className="py-3 px-4 text-right">Tariff / SMS</th>
                <th className="py-3 px-4 text-center">SMS Sent</th>
                <th className="py-3 px-4 text-right">Total Charges</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partners.map((p) => {
                const charges = p.smsUsageCount * p.tariffPerSMS;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{p.companyName}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{p.code}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{p.tinNumber}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-600 tabular-nums">
                      ETB {p.balanceETB.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                      ETB {p.tariffPerSMS.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-900 tabular-nums font-medium">
                      {p.smsUsageCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                      ETB {charges.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setTopUpPartnerId(p.id);
                          setShowTopUpModal(true);
                        }}
                        className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-semibold transition-colors"
                      >
                        Add Funds
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Transaction Log */}
      {activeTab === 'transactions' && (
        <div className="rounded-xl bg-white border border-slate-200/90 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Partner</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Amount (ETB)</th>
                <th className="py-3 px-4 text-right">Balance After</th>
                <th className="py-3 px-4 text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                    {tx.reference}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{tx.partnerName}</td>
                  <td className="py-3 px-4 text-slate-600">{tx.description}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      CREDIT
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 tabular-nums">
                    +ETB {tx.amountETB.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                    ETB {tx.balanceAfterETB.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500 text-[11px]">
                    {tx.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Top-up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" /> Credit Partner Pre-Fund Balance
              </h3>
              <button
                onClick={() => setShowTopUpModal(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTopUpSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Downstream Partner Account *</label>
                <select
                  value={topUpPartnerId}
                  onChange={(e) => setTopUpPartnerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                >
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.companyName} (Current: ETB {p.balanceETB.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Recharge Amount (ETB) *</label>
                <input
                  type="number"
                  step="100"
                  min="100"
                  required
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Settlement Channel *</label>
                <select
                  value={topUpBank}
                  onChange={(e) => setTopUpBank(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="Commercial Bank of Ethiopia (CBE)">Commercial Bank of Ethiopia (CBE)</option>
                  <option value="Telebirr Merchant B2B">Telebirr Merchant B2B</option>
                  <option value="Awash Bank Corporate">Awash Bank Corporate</option>
                  <option value="Bank of Abyssinia">Bank of Abyssinia</option>
                  <option value="Dashen Bank Amole">Dashen Bank Amole</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Bank Deposit / Slip Reference</label>
                <input
                  type="text"
                  value={topUpRef}
                  onChange={(e) => setTopUpRef(e.target.value)}
                  placeholder="e.g. CBE-DEP-8849102"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTopUpModal(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
                >
                  Post Credit Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
