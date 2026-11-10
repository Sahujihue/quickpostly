'use client';

import React, { useState } from 'react';
import {
  Building2,
  Users,
  Plus,
  Shield,
  CheckCircle2,
  ExternalLink,
  Mail,
  UserCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';

interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  plan: string;
  accountsConnected: number;
  membersCount: number;
  approvalWorkflow: boolean;
  isCurrent: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Approver' | 'Viewer' | 'Owner';
  status: 'Active' | 'Invited';
  joinedAt: string;
}

const initialWorkspaces: WorkspaceItem[] = [
  {
    id: 'ws_1',
    name: 'Peak Scale Agency',
    slug: 'peak-scale',
    plan: 'Pro Growth',
    accountsConnected: 6,
    membersCount: 4,
    approvalWorkflow: true,
    isCurrent: true,
  },
  {
    id: 'ws_2',
    name: 'Cyberdyne Marketing',
    slug: 'cyberdyne',
    plan: 'Starter',
    accountsConnected: 3,
    membersCount: 2,
    approvalWorkflow: false,
    isCurrent: false,
  },
  {
    id: 'ws_3',
    name: 'NexaScale Global',
    slug: 'nexascale',
    plan: 'Agency Scale',
    accountsConnected: 12,
    membersCount: 8,
    approvalWorkflow: true,
    isCurrent: false,
  },
];

