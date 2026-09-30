import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  Users,
  Send,
  CheckCircle,
  Eye,
  MousePointer,
  MessageCircle,
  Plus,
  Clock,
} from 'lucide-react';

function formatTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { stats, activities, campaigns, leads } = useStore();

  const recentActivity = activities.slice(0, 4);
  const activeCampaigns = campaigns.filter((c) => c.status === 'sent').slice(0, 2);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email_sent':
        return <Send size={14} className="text-blue-400" />;
      case 'delivered':
        return <CheckCircle size={14} className="text-green-400" />;
      case 'open_detected':
        return <Eye size={14} className="text-yellow-400" />;
      case 'clicked':
        return <MousePointer size={14} className="text-purple-400" />;
      case 'replied':
        return <MessageCircle size={14} className="text-accent" />;
      default:
        return <Clock size={14} className="text-text-subtle" />;
    }
  };

  const getActivityText = (type: string) => {
    switch (type) {
      case 'email_sent':
        return 'Email sent';
      case 'delivered':
        return 'Email delivered';
      case 'open_detected':
        return 'Open detected';
      case 'clicked':
        return 'Link clicked';
      case 'replied':
        return 'Reply received';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text">{formatTimeOfDay()}</h1>
        <p className="text-text-muted">Here's what's happening with your outreach.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={stats.totalLeads.toLocaleString()} icon={Users} />
        <StatCard label="Emails Sent" value={stats.emailsSent.toLocaleString()} icon={Send} />
        <StatCard label="Delivered" value={stats.delivered.toLocaleString()} icon={CheckCircle} />
        <StatCard label="Open Detected" value={stats.openDetected.toLocaleString()} icon={Eye} />
        <StatCard label="Clicked" value={stats.clicked.toLocaleString()} icon={MousePointer} />
        <StatCard label="Replies" value={stats.replies.toLocaleString()} icon={MessageCircle} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <section>
          <h2 className="text-lg font-medium text-text mb-4">Recent Activity</h2>
          <div className="bg-surface border border-border rounded-xl divide-y divide-border">
            {recentActivity.length === 0 ? (
              <div className="p-6 text-center text-text-muted">
                No activity yet
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-4">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{activity.leadName}</p>
                    <p className="text-xs text-text-muted">{getActivityText(activity.type)}</p>
                  </div>
                  <span className="text-xs text-text-subtle">{activity.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Active Campaigns */}
        <section>
          <h2 className="text-lg font-medium text-text mb-4">Active Campaigns</h2>
          <div className="space-y-4">
            {activeCampaigns.length === 0 ? (
              <div className="bg-surface border border-border rounded-xl p-6 text-center text-text-muted">
                No active campaigns yet
              </div>
            ) : (
              activeCampaigns.map((campaign) => {
                const campaignLeads = leads.filter((l) => campaign.leads.includes(l.id));
                const approvedLeads = campaignLeads.filter((l) => ['delivered', 'opened', 'clicked', 'replied'].includes(l.status));
                return (
                  <Link
                    key={campaign.id}
                    to={`/campaigns/${campaign.id}`}
                    className="block bg-surface border border-border rounded-xl p-4 hover:border-accent-muted transition-colors"
                  >
                    <h3 className="font-medium text-text mb-3">{campaign.name}</h3>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-text-subtle">{campaignLeads.length}</span>
                        <span className="text-text-muted ml-1">leads</span>
                      </div>
                      <div>
                        <span className="text-text-subtle">{approvedLeads.length}</span>
                        <span className="text-text-muted ml-1">approved</span>
                      </div>
                      <div>
                        <span className="text-text-subtle">{stats.emailsSent}</span>
                        <span className="text-text-muted ml-1">sent</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-medium text-text mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/find-leads"
            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-black font-medium rounded-lg transition-colors"
          >
            <Plus size={18} />
            Find Leads
          </Link>
          <Link
            to="/campaigns/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-surface-hover border border-border text-text font-medium rounded-lg transition-colors"
          >
            <Plus size={18} />
            Create Campaign
          </Link>
          <Link
            to="/review"
            className="flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-surface-hover border border-border text-text font-medium rounded-lg transition-colors"
          >
            Review Emails
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="text-text-muted" />
        <span className="text-xs text-text-muted uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-text">{value}</p>
    </div>
  );
}
