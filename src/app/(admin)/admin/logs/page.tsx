'use client';

import React, { useState } from 'react';
import {
  Activity,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Lock,
  Globe,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LogItem {
  id: string;
  action: string;
  actorEmail: string;
  role: string;
  entityType: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'ALERT';
  timestamp: string;
  details: string;
}

const mockLogs: LogItem[] = [
  {
    id: 'log_1',
    action: 'ADMIN_LOGIN_SUCCESS',
    actorEmail: 'admin@quickpostly.com',
    role: 'SUPER_ADMIN',
    entityType: 'Session',
    ipAddress: '127.0.0.1 (Localhost)',
    status: 'SUCCESS',
    timestamp: '2 mins ago',
    details: 'Authenticated with bcrypt & JWT session issued',
  },
  {
    id: 'log_2',
    action: 'USER_REGISTERED',
    actorEmail: 'customer@example.com',
    role: 'USER',
    entityType: 'User',
    ipAddress: '192.168.1.45',
    status: 'SUCCESS',
    timestamp: '18 mins ago',
    details: 'Enforced role: USER; issued 24h verification token',
  },
  {
    id: 'log_3',
    action: 'USER_SUSPENDED',
    actorEmail: 'admin@quickpostly.com',
    role: 'SUPER_ADMIN',
    entityType: 'User',
    ipAddress: '127.0.0.1',
    status: 'WARNING',
    timestamp: '42 mins ago',
    details: 'Suspended user id: usr_test_1849; invalidated 2 active sessions',
  },
  {
    id: 'log_4',
    action: '2FA_ENABLED',
    actorEmail: 'admin@quickpostly.com',
    role: 'SUPER_ADMIN',
    entityType: 'UserSecurity',
    ipAddress: '127.0.0.1',
    status: 'SUCCESS',
    timestamp: '1 hour ago',
    details: 'Activated RFC 6238 TOTP and issued 8 recovery codes',
  },
  {
    id: 'log_5',
    action: 'RATE_LIMIT_WARNING',
    actorEmail: 'unknown_attacker@bot.net',
    role: 'GUEST',
    entityType: 'RateLimiter',
    ipAddress: '45.132.84.12',
    status: 'ALERT',
    timestamp: '3 hours ago',
    details: 'Exceeded 5 failed login attempts; sliding window lockout engaged (15m)',
  },
];

export default function AdminLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filtered = mockLogs.filter((log) => {
    const matchesSearch =
      log.actorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.action.includes(actionFilter);
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Security &amp; Administrative Activity Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Immutable platform audit trail tracking administrative actions, authentications, and rate limit triggers.
          </p>
        </div>

        <Badge variant="indigo" size="sm">
          <Shield className="w-3.5 h-3.5 mr-1" />
          Audit Trail Encrypted
        </Badge>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-base text-white">Event Stream</h3>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search actor, IP or event..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="p-1.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Actions</option>
              <option value="LOGIN">Login Events</option>
              <option value="USER">User Management</option>
              <option value="RATE_LIMIT">Rate Limiter</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Event Action</th>
                <th className="px-4 py-3">Actor / Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5">
                    <Badge
                      variant={
                        log.status === 'SUCCESS'
                          ? 'emerald'
                          : log.status === 'WARNING'
                          ? 'amber'
                          : 'rose'
                      }
                      size="sm"
                    >
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-white">{log.actorEmail}</td>
                  <td className="px-4 py-3.5 text-slate-400">{log.role}</td>
                  <td className="px-4 py-3.5 text-slate-300 max-w-sm truncate">{log.details}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-400">{log.ipAddress}</td>
                  <td className="px-4 py-3.5 text-slate-400">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