const initialMembers: Record<string, TeamMember[]> = {
  ws_1: [
    { id: 'tm_1', name: 'Alex Rivera', email: 'alex@quickpostly.com', role: 'Owner', status: 'Active', joinedAt: '2026-01-10' },
    { id: 'tm_2', name: 'Sarah Chen', email: 'sarah.chen@agency.com', role: 'Admin', status: 'Active', joinedAt: '2026-02-15' },
    { id: 'tm_3', name: 'Marcus Bell', email: 'marcus@creative.io', role: 'Editor', status: 'Active', joinedAt: '2026-03-01' },
    { id: 'tm_4', name: 'Elena Rostova', email: 'elena@clientbrand.com', role: 'Approver', status: 'Invited', joinedAt: '2026-03-20' },
  ],
  ws_2: [
    { id: 'tm_5', name: 'Alex Rivera', email: 'alex@quickpostly.com', role: 'Owner', status: 'Active', joinedAt: '2026-01-15' },
    { id: 'tm_6', name: 'John Connor', email: 'john@cyberdyne.io', role: 'Editor', status: 'Active', joinedAt: '2026-02-01' },
  ],
  ws_3: [
    { id: 'tm_7', name: 'Alex Rivera', email: 'alex@quickpostly.com', role: 'Owner', status: 'Active', joinedAt: '2026-01-20' },
  ],
};

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>(initialWorkspaces);
  const [members, setMembers] = useState<Record<string, TeamMember[]>>(initialMembers);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Editor' | 'Approver' | 'Viewer'>('Editor');
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentWorkspace = workspaces.find((w) => w.isCurrent) || workspaces[0];
  const currentMembers = members[currentWorkspace?.id] || [];

  const switchWorkspace = (id: string) => {
    setWorkspaces((prev) =>
      prev.map((w) => ({
        ...w,
        isCurrent: w.id === id,
      }))
    );
  };

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleCreateWorkspace = () => {
    if (!newWsName.trim()) return;

    const newId = `ws_${Date.now()}`;
    const newWs: WorkspaceItem = {
      id: newId,
      name: newWsName,
      slug: newWsName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      plan: 'Pro Growth',
      accountsConnected: 0,
      membersCount: 1,
      approvalWorkflow: true,
      isCurrent: true,
    };

    setWorkspaces([newWs, ...workspaces.map((w) => ({ ...w, isCurrent: false }))]);
    setMembers((prev) => ({
      ...prev,
      [newId]: [
        {
          id: `tm_${Date.now()}`,
          name: 'You (Owner)',
          email: 'owner@quickpostly.com',
          role: 'Owner',
          status: 'Active',
          joinedAt: new Date().toISOString().split('T')[0],
        },
      ],
    }));
    setNewWsName('');
    setCreateModalOpen(false);
    showToast(`Workspace "${newWsName}" created successfully!`);
  };

  const handleInviteMember = () => {
    if (!inviteEmail.trim() || !currentWorkspace) return;

    const newMember: TeamMember = {
      id: `tm_${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'Invited',
      joinedAt: new Date().toISOString().split('T')[0],
    };

    setMembers((prev) => ({
      ...prev,
      [currentWorkspace.id]: [...(prev[currentWorkspace.id] || []), newMember],
    }));

    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === currentWorkspace.id ? { ...w, membersCount: w.membersCount + 1 } : w
      )
    );

    const emailSent = inviteEmail;
    setInviteEmail('');
    setInviteModalOpen(false);
    showToast(`Invitation sent to ${emailSent} with role "${inviteRole}"!`);
  };

  const handleRemoveMember = (memberId: string) => {
    if (!currentWorkspace) return;
    setMembers((prev) => ({
      ...prev,
      [currentWorkspace.id]: (prev[currentWorkspace.id] || []).filter((m) => m.id !== memberId),
    }));
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === currentWorkspace.id ? { ...w, membersCount: Math.max(1, w.membersCount - 1) } : w
      )
    );
    showToast('Team member removed.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Workspaces &amp; Team Management
            </h1>
            <Badge variant="indigo" size="sm">
              <Building2 className="w-3 h-3 mr-1" />
              {workspaces.length} Brand Workspaces
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Isolate client social accounts, content libraries, approval workflows, and seat quotas per workspace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-amber-500" />
            <span>Add / Invite Staff</span>
          </button>

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Workspace</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((ws) => (
          <div
            key={ws.id}
            className={`p-6 rounded-2xl border transition-all duration-200 space-y-4 ${
              ws.isCurrent
                ? 'border-amber-400 bg-white dark:bg-slate-900 shadow-md ring-2 ring-amber-400/20'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                  {ws.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{ws.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">/{ws.slug}</span>
                </div>
              </div>

              {ws.isCurrent ? (
                <Badge variant="amber" size="sm">
                  Active
                </Badge>
              ) : (
                <button
                  type="button"
                  onClick={() => switchWorkspace(ws.id)}
                  className="text-xs font-semibold text-slate-500 hover:text-amber-500 cursor-pointer"
                >
                  Switch
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/60">
                <span className="text-slate-400 block text-[10px]">Connected Channels</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {ws.accountsConnected} Profiles
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/60">
                <span className="text-slate-400 block text-[10px]">Team Seats</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {ws.membersCount} Members
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span>Client Approvals: {ws.approvalWorkflow ? 'Enabled' : 'Disabled'}</span>
              </span>
              <Badge variant="slate" size="sm">
                {ws.plan}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Active Workspace Team & Staff Members */}
      {currentWorkspace && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Team &amp; Staff in {currentWorkspace.name}
                </h2>
                <Badge variant="amber" size="sm">
                  {currentMembers.length} Active Collaborators
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage team members, agency staff, and client approvers assigned to this workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setInviteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add / Invite Staff</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase tracking-wider text-[10px] font-mono">
                <tr>
                  <th className="py-2.5 px-3">Team Member</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date Added</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {currentMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-extrabold text-xs flex items-center justify-center">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{m.name}</div>
                          <div className="text-[11px] text-slate-400">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {m.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {m.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Invited
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px] font-mono">{m.joinedAt}</td>
                    <td className="py-2.5 px-3 text-right">
                      {m.role !== 'Owner' && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(m.id)}
                          className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Workspace"
        description="Workspaces provide isolated brand profiles, social accounts, and team members."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Workspace Brand Name
            </label>
            <input
              type="text"
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              placeholder="e.g. Apex Digital Marketing"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateWorkspace}
              disabled={!newWsName.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 transition-colors"
            >
              Create Workspace
            </button>
          </div>
        </div>
      </Modal>

      {/* Invite Team Member Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Member to Active Workspace"
        description="Send an email invitation with specific role permissions."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@agency.com"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Role &amp; Permissions
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="Admin">Admin (Full workspace control)</option>
              <option value="Editor">Editor (Draft &amp; schedule content)</option>
              <option value="Approver">Client Approver (Review &amp; approve drafts)</option>
              <option value="Viewer">Viewer (Read-only analytics &amp; calendar)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setInviteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInviteMember}
              disabled={!inviteEmail.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 transition-colors"
            >
              Send Invitation
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
