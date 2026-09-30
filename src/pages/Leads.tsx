import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Plus, Filter, ChevronDown, Search } from 'lucide-react';

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

export default function Leads() {
  const leads = useStore((state) => state.leads);
  const categories = useStore((state) => state.categories);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const locations = [...new Set(leads.map((l) => l.location))];
  const statuses = ['new', 'approved', 'rejected', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'failed'];

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !searchQuery ||
      lead.business.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.website.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || lead.category === selectedCategory;
    const matchesLocation = !selectedLocation || lead.location === selectedLocation;
    const matchesStatus = !selectedStatus || lead.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Leads</h1>
          <p className="text-text-muted">Find and manage your business prospects.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/find-leads"
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-black font-medium rounded-lg transition-colors"
          >
            <Plus size={18} />
            Find Leads
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              type="text"
              placeholder="Search businesses, emails, websites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder-text-subtle focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-lg text-text hover:border-accent-muted transition-colors"
          >
            <Filter size={18} />
            Filters
            <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 p-4 bg-surface border border-border rounded-lg">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-text text-sm focus:outline-none focus:border-accent"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-text text-sm focus:outline-none focus:border-accent"
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-text text-sm focus:outline-none focus:border-accent"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
            {(selectedCategory || selectedLocation || selectedStatus) && (
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedLocation('');
                  setSelectedStatus('');
                }}
                className="px-3 py-2 text-sm text-text-muted hover:text-text transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Leads Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide">Business</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide hidden sm:table-cell">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide hidden lg:table-cell">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide hidden lg:table-cell">Website</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide hidden xl:table-cell">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                    No leads found
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-surface-hover transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link to={`/leads/${lead.id}`} className="font-medium text-text hover:text-accent transition-colors">
                        {lead.business}
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {lead.email ? (
                        <a href={`mailto:${lead.email}`} className="text-text-muted hover:text-accent transition-colors">
                          {lead.email}
                        </a>
                      ) : (
                        <span className="text-text-subtle text-sm">No email</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-text-muted text-sm">{lead.category}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-text-muted text-sm">{lead.location}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {lead.website ? (
                        <a href={`https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-accent transition-colors">
                          {lead.website}
                        </a>
                      ) : (
                        <span className="text-text-subtle text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[lead.status] || 'bg-gray-500/20 text-gray-400'}`}>
                        {lead.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <span className="text-text-muted text-sm">{lead.lastActivity}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
