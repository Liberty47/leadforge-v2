import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowLeft, ArrowRight, Check, Plus, X, Loader } from 'lucide-react';

const STEPS = ['Campaign', 'Select Leads', 'Write Email', 'AI Personalization', 'Generate'];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { categories, leads, createCampaign, generateEmails, setCurrentCampaignId } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location: '',
    emailSubject: 'A quick idea for your business',
    emailBody: `Hi,

I came across your business and thought there might be an opportunity to collaborate. Would love to connect.

Best regards`,
    aiPersonalization: 'balanced' as 'light' | 'balanced' | 'deep',
  });

  const filteredLeads = leads.filter((lead) => {
    if (formData.category && lead.category !== formData.category) return false;
    if (formData.location && lead.location !== formData.location) return false;
    return true;
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    const campaignId = await createCampaign({
      name: formData.name,
      category: formData.category,
      location: formData.location,
      leads: selectedLeads,
      status: 'generating',
      emailTemplate: {
        subject: formData.emailSubject,
        body: formData.emailBody,
      },
      aiPersonalization: formData.aiPersonalization,
    });

    setCurrentCampaignId(campaignId);
    setCurrentStep(4);

    // Simulate generation
    setTimeout(() => {
      generateEmails(campaignId);
      navigate('/review');
    }, 3000);
  };

  const wordCount = formData.emailBody.split(/\s+/).filter(Boolean).length;
  const charCount = formData.emailBody.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/campaigns')}
          className="p-2 text-text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-text">Create Campaign</h1>
          <p className="text-text-muted">Build your outreach campaign step by step.</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                index < currentStep
                  ? 'bg-accent text-black'
                  : index === currentStep
                  ? 'bg-accent text-black'
                  : 'bg-surface border border-border text-text-muted'
              }`}
            >
              {index < currentStep ? <Check size={16} /> : index + 1}
            </div>
            <span className={`ml-2 text-sm hidden sm:inline ${index <= currentStep ? 'text-text' : 'text-text-muted'}`}>
              {step}
            </span>
            {index < STEPS.length - 1 && (
              <div className={`w-8 sm:w-16 h-0.5 mx-2 ${index < currentStep ? 'bg-accent' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-surface border border-border rounded-xl p-6">
        {currentStep === 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-text">Campaign Details</h2>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Campaign Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Benin Fashion Outreach"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text placeholder-text-subtle focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Category</label>
                <button
                  onClick={() => setShowCategorySelector(true)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-background border border-border rounded-lg text-text hover:border-accent-muted transition-colors"
                >
                  <span>{formData.category || 'Select category'}</span>
                  <Plus size={16} />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Benin City"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text placeholder-text-subtle focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-text">Select Leads</h2>
              <div className="text-sm text-text-muted">
                {selectedLeads.length} leads selected
              </div>
            </div>

            {formData.category && (
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 bg-accent-muted text-accent rounded-full">{formData.category}</span>
                {formData.location && <span className="px-3 py-1 bg-surface border border-border rounded-full">{formData.location}</span>}
              </div>
            )}

            <div className="border border-border rounded-lg overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                {filteredLeads.length === 0 ? (
                  <div className="p-8 text-center text-text-muted">
                    No leads match your criteria
                  </div>
                ) : (
                  filteredLeads.map((lead) => (
                    <label
                      key={lead.id}
                      className="flex items-center gap-3 p-3 hover:bg-surface-hover transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeads([...selectedLeads, lead.id]);
                          } else {
                            setSelectedLeads(selectedLeads.filter((id) => id !== lead.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text truncate">{lead.business}</p>
                        <p className="text-sm text-text-muted">{lead.email || 'No email'}</p>
                      </div>
                      <span className="text-xs text-text-subtle">{lead.location}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {filteredLeads.length > 0 && (
              <button
                onClick={() => setSelectedLeads(filteredLeads.map((l) => l.id))}
                className="text-sm text-accent hover:text-accent-hover transition-colors"
              >
                Select All ({filteredLeads.length})
              </button>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-text">Write Your Email</h2>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Subject Line</label>
              <input
                type="text"
                value={formData.emailSubject}
                onChange={(e) => setFormData({ ...formData, emailSubject: e.target.value })}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Email Body</label>
              <textarea
                value={formData.emailBody}
                onChange={(e) => setFormData({ ...formData, emailBody: e.target.value })}
                rows={10}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-accent transition-colors resize-none"
              />
              <div className="flex gap-4 mt-2 text-xs text-text-muted">
                <span>Words: {wordCount}</span>
                <span>Characters: {charCount}</span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-text">AI Personalization</h2>
            <p className="text-text-muted">
              Your base email will be adapted for each business using the information available for that lead.
            </p>

            <div className="space-y-3">
              {[
                { value: 'light', label: 'Light', description: 'Minimal changes' },
                { value: 'balanced', label: 'Balanced', description: 'Natural personalization' },
                { value: 'deep', label: 'Deep', description: 'More detailed personalization' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.aiPersonalization === option.value
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent-muted'
                  }`}
                >
                  <input
                    type="radio"
                    name="personalization"
                    value={option.value}
                    checked={formData.aiPersonalization === option.value}
                    onChange={(e) => setFormData({ ...formData, aiPersonalization: e.target.value as 'light' | 'balanced' | 'deep' })}
                    className="w-4 h-4 text-accent focus:ring-accent"
                  />
                  <div>
                    <p className="font-medium text-text">{option.label}</p>
                    <p className="text-sm text-text-muted">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="p-4 bg-background border border-border rounded-lg">
              <p className="text-xs text-text-muted">
                <span className="text-accent">Note:</span> AI will not invent business information.
              </p>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="text-center py-12">
            <Loader size={32} className="animate-spin mx-auto text-accent mb-4" />
            <p className="text-text font-medium">Generating personalized emails</p>
            <p className="text-text-muted text-sm mt-1">
              {selectedLeads.length} / {selectedLeads.length} completed
            </p>
            <div className="w-48 h-2 bg-background rounded-full mt-4 mx-auto overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 bg-surface border border-border rounded-lg text-text hover:border-accent-muted transition-colors"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          )}
          <div className="flex-1" />
          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 0 && !formData.name) ||
                (currentStep === 1 && selectedLeads.length === 0)
              }
              className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover disabled:bg-accent-muted disabled:cursor-not-allowed text-black font-medium rounded-lg transition-colors"
            >
              Continue
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-black font-medium rounded-lg transition-colors"
            >
              Generate Personalized Emails
            </button>
          )}
        </div>
      )}

      {/* Category Selector Modal */}
      {showCategorySelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface border border-border rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-medium text-text">Select Category</h3>
              <button onClick={() => setShowCategorySelector(false)}>
                <X size={20} className="text-text-muted hover:text-text" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setFormData({ ...formData, category: cat.name });
                      setShowCategorySelector(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors text-text"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
