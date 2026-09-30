import { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  Bot,
  Mail,
  Search,
  Key,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

const TABS = ['general', 'ai', 'email', 'notifications', 'activation', 'integrations'];

export default function Settings() {
  useStore((state) => state.isActivated); // Keep for persistence
  const [activeTab, setActiveTab] = useState('general');
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [telegramDelivered, setTelegramDelivered] = useState(true);
  const [telegramOpened, setTelegramOpened] = useState(true);
  const [telegramClicked, setTelegramClicked] = useState(true);
  const [telegramReplied, setTelegramReplied] = useState(true);
  const [telegramBounce, setTelegramBounce] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text">Settings</h1>
        <p className="text-text-muted">Manage your application settings and integrations.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-accent text-black'
                : 'text-text-muted hover:text-text hover:bg-surface'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-w-2xl">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-medium text-text mb-4">General Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="text-text">Dark Mode</p>
                    <p className="text-sm text-text-muted">Use dark theme for the interface</p>
                  </div>
                  <div className="w-12 h-6 bg-accent rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-text">Language</p>
                    <p className="text-sm text-text-muted">Select your preferred language</p>
                  </div>
                  <select className="px-3 py-1.5 bg-background border border-border rounded-lg text-text text-sm">
                    <option>English</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-medium text-text mb-4">AI Provider</h2>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded-lg">
                    <Bot size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-text">OpenRouter</p>
                    <p className="text-sm text-text-muted">AI personalization and email generation</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-accent">
                  <CheckCircle size={16} />
                  <span className="text-sm">Connected</span>
                </div>
              </div>
              <p className="text-xs text-text-subtle mt-4">
                AI provider credentials will be configured by the application administrator.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-medium text-text mb-4">Email Provider</h2>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded-lg">
                    <Mail size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-text">Resend</p>
                    <p className="text-sm text-text-muted">Email delivery service</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-accent">
                  <CheckCircle size={16} />
                  <span className="text-sm">Connected</span>
                </div>
              </div>
              <p className="text-xs text-text-subtle mt-4">
                Email provider credentials will be configured by the application administrator.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-medium text-text mb-4">External Notifications</h2>

              {/* Telegram */}
              <div className="py-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg">
                      <ExternalLink size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-text">Telegram</p>
                      <p className="text-sm text-text-muted">
                        {telegramConnected ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTelegramConnected(!telegramConnected)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      telegramConnected
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-accent text-black hover:bg-accent-hover'
                    }`}
                  >
                    {telegramConnected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>

                {telegramConnected && (
                  <div className="space-y-2 pl-11">
                    <p className="text-xs text-text-muted mb-2">Notify on:</p>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={telegramDelivered}
                        onChange={(e) => setTelegramDelivered(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                      />
                      <span className="text-text">Delivered</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={telegramOpened}
                        onChange={(e) => setTelegramOpened(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                      />
                      <span className="text-text">Open detected</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={telegramClicked}
                        onChange={(e) => setTelegramClicked(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                      />
                      <span className="text-text">Link clicked</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={telegramReplied}
                        onChange={(e) => setTelegramReplied(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                      />
                      <span className="text-text">Reply received</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={telegramBounce}
                        onChange={(e) => setTelegramBounce(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                      />
                      <span className="text-text">Bounce</span>
                    </label>
                  </div>
                )}
              </div>

              {/* WhatsApp */}
              <div className="py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg">
                      <ExternalLink size={20} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-text">WhatsApp</p>
                      <p className="text-sm text-text-muted">
                        {whatsappConnected ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setWhatsappConnected(!whatsappConnected)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      whatsappConnected
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-accent text-black hover:bg-accent-hover'
                    }`}
                  >
                    {whatsappConnected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>

              {/* TikTok */}
              <div className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg">
                      <ExternalLink size={20} className="text-text-subtle" />
                    </div>
                    <div>
                      <p className="text-text">TikTok</p>
                      <p className="text-sm text-text-subtle">Unavailable / Coming later</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activation' && (
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-medium text-text mb-4">Activation</h2>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <Key size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-text">License Status</p>
                    <p className="text-sm text-text-muted">Your application activation status</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-accent">
                  <CheckCircle size={16} />
                  <span className="text-sm font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-medium text-text mb-4">Integrations</h2>

              <div className="space-y-4">
                {/* Lead Search */}
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg">
                      <Search size={20} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-text">Lead Search</p>
                      <p className="text-sm text-text-muted">Serper API for lead discovery</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-accent">
                    <CheckCircle size={16} />
                    <span className="text-sm">Connected</span>
                  </div>
                </div>

                {/* OpenRouter */}
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg">
                      <Bot size={20} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-text">AI Provider</p>
                      <p className="text-sm text-text-muted">OpenRouter for AI personalization</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-accent">
                    <CheckCircle size={16} />
                    <span className="text-sm">Connected</span>
                  </div>
                </div>

                {/* Resend */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg">
                      <Mail size={20} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-text">Email Provider</p>
                      <p className="text-sm text-text-muted">Resend for email delivery</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-accent">
                    <CheckCircle size={16} />
                    <span className="text-sm">Connected</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-text-subtle mt-4">
                Integration credentials will be configured by the application administrator.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
