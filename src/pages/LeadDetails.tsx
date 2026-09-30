import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  ArrowLeft,
  Edit,
  UserPlus,
  Ban,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
  delivered: 'bg-green-500/20 text-green-400',
  opened: 'bg-yellow-500/20 text-yellow-400',
  clicked: 'bg-purple-500/20 text-purple-400',
  replied: 'bg-accent/20 text-accent',
  bounced: 'bg-red-500/20 text-red-400',
  failed: 'bg-red-500/20 text-red-400',
};

export default function LeadDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lead = useStore((state) => state.leads.find((l) => l.id === id));
  const emails = useStore((state) => state.emails.filter((e) => e.leadId === id));
  const updateLead = useStore((state) => state.updateLead);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    business: '',
    email: '',
    category: '',
    location: '',
    website: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    if (lead) {
      setEditData({
        business: lead.business,
        email: lead.email,
        category: lead.category,
        location: lead.location,
        website: lead.website,
        phone: lead.phone || '',
        notes: lead.notes || '',
      });
    }
  }, [lead]);

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">Lead not found</p>
        <button onClick={() => navigate('/leads')} className="mt-4 text-accent hover:underline">
          Back to Leads
        </button>
      </div>
    );
  }

  const handleSave = () => {
    updateLead(lead.id, editData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/leads')}
          className="p-2 text-text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-text">{lead.business}</h1>
          <p className="text-text-muted">{lead.category}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-text hover:border-accent-muted transition-colors"
          >
            <Edit size={16} />
            Edit
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-text hover:border-accent-muted transition-colors">
            <UserPlus size={16} />
            Add to Campaign
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors">
            <Ban size={16} />
            Do Not Contact
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lead Info */}
        <div className="lg:col-span-2 space-y-6">
          {isEditing ? (
            <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-medium text-text mb-4">Edit Lead</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Business</label>
                  <input
                    type="text"
                    value={editData.business}
                    onChange={(e) => setEditData({ ...editData, business: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Email</label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Category</label>
                  <input
                    type="text"
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Location</label>
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Website</label>
                  <input
                    type="text"
                    value={editData.website}
                    onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Phone</label>
                  <input
                    type="text"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Notes</label>
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-black font-medium rounded-lg transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-surface border border-border rounded-lg text-text hover:border-accent-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-text-muted" />
                  <div>
                    <p className="text-xs text-text-muted">Email</p>
                    <p className="text-text">{lead.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-text-muted" />
                  <div>
                    <p className="text-xs text-text-muted">Website</p>
                    <p className="text-text">{lead.website || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-text-muted" />
                  <div>
                    <p className="text-xs text-text-muted">Phone</p>
                    <p className="text-text">{lead.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-text-muted" />
                  <div>
                    <p className="text-xs text-text-muted">Location</p>
                    <p className="text-text">{lead.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-text-muted" />
                  <div>
                    <p className="text-xs text-text-muted">Source</p>
                    <p className="text-text">{lead.source || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[lead.status]}`}>
                    {lead.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              {lead.notes && (
                <div>
                  <p className="text-xs text-text-muted mb-1">Notes</p>
                  <p className="text-text">{lead.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Outreach History */}
          {emails.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-medium text-text mb-4">Outreach History</h2>
              <div className="space-y-4">
                {emails.map((email) => (
                  <div key={email.id} className="flex items-start gap-4">
                    <div className="mt-1">
                      <CheckCircle size={16} className="text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text">Email sent</span>
                        <span className="text-text-subtle text-sm">3:42 PM</span>
                      </div>
                      <p className="text-sm text-text-muted mt-1">{email.subject}</p>
                      <div className="flex gap-4 mt-2">
                        {email.sentAt && <span className="text-xs text-green-400">✓ Sent {new Date(email.sentAt).toLocaleTimeString()}</span>}
                        {email.deliveredAt && <span className="text-xs text-green-400">✓ Delivered {new Date(email.deliveredAt).toLocaleTimeString()}</span>}
                        {email.openedAt && <span className="text-xs text-yellow-400">👁 Opened {new Date(email.openedAt).toLocaleTimeString()}</span>}
                        {email.clickedAt && <span className="text-xs text-purple-400">🔗 Clicked {new Date(email.clickedAt).toLocaleTimeString()}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">Status</h3>
            <div className="flex items-center gap-2">
              <span className={`inline-flex px-3 py-1.5 text-sm font-medium rounded-full ${STATUS_COLORS[lead.status]}`}>
                {lead.status.replace('_', ' ')}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-text-muted">Last Activity</p>
              <p className="text-text mt-1">{lead.lastActivity}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
