import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  ArrowLeft,
  Edit,
  RefreshCw,
  X,
  Check,
  CheckCheck,
  Send,
  Loader,
  AlertCircle,
} from 'lucide-react';

export default function ReviewEmails() {
  const navigate = useNavigate();
  const { generatedEmails, leads, approveEmail, rejectEmail, approveAllReviewed, updateEmail } = useStore();
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showConfirmSend, setShowConfirmSend] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const pendingEmails = generatedEmails.filter((e) => e.status === 'pending_review');
  const approvedEmails = generatedEmails.filter((e) => e.status === 'approved');
  const rejectedEmails = generatedEmails.filter((e) => e.status === 'rejected');
  const reviewedCount = approvedEmails.length + rejectedEmails.length;

  const selectedEmail = selectedEmailId
    ? generatedEmails.find((e) => e.id === selectedEmailId)
    : generatedEmails[0];

  const selectedLead = selectedEmail
    ? leads.find((l) => l.id === selectedEmail.leadId)
    : null;

  const handleEdit = () => {
    if (selectedEmail) {
      setEditBody(selectedEmail.body);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (selectedEmail) {
      updateEmail(selectedEmail.id, { body: editBody });
      setIsEditing(false);
    }
  };

  const handleRegenerate = async () => {
    if (!selectedEmail) return;
    setIsRegenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const newBody = `Hi ${selectedLead?.business} team,

I came across your ${selectedLead?.category?.toLowerCase()} business and thought there might be an exciting opportunity to collaborate on a digital marketing campaign that could help expand your reach.

Would love to connect and discuss further.

Best regards`;
    updateEmail(selectedEmail.id, { body: newBody });
    setIsRegenerating(false);
  };

  const handleSend = async () => {
    setShowConfirmSend(false);
    setIsSending(true);

    const approved = approvedEmails.length;
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 5) + 1;
      if (progress >= approved) {
        progress = approved;
        clearInterval(interval);
        setSendProgress(approved);
        setTimeout(() => {
          setIsSending(false);
          setIsComplete(true);
          approvedEmails.forEach((email) => {
            updateEmail(email.id, {
              status: 'sent',
              sentAt: new Date().toISOString(),
            });
          });
        }, 1000);
      }
      setSendProgress(progress);
    }, 200);
  };

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="flex justify-center mb-4">
          <Check size={48} className="text-accent" />
        </div>
        <h2 className="text-2xl font-semibold text-text mb-2">Campaign sent successfully</h2>
        <p className="text-text-muted mb-6">
          {approvedEmails.length} emails have been queued for delivery.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/campaigns"
            className="px-6 py-3 bg-surface border border-border rounded-lg text-text hover:border-accent-muted transition-colors"
          >
            View Campaigns
          </Link>
          <Link
            to="/activity"
            className="px-6 py-3 bg-accent hover:bg-accent-hover text-black font-medium rounded-lg transition-colors"
          >
            View Activity
          </Link>
        </div>
      </div>
    );
  }

  if (isSending) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Loader size={32} className="animate-spin mx-auto text-accent mb-4" />
        <h2 className="text-xl font-semibold text-text mb-2">Sending emails...</h2>
        <p className="text-text-muted mb-4">
          {sendProgress} / {approvedEmails.length}
        </p>
        <div className="w-64 h-2 bg-background rounded-full overflow-hidden mx-auto">
          <div
            className="h-full bg-accent transition-all duration-200"
            style={{ width: `${(sendProgress / approvedEmails.length) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  if (showConfirmSend) {
    return (
      <div className="max-w-md mx-auto bg-surface border border-border rounded-xl p-6 mt-12">
        <div className="text-center mb-6">
          <AlertCircle size={32} className="mx-auto text-yellow-400 mb-3" />
          <h2 className="text-xl font-semibold text-text">Ready to send?</h2>
          <p className="text-text-muted mt-2">
            {approvedEmails.length} approved emails will be sent.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowConfirmSend(false)}
            className="flex-1 px-4 py-3 bg-surface border border-border rounded-lg text-text hover:border-accent-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="flex-1 px-4 py-3 bg-accent hover:bg-accent-hover text-black font-medium rounded-lg transition-colors"
          >
            Send {approvedEmails.length} Emails
          </button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-semibold text-text">Review Emails</h1>
          <p className="text-text-muted">Review AI-generated emails before anything is sent.</p>
        </div>
        {approvedEmails.length > 0 && (
          <button
            onClick={() => setShowConfirmSend(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-black font-medium rounded-lg transition-colors"
          >
            <Send size={18} />
            Send Approved
          </button>
        )}
      </div>

      {/* Review Progress */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-muted">
            {reviewedCount} / {generatedEmails.length} reviewed
          </span>
          <span className="text-sm text-text">
            {approvedEmails.length} approved, {rejectedEmails.length} rejected
          </span>
        </div>
        <div className="w-full h-2 bg-background rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${(reviewedCount / generatedEmails.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop Layout: Lead List + Email Preview */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
        {/* Lead List */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-medium text-text">Emails</h3>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {generatedEmails.map((email) => {
              const lead = leads.find((l) => l.id === email.leadId);
              return (
                <button
                  key={email.id}
                  onClick={() => {
                    setSelectedEmailId(email.id);
                    setIsEditing(false);
                  }}
                  className={`w-full text-left p-4 border-b border-border last:border-b-0 hover:bg-surface-hover transition-colors ${
                    selectedEmail?.id === email.id ? 'bg-surface-hover' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-text">{lead?.business}</span>
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      email.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      email.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {email.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted truncate">{email.subject}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Email Preview */}
        <div className="col-span-2 bg-surface border border-border rounded-xl overflow-hidden">
          {selectedEmail && selectedLead ? (
            <>
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-text-muted">To:</span>
                  <span className="text-text">{selectedEmail.to}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-text-muted">Subject:</span>
                  <span className="text-text">{selectedEmail.subject}</span>
                </div>
              </div>

              <div className="p-6 max-h-[40vh] overflow-y-auto">
                {isEditing ? (
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-accent transition-colors resize-none"
                  />
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-text whitespace-pre-wrap">{selectedEmail.body}</p>
                  </div>
                )}

                {selectedEmail.personalizationSummary && (
                  <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                    <p className="text-xs text-accent font-medium mb-1">AI Personalization</p>
                    <p className="text-sm text-text-muted">{selectedEmail.personalizationSummary}</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 bg-surface border border-border rounded-lg text-text hover:border-accent-muted transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-2 bg-accent hover:bg-accent-hover text-black font-medium rounded-lg transition-colors"
                        >
                          Save
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleEdit}
                          className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-text hover:border-accent-muted transition-colors"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={handleRegenerate}
                          disabled={isRegenerating}
                          className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-text hover:border-accent-muted transition-colors disabled:opacity-50"
                        >
                          <RefreshCw size={16} className={isRegenerating ? 'animate-spin' : ''} />
                          Regenerate
                        </button>
                      </>
                    )}
                  </div>

                  {selectedEmail.status === 'pending_review' && !isEditing && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => rejectEmail(selectedEmail.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <X size={16} />
                        Reject
                      </button>
                      <button
                        onClick={() => approveEmail(selectedEmail.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-black font-medium rounded-lg transition-colors"
                      >
                        <Check size={16} />
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-text-muted">
              No email selected
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden space-y-4">
        {generatedEmails.map((email) => {
          const lead = leads.find((l) => l.id === email.leadId);
          return (
            <div key={email.id} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-text">{lead?.business}</span>
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                  email.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                  email.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {email.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-text-muted mb-3">{email.subject}</p>
              <p className="text-sm text-text whitespace-pre-wrap mb-4 line-clamp-4">{email.body}</p>

              {email.status === 'pending_review' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => rejectEmail(email.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <X size={16} />
                    Reject
                  </button>
                  <button
                    onClick={() => approveEmail(email.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-accent hover:bg-accent-hover text-black font-medium rounded-lg transition-colors"
                  >
                    <Check size={16} />
                    Approve
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {approvedEmails.length > 0 && (
          <button
            onClick={() => setShowConfirmSend(true)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-black font-medium rounded-lg transition-colors"
          >
            <Send size={18} />
            Send {approvedEmails.length} Approved Emails
          </button>
        )}
      </div>

      {/* Approve All Button */}
      {pendingEmails.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={approveAllReviewed}
            className="flex items-center gap-2 px-6 py-3 bg-surface border border-border rounded-lg text-text hover:border-accent-muted transition-colors"
          >
            <CheckCheck size={18} />
            Approve All Reviewed
          </button>
        </div>
      )}
    </div>
  );
}
