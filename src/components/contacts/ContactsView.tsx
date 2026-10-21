import React, { useState } from 'react';
import {
  Plus,
  Search,
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { ContactRecord } from '../../types';

interface ContactsViewProps {
  contacts: ContactRecord[];
  onOpenQuickSMS: () => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({ contacts, onOpenQuickSMS }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [contactList, setContactList] = useState<ContactRecord[]>(contacts);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // New contact form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+251 9');
  const [group, setGroup] = useState('Logistics Leads');

  // CSV Import state
  const [importText, setImportText] = useState(
    'Dawit Mengistu,+251911428890,Awash Cargo Leads\nSelamawit Bekele,+251923341120,Zemen Store Managers\nYonas Tadesse,+251944119901,AddisRide Operations\nInvalid Contact,12345,Corrupt Record'
  );
  const [importSummary, setImportSummary] = useState<{
    validCount: number;
    invalidCount: number;
    errors: string[];
  } | null>(null);

  const filteredContacts = contactList.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phoneMasked.includes(searchQuery)
  );

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const cleanPhone = phone.trim();
    const masked =
      cleanPhone.length >= 8
        ? `${cleanPhone.substring(0, 7)}*** ${cleanPhone.substring(cleanPhone.length - 3)}`
        : cleanPhone;

    const newContact: ContactRecord = {
      id: `con_${Date.now()}`,
      name: name.trim(),
      phoneMasked: masked,
      phoneFull: cleanPhone,
      group: group.trim() || 'General',
      createdAt: new Date().toISOString().substring(0, 10),
    };

    setContactList((prev) => [newContact, ...prev]);
    setShowAddModal(false);
    setName('');
    setPhone('+251 9');
  };

  const handleProcessImport = () => {
    const lines = importText.split('\n').map((l) => l.trim()).filter(Boolean);
    let valid = 0;
    let invalid = 0;
    const errors: string[] = [];
    const newItems: ContactRecord[] = [];

    lines.forEach((line, index) => {
      const parts = line.split(',');
      if (parts.length < 2) {
        invalid++;
        errors.push(`Row ${index + 1}: Missing comma separated name and phone number.`);
        return;
      }
      const cName = parts[0].trim();
      const cPhone = parts[1].trim();
      const cGroup = parts[2]?.trim() || 'Imported Contacts';

      // Validate Ethiopian phone
      if (!cPhone.startsWith('+251') && !cPhone.startsWith('09') && !cPhone.startsWith('07')) {
        invalid++;
        errors.push(`Row ${index + 1} (${cName}): Invalid Ethiopian phone format "${cPhone}". Must begin with +251, 09, or 07.`);
        return;
      }

      valid++;
      const masked =
        cPhone.length >= 8
          ? `${cPhone.substring(0, 7)}*** ${cPhone.substring(cPhone.length - 3)}`
          : cPhone;

      newItems.push({
        id: `con_imp_${Date.now()}_${index}`,
        name: cName,
        phoneMasked: masked,
        phoneFull: cPhone,
        group: cGroup,
        createdAt: new Date().toISOString().substring(0, 10),
      });
    });

    setImportSummary({
      validCount: valid,
      invalidCount: invalid,
      errors,
    });

    if (newItems.length > 0) {
      setContactList((prev) => [...newItems, ...prev]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            Verified Recipient Contacts
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {contactList.length} Contacts
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise distribution lists and verified recipient phone numbers with privacy masking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-xs text-slate-700 font-medium transition-colors shadow-xs"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>CSV Batch Import</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 max-w-md shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by contact name, group, or phone..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Contacts Table */}
      <div className="rounded-xl bg-white border border-slate-200/90 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
              <th className="py-3 px-4">Contact Name</th>
              <th className="py-3 px-4">Mobile Number (Masked)</th>
              <th className="py-3 px-4">Contact Group</th>
              <th className="py-3 px-4">Created Date</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredContacts.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-semibold text-slate-900">{c.name}</td>
                <td className="py-3 px-4 font-mono font-semibold text-blue-600">{c.phoneMasked}</td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-medium">
                    {c.group}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-slate-500">{c.createdAt}</td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={onOpenQuickSMS}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Quick SMS &rarr;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" /> Add Recipient Contact
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alazar Tadesse"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mobile Phone (+251) *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+251 91 142 8890"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Group / List</label>
                <input
                  type="text"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  placeholder="e.g. Addis Drivers"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" /> CSV Contact Importer & Validator
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Paste comma-separated values (Name, Mobile Phone, Optional Group). The validator will enforce Ethiopian mobile prefixes (<code className="text-blue-700 font-semibold">+251</code>, <code className="text-blue-700 font-semibold">09</code>, <code className="text-blue-700 font-semibold">07</code>).
              </p>

              <textarea
                rows={6}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-[11px] focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />

              {importSummary && (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {importSummary.validCount} Valid Records
                    </span>
                    <span className="text-rose-700 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {importSummary.invalidCount} Rejected
                    </span>
                  </div>

                  {importSummary.errors.length > 0 && (
                    <div className="space-y-1 text-[11px] text-rose-800 font-mono bg-rose-50 p-2.5 rounded border border-rose-200 max-h-24 overflow-y-auto">
                      {importSummary.errors.map((err, i) => (
                        <div key={i}>{err}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportSummary(null);
                }}
                className="px-3 py-2 text-slate-600 hover:text-slate-900 text-xs font-medium"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleProcessImport}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors"
              >
                Validate & Import CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
