import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  MousePointer,
  Clock,
  Send,
} from 'lucide-react';

export default function EmailDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const email = useStore((state) => state.emails.find((e) => e.id === id));
  const lead = useStore((state) => state.leads.find((l) => l.id === email?.leadId));
  const campaign = useStore((state) => state.campaigns.find((c) => c.id === email?.campaignId));

  if (!email) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">Email not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-accent hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const getStatusSummary = () => {
    const statuses = [];
    if (email.status === 'sent' || email.status === 'delivered' || email.status === 'open_detected' || email.status === 'clicked' || email.status === 'replied') {
      statuses.push({ label: 'Delivered', done: true });
    }
    if (email.status === 'open_detected' || email.status === 'clicked' || email.status === 'replied') {
      statuses.push({ label: 'Open detected', done: true });
    }
    if (email.status === 'clicked' || email.status === 'replied') {
      statuses.push({ label: 'Clicked', done: true });
    }
    if (email.status === 'replied') {
      statuses.push({ label: 'Reply', done: true });
    }
    return statuses;
  };

  const timeline = [
    { label: 'AI generated', time: email.createdAt ? new Date(email.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '', icon: Clock, done: true },
    { label: 'Approved', time: '', icon: CheckCircle, done: email.status !== 'pending_review' && email.status !== 'rejected' },
    { label: 'Sent', time: email.sentAt ? new Date(email.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '', icon: Send, done: !!email.sentAt },
    { label: 'Delivered', time: email.deliveredAt ? new Date(email.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '', icon: CheckCircle, done: !!email.deliveredAt },
    { label: 'Open detected', time: email.openedAt ? new Date(email.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '', icon: Eye, done: !!email.openedAt },
    { label: 'Clicked', time: email.clickedAt ? new Date(email.clickedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '', icon: MousePointer, done: !!email.clickedAt },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-text">{lead?.business || 'Unknown'}</h1>
          <p className="text-text-muted">{email.to}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Email Content */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted w-16">To:</span>
                  <span className="text-text">{email.to}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted w-16">Subject:</span>
                  <span className="text-text">{email.subject}</span>
                </div>
                {campaign && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted w-16">Campaign:</span>
                    <span className="text-text">{campaign.name}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              <p className="text-text whitespace-pre-wrap">{email.body}</p>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-lg font-medium text-text mb-4">Activity Timeline</h2>
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`mt-0.5 p-1.5 rounded-full ${event.done ? 'bg-accent/20' : 'bg-surface-hover'}`}>
                    <event.icon size={14} className={event.done ? 'text-accent' : 'text-text-subtle'} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${event.done ? 'text-text' : 'text-text-subtle'}`}>
                      {event.label}
                      {event.label === 'Open detected' && event.done && ' ✓'}
                      {event.label === 'Clicked' && event.done && ' ✓'}
                      {event.label === 'Reply' && event.done && ' ✓'}
                    </p>
                    {event.time && (
                      <p className="text-sm text-text-muted">{event.time}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Summary */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">Status</h3>
            <div className="space-y-2">
              {getStatusSummary().map((status, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-accent" />
                  <span className="text-text">{status.label} ✓</span>
                </div>
              ))}
              {getStatusSummary().length === 0 && (
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-text-subtle" />
                  <span className="text-text-subtle">Pending</span>
                </div>
              )}
            </div>
          </div>

          {/* Current Status */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">Current Status</h3>
            <span className={`inline-flex px-3 py-1.5 text-sm font-medium rounded-full ${
              email.status === 'replied' ? 'bg-accent/20 text-accent' :
              email.status === 'clicked' ? 'bg-purple-500/20 text-purple-400' :
              email.status === 'open_detected' ? 'bg-yellow-500/20 text-yellow-400' :
              email.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
              email.status === 'sent' ? 'bg-blue-500/20 text-blue-400' :
              email.status === 'pending_review' ? 'bg-yellow-500/20 text-yellow-400' :
              email.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {email.status.replace('_', ' ')}
            </span>
          </div>

          {/* Lead Info */}
          {lead && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">Lead Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-text-muted">Business</p>
                  <p className="text-text">{lead.business}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Category</p>
                  <p className="text-text">{lead.category}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Location</p>
                  <p className="text-text">{lead.location}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
