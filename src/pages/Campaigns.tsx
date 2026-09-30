import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Plus, Users, Send, CheckCircle, Eye, MessageCircle } from 'lucide-react';

export default function Campaigns() {
  const campaigns = useStore((state) => state.campaigns);
  const leads = useStore((state) => state.leads);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Campaigns</h1>
          <p className="text-text-muted">Create and manage your outreach campaigns.</p>
        </div>
        <Link
          to="/campaigns/create"
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-black font-medium rounded-lg transition-colors"
        >
          <Plus size={18} />
          Create Campaign
        </Link>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <p className="text-text-muted mb-4">No campaigns yet</p>
          <Link
            to="/campaigns/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-black font-medium rounded-lg transition-colors"
          >
            <Plus size={18} />
            Create Campaign
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {campaigns.map((campaign) => {
            const campaignLeads = leads.filter((l) => campaign.leads.includes(l.id));
            const approvedLeads = campaignLeads.filter((l) => ['delivered', 'opened', 'clicked', 'replied', 'approved'].includes(l.status));
            const sentCount = campaignLeads.filter((l) => ['delivered', 'opened', 'clicked', 'replied'].includes(l.status)).length;
            const deliveredCount = campaignLeads.filter((l) => ['delivered', 'opened', 'clicked', 'replied'].includes(l.status)).length;
            const openedCount = campaignLeads.filter((l) => ['opened', 'clicked', 'replied'].includes(l.status)).length;
            const repliedCount = campaignLeads.filter((l) => l.status === 'replied').length;

            return (
              <Link
                key={campaign.id}
                to={`/campaigns/${campaign.id}`}
                className="bg-surface border border-border rounded-xl p-5 hover:border-accent-muted transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-medium text-text">{campaign.name}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    campaign.status === 'sent' ? 'bg-accent/20 text-accent' :
                    campaign.status === 'draft' ? 'bg-gray-500/20 text-gray-400' :
                    campaign.status === 'review' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {campaign.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                  <div>
                    <div className="flex items-center gap-1 text-text-subtle">
                      <Users size={12} />
                      <span>{campaignLeads.length} leads</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-text-subtle">
                      <CheckCircle size={12} />
                      <span>{approvedLeads.length} approved</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-text-subtle">
                      <Send size={12} />
                      <span>{sentCount} sent</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-text-muted">
                  <div className="flex items-center gap-1">
                    <CheckCircle size={12} className="text-green-400" />
                    <span>{deliveredCount} delivered</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye size={12} className="text-yellow-400" />
                    <span>{openedCount} opened</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle size={12} className="text-accent" />
                    <span>{repliedCount} replies</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
