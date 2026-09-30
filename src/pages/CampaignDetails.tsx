import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  ArrowLeft,
  Users,
  Send,
  CheckCircle,
  Eye,
  MousePointer,
  MessageCircle,
} from 'lucide-react';

export default function CampaignDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const campaign = useStore((state) => state.campaigns.find((c) => c.id === id));
  const leads = useStore((state) => state.leads);
  const emails = useStore((state) => state.emails.filter((e) => e.campaignId === id));

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">Campaign not found</p>
        <button onClick={() => navigate('/campaigns')} className="mt-4 text-accent hover:underline">
          Back to Campaigns
        </button>
      </div>
    );
  }

  const campaignLeads = leads.filter((l) => campaign.leads.includes(l.id));
  const approvedCount = emails.filter((e) => e.status === 'approved' || ['delivered', 'opened', 'clicked', 'replied'].includes(e.status)).length;
  const sentCount = emails.filter((e) => ['sent', 'delivered', 'opened', 'clicked', 'replied'].includes(e.status)).length;
  const deliveredCount = emails.filter((e) => ['delivered', 'opened', 'clicked', 'replied'].includes(e.status)).length;
  const openedCount = emails.filter((e) => ['opened', 'clicked', 'replied'].includes(e.status)).length;
  const repliedCount = emails.filter((e) => e.status === 'replied').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/campaigns')}
          className="p-2 text-text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-text">{campaign.name}</h1>
          <p className="text-text-muted">{campaign.category} — {campaign.location}</p>
        </div>
        <div className="flex gap-2">
          {campaign.status === 'review' && (
            <Link
              to="/review"
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-black font-medium rounded-lg transition-colors"
            >
              Review Emails
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-text-muted" />
            <span className="text-xs text-text-muted uppercase tracking-wide">Total Leads</span>
          </div>
          <p className="text-2xl font-semibold text-text">{campaignLeads.length}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-text-muted" />
            <span className="text-xs text-text-muted uppercase tracking-wide">Approved</span>
          </div>
          <p className="text-2xl font-semibold text-text">{approvedCount}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Send size={16} className="text-text-muted" />
            <span className="text-xs text-text-muted uppercase tracking-wide">Sent</span>
          </div>
          <p className="text-2xl font-semibold text-text">{sentCount}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-green-400" />
            <span className="text-xs text-text-muted uppercase tracking-wide">Delivered</span>
          </div>
          <p className="text-2xl font-semibold text-text">{deliveredCount}</p>
        </div>
      </div>

      {/* Email Metrics */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <Eye size={20} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-text">{openedCount}</p>
            <p className="text-sm text-text-muted">Opened</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <MousePointer size={20} className="text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-text">{emails.filter((e) => e.status === 'clicked').length}</p>
            <p className="text-sm text-text-muted">Clicked</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="p-2 bg-accent/20 rounded-lg">
            <MessageCircle size={20} className="text-accent" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-text">{repliedCount}</p>
            <p className="text-sm text-text-muted">Replies</p>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-medium text-text">Campaign Leads</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide">Business</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide hidden sm:table-cell">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campaignLeads.map((lead) => {
                const email = emails.find((e) => e.leadId === lead.id);
                return (
                  <tr key={lead.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/leads/${lead.id}`} className="font-medium text-text hover:text-accent transition-colors">
                        {lead.business}
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-text-muted">{lead.email || 'No email'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        email?.status === 'replied' ? 'bg-accent/20 text-accent' :
                        email?.status === 'clicked' ? 'bg-purple-500/20 text-purple-400' :
                        email?.status === 'open_detected' ? 'bg-yellow-500/20 text-yellow-400' :
                        email?.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                        email?.status === 'sent' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {email?.status?.replace('_', ' ') || 'Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
