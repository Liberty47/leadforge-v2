import { z } from 'zod';

interface SearchParams {
  categories: string[];
  location: string;
  limit: number;
  additionalKeywords?: string;
}

interface SearchResult {
  businessName: string;
  website: string | null;
  description: string | null;
  location: string;
  source: string;
  sourceUrl: string;
  email?: string | null;
  phone?: string | null;
}

// Mock results for demo mode
function mockSearch(params: SearchParams): SearchResult[] {
  const results: SearchResult[] = [];
  const { categories, location, limit } = params;

  categories.forEach(category => {
    for (let i = 0; i < Math.min(3, limit); i++) {
      results.push({
        businessName: `${category} Business ${i + 1}`,
        website: `https://business${i + 1}.com`,
        description: `A ${category.toLowerCase()} business in ${location}`,
        location,
        source: 'google',
        sourceUrl: `https://google.com/search?q=${encodeURIComponent(category + ' ' + location)}`,
        email: null,
        phone: null,
      });
    }
  });

  return results.slice(0, limit);
}

// Real Serper integration
async function serperSearch(params: SearchParams): Promise<SearchResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    console.warn('SERPER_API_KEY not configured, using mock data');
    return mockSearch(params);
  }

  const results: SearchResult[] = [];
  const { categories, location, limit, additionalKeywords } = params;

  for (const category of categories) {
    const queries = [
      `${category} in ${location}`,
      `${category} ${location}`,
      `${category} brands ${location}`,
    ];

    if (additionalKeywords) {
      queries.push(`${category} ${additionalKeywords} ${location}`);
    }

    for (const query of queries.slice(0, 2)) {
      try {
        const response = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: query,
            num: Math.ceil(limit / categories.length / 2),
          }),
        });

        if (!response.ok) {
          console.error('Serper API error:', response.status);
          continue;
        }

        const data = await response.json();
        const items = data.organic || [];

        for (const item of items) {
          results.push({
            businessName: item.title,
            website: item.link,
            description: item.snippet,
            location,
            source: 'google',
            sourceUrl: item.link,
            email: null, // Serper doesn't provide emails
            phone: null,
          });
        }
      } catch (err) {
        console.error('Serper search error:', err);
      }
    }
  }

  // Deduplicate by website
  const seen = new Set<string>();
  return results.filter(r => {
    if (!r.website || seen.has(r.website)) return false;
    seen.add(r.website);
    return true;
  }).slice(0, limit);
}

export async function searchLeads(params: SearchParams): Promise<SearchResult[]> {
  // Use mock if no API key
  if (!process.env.SERPER_API_KEY) {
    console.log('Using mock lead search');
    return mockSearch(params);
  }

  try {
    return await serperSearch(params);
  } catch (err) {
    console.error('Search failed, falling back to mock:', err);
    return mockSearch(params);
  }
}
