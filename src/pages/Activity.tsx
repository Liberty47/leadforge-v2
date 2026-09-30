import { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  Send,
  CheckCircle,
  Eye,
  MousePointer,
  MessageCircle,
  XCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';

const FILTERS = ['all', 'sent', 'delivered', 'opened', 'clicked', 'replies', 'bounces'];

export default function Activity() {
  const activities = useStore((state) => state.activities);
  const [filter, setFilter] = useState('all');

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
      case 'bounced':
        return <XCircle size={14} className="text-red-400" />;
      case 'failed':
        return <AlertCircle size={14} className="text-red-400" />;
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
      case 'bounced':
        return 'Email bounced';
      case 'failed':
        return 'Send failed';
      default:
        return type;
    }
  };

  const filteredActivities = activities.filter((activity) => {
    if (filter === 'all') return true;
    if (filter === 'sent') return activity.type === 'email_sent';
    if (filter === 'delivered') return activity.type === 'delivered';
    if (filter === 'opened') return activity.type === 'open_detected';
    if (filter === 'clicked') return activity.type === 'clicked';
    if (filter === 'replies') return activity.type === 'replied';
    if (filter === 'bounces') return activity.type === 'bounced' || activity.type === 'failed';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text">Activity</h1>
        <p className="text-text-muted">Track all your outreach activity in one place.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-accent text-black'
                : 'bg-surface border border-border text-text-muted hover:text-text hover:border-accent-muted'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Activity Feed */}
      <div className="bg-surface border border-border rounded-xl divide-y divide-border">
        {filteredActivities.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            No activity yet
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-4 hover:bg-surface-hover transition-colors">
              <div className="p-2 bg-background rounded-lg">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text">{activity.leadName}</p>
                <p className="text-sm text-text-muted">{getActivityText(activity.type)}</p>
              </div>
              <span className="text-sm text-text-subtle">{activity.timestamp}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
