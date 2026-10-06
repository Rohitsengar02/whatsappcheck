import React, { useState } from 'react';
import {
  Users,
  Plus,
  Send,
  MessageSquare,
  Link,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Megaphone
} from 'lucide-react';
import { WhatsAppGroup } from '../../types/dashboard';

interface GroupsManagerViewProps {
  groups: WhatsAppGroup[];
  onSendGroupAnnouncement: (group: WhatsAppGroup, message: string) => void;
  onAddGroup: (group: Omit<WhatsAppGroup, 'id' | 'lastActive'>) => void;
}

export const GroupsManagerView: React.FC<GroupsManagerViewProps> = ({
  groups,
  onSendGroupAnnouncement,
  onAddGroup,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<WhatsAppGroup | null>(null);
  const [announcementText, setAnnouncementText] = useState(
    '📢 *COMMUNITY ANNOUNCEMENT* 🔥\n\nHey everyone! We have just released fresh seasonal specials. Members get early access today only!'
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [members, setMembers] = useState('150');
  const [category, setCategory] = useState<WhatsAppGroup['category']>('Community');
  const [inviteLink, setInviteLink] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !announcementText.trim()) return;

    onSendGroupAnnouncement(selectedGroup, announcementText);
    setSelectedGroup(null);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddGroup({
      name,
      memberCount: parseInt(members, 10) || 50,
      category,
      inviteLink: inviteLink || 'https://chat.whatsapp.com/sample',
    });

    setName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            WhatsApp Groups & VIP Communities Manager
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast announcements, promotions, and updates to connected WhatsApp groups in one click.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto shadow-xs active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Group Tracker</span>
        </button>
      </div>

      {/* Group Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {groups.map((grp) => (
          <div
            key={grp.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 hover:shadow-sm transition"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                  {grp.category}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{grp.lastActive}</span>
              </div>

              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">{grp.name}</h4>
              </div>

              <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Group Audience:</span>
                <span className="font-bold text-slate-900 font-mono">{grp.memberCount} Members</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedGroup(grp)}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Broadcast to Group</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast Announcement Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Broadcast to: {selectedGroup.name}
                </h4>
                <span className="text-xs text-slate-500">
                  Will deliver to all {selectedGroup.memberCount} group participants
                </span>
              </div>
            </div>

            <form onSubmit={handleSend} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Announcement Message Body
                </label>
                <textarea
                  rows={5}
                  required
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedGroup(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Announcement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Group Tracker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl">
            <h4 className="text-base font-bold text-slate-900 mb-1">Track New WhatsApp Group</h4>
            <p className="text-xs text-slate-500 mb-4">Add your WhatsApp VIP group to manage group broadcasts.</p>

            <form onSubmit={handleCreateGroup} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Founders Club"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Approx Members</label>
                  <input
                    type="number"
                    value={members}
                    onChange={(e) => setMembers(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="VIP Customers">VIP Customers</option>
                    <option value="Community">Community</option>
                    <option value="Announcements">Announcements</option>
                    <option value="Internal Team">Internal Team</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Invite Link</label>
                <input
                  type="url"
                  placeholder="https://chat.whatsapp.com/..."
                  value={inviteLink}
                  onChange={(e) => setInviteLink(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
                >
                  Track Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
