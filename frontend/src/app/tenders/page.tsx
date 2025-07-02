'use client';
import { useState, useEffect } from 'react';
import TenderCard from '../../components/TenderCard';
import SearchBar from '../../components/SearchBar';
import { api, Tender } from '../../lib/api';

export default function TendersPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [searchResults, setSearchResults] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { tenders } = await api.getTenders();
        setTenders(tenders);
        setSearchResults(tenders);
      } catch {
        setError('Failed to load tenders');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = (query: string, filters?: Record<string, string>) => {
    let results = tenders;
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
      );
    }
    if (filters?.category && filters.category !== 'all') {
      results = results.filter(t => t.category === filters.category);
    }
    if (filters?.status && filters.status !== 'all') {
      results = results.filter(t => t.status === filters.status);
    }
    setSearchResults(results);
  };

  const filters = [
    {
      name: 'category',
      label: 'Category',
      options: [
        { value: 'all', label: 'All' },
        { value: 'construction', label: 'Construction' },
        { value: 'technology', label: 'Technology' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'education', label: 'Education' },
        { value: 'transportation', label: 'Transportation' },
        { value: 'services', label: 'Services' },
        { value: 'supplies', label: 'Supplies' }
      ]
    },
    {
      name: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All' },
        { value: 'open', label: 'Open' },
        { value: 'active', label: 'Active' },
        { value: 'closed', label: 'Closed' },
        { value: 'draft', label: 'Draft' }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <p className="text-gray-500">Loading tenders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 pt-20 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Tenders</h1>

      <SearchBar
        onSearch={handleSearch}
        placeholder="Search by title, description, category..."
        filters={filters}
      />

      {error && <p className="text-red-600 mt-4">{error}</p>}

      <p className="text-gray-600 mt-4 mb-6">
        Showing {searchResults.length} of {tenders.length} tenders
      </p>

      {searchResults.length === 0 ? (
        <div className="text-center mt-12 text-gray-500">No matching tenders found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map(tender => (
            <TenderCard key={tender._id} {...tender} />
          ))}
        </div>
      )}
    </div>
  );
}
