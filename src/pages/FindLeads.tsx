import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Plus, X, Check, Globe, Mail, MapPin, Loader } from 'lucide-react';

interface SearchResult {
  id: string;
  business: string;
  category: string;
  location: string;
  email: string;
  website: string;
}

export default function FindLeads() {
  const navigate = useNavigate();
  const { categories, addLeads } = useStore();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [numLeads, setNumLeads] = useState('50');
  const [keyword, setKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleSearch = async () => {
    if (selectedCategories.length === 0) return;

    setIsSearching(true);
    setShowResults(true);

    // Simulate search delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate mock results based on selected categories
    const mockResults = [];
    const numResults = Math.min(parseInt(numLeads) || 50, 20);

    for (let i = 0; i < numResults; i++) {
      const category = selectedCategories[Math.floor(Math.random() * selectedCategories.length)];
      const businessNames = [
        'Royal Stitch', 'Bella Couture', 'Prime Fashion', 'Urban Thread',
        'Lagos Grille', 'Benin Palace', 'Glow Beauty', 'FitLife Gym',
        'Tech Hub', 'Digital Studio', 'Creative Agency', 'Modern Design',
        'Fashion House', 'Style Studio', 'Beauty Bar', 'Wellness Center',
        'Food Court', 'Cafe Luxe', 'Bistro Plus', 'Gourmet Kitchen',
      ];
      mockResults.push({
        id: `search-${Date.now()}-${i}`,
        business: `${businessNames[i % businessNames.length]} ${i > 0 ? i + 1 : ''}`.trim(),
        category,
        location: location || 'Benin City',
        email: i % 3 === 0 ? '' : `hello@${businessNames[i % businessNames.length].toLowerCase().replace(/\s+/g, '')}.com`,
        website: `${businessNames[i % businessNames.length].toLowerCase().replace(/\s+/g, '')}.com`,
      });
    }

    setSearchResults(mockResults);
    setSelectedResults(mockResults.map((r) => r.id));
    setIsSearching(false);
  };

  const handleSelectAll = () => {
    if (selectedResults.length === searchResults.length) {
      setSelectedResults([]);
    } else {
      setSelectedResults(searchResults.map((r) => r.id));
    }
  };

  const handleSaveSelected = () => {
    const leadsToSave = searchResults
      .filter((r) => selectedResults.includes(r.id))
      .map((r) => ({
        id: r.id,
        business: r.business,
        email: r.email,
        category: r.category,
        location: r.location,
        website: r.website,
        status: 'new' as const,
        lastActivity: 'Never contacted',
        createdAt: new Date().toISOString(),
      }));

    addLeads(leadsToSave);
    navigate('/leads');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text">Find Leads</h1>
        <p className="text-text-muted">Discover businesses based on the categories and location you choose.</p>
      </div>

      {!showResults ? (
        /* Search Form */
        <div className="bg-surface border border-border rounded-xl p-6 space-y-6 max-w-2xl">
          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">Business Categories</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedCategories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent-muted text-accent rounded-full text-sm"
                >
                  {cat}
                  <button
                    onClick={() => handleCategoryToggle(cat)}
                    className="hover:text-accent-hover"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <button
              onClick={() => setShowCategorySelector(true)}
              className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg text-text-muted hover:text-text hover:border-accent-muted transition-colors"
            >
              <Plus size={16} />
              Add Category
            </button>
          </div>

          {/* Category Selector Modal */}
          {showCategorySelector && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-surface border border-border rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-medium text-text">Business Categories</h3>
                  <button onClick={() => setShowCategorySelector(false)}>
                    <X size={20} className="text-text-muted hover:text-text" />
                  </button>
                </div>
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                  <input
                    type="text"
                    placeholder="Search categories..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text placeholder-text-subtle mb-4 focus:outline-none focus:border-accent"
                  />
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          handleCategoryToggle(cat.name);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors text-left"
                      >
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center ${
                            selectedCategories.includes(cat.name)
                              ? 'bg-accent border-accent'
                              : 'border-border'
                          }`}
                        >
                          {selectedCategories.includes(cat.name) && (
                            <Check size={14} className="text-black" />
                          )}
                        </div>
                        <span className="text-text">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-4 border-t border-border">
                  <button
                    onClick={() => setShowCategorySelector(false)}
                    className="w-full px-4 py-2 bg-accent hover:bg-accent-hover text-black font-medium rounded-lg transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Benin City"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text placeholder-text-subtle focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Number of Leads */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">Number of Leads</label>
            <input
              type="number"
              value={numLeads}
              onChange={(e) => setNumLeads(e.target.value)}
              min="1"
              max="500"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text placeholder-text-subtle focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Keyword */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">Additional keywords (optional)</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter keywords..."
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text placeholder-text-subtle focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={selectedCategories.length === 0}
            className="w-full px-4 py-3 bg-accent hover:bg-accent-hover disabled:bg-accent-muted disabled:cursor-not-allowed text-black font-medium rounded-lg transition-colors"
          >
            Find Businesses
          </button>
        </div>
      ) : (
        /* Search Results */
        <div className="space-y-4">
          {isSearching ? (
            <div className="bg-surface border border-border rounded-xl p-12 text-center">
              <Loader size={32} className="animate-spin mx-auto text-accent mb-4" />
              <p className="text-text font-medium">Finding businesses...</p>
              <p className="text-text-muted text-sm mt-1">Searching relevant businesses</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-text">
                  Search Results — {searchResults.length} businesses found
                </h2>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-accent hover:text-accent-hover transition-colors"
                >
                  {selectedResults.length === searchResults.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="bg-surface border border-border rounded-xl divide-y divide-border">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-start gap-4 p-4 hover:bg-surface-hover transition-colors"
                  >
                    <button
                      onClick={() => {
                        setSelectedResults((prev) =>
                          prev.includes(result.id)
                            ? prev.filter((id) => id !== result.id)
                            : [...prev, result.id]
                        );
                      }}
                      className={`mt-1 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                        selectedResults.includes(result.id)
                          ? 'bg-accent border-accent'
                          : 'border-border hover:border-accent-muted'
                      }`}
                    >
                      {selectedResults.includes(result.id) && (
                        <Check size={14} className="text-black" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-text">{result.business}</p>
                          <p className="text-sm text-text-muted">{result.category}</p>
                          <p className="text-sm text-text-muted flex items-center gap-1 mt-1">
                            <MapPin size={14} />
                            {result.location}
                          </p>
                        </div>
                        <div className="text-right">
                          {result.email ? (
                            <p className="text-sm text-accent flex items-center gap-1 justify-end">
                              <Mail size={14} />
                              {result.email}
                            </p>
                          ) : (
                            <p className="text-sm text-text-subtle">Email not found</p>
                          )}
                          {result.website && (
                            <p className="text-sm text-text-muted flex items-center gap-1 justify-end mt-1">
                              <Globe size={14} />
                              {result.website}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowResults(false)}
                  className="flex-1 px-4 py-3 bg-surface border border-border rounded-lg text-text hover:border-accent-muted transition-colors"
                >
                  Back to Search
                </button>
                <button
                  onClick={handleSaveSelected}
                  disabled={selectedResults.length === 0}
                  className="flex-1 px-4 py-3 bg-accent hover:bg-accent-hover disabled:bg-accent-muted disabled:cursor-not-allowed text-black font-medium rounded-lg transition-colors"
                >
                  Save {selectedResults.length} Selected Leads
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
