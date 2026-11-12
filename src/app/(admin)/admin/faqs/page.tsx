'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { HelpCircle, Plus, Edit2, Trash2, ArrowUp, ArrowDown, Save, Loader2 } from 'lucide-react';
import { CmsFaqItemRecord } from '@/lib/cms/repository';

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<CmsFaqItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState<Partial<CmsFaqItemRecord> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/cms/faqs');
      const data = await res.json();
      if (data.success) {
        setFaqs(data.data);
      }
    } catch {
      setMessage({ text: 'Failed to load FAQ items', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleOpenCreate = () => {
    setEditingFaq({
      question: '',
      answer: '',
      category: 'General',
      order: faqs.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (faq: CmsFaqItemRecord) => {
    setEditingFaq(faq);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq || !editingFaq.question || !editingFaq.answer) return;

    setSaving(true);
    try {
      const res = await fetch('/api/v1/admin/cms/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFaq),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'FAQ item saved successfully', type: 'success' });
        setIsModalOpen(false);
        fetchFaqs();
      } else {
        setMessage({ text: data.error?.message || 'Failed to save FAQ', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error saving FAQ', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ item?')) return;
    try {
      const res = await fetch(`/api/v1/admin/cms/faqs?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'FAQ item deleted', type: 'success' });
        fetchFaqs();
      }
    } catch {
      setMessage({ text: 'Failed to delete FAQ', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-indigo-500" />
            <span>Frequently Asked Questions (FAQ)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Maintain categorized FAQ questions and comprehensive answers shown on the public landing page.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add FAQ Item</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-xs font-medium ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading FAQ knowledge items...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral">{faq.category}</Badge>
                    <Badge variant={faq.isActive ? 'success' : 'neutral'}>
                      {faq.isActive ? 'Active' : 'Hidden'}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white pt-1">
                    {faq.question}
                  </h3>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(faq)}
                    className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(faq.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-2">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFaq?.id ? 'Edit FAQ Item' : 'New FAQ Item'}
      >
        {editingFaq && (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={editingFaq.category || 'General'}
                onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Platform">Platform & Workflow</option>
                <option value="Features">Features & Capabilities</option>
                <option value="Agencies">Agencies & Workspaces</option>
                <option value="Billing">Billing & Plans</option>
                <option value="Security">Security & Compliance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Question
              </label>
              <input
                type="text"
                required
                value={editingFaq.question || ''}
                onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Detailed Answer
              </label>
              <textarea
                rows={4}
                required
                value={editingFaq.answer || ''}
                onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={editingFaq.isActive ?? true}
                  onChange={(e) => setEditingFaq({ ...editingFaq, isActive: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Active on Public FAQ Accordion</span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save FAQ</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
