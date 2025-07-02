'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api, Company } from '@/lib/api';
import Link from 'next/link';

export default function CompanyDetailPage() {
  const params = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCompany = async () => {
      try {
        const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
        if (!id) throw new Error('Invalid company ID');

        const data = await api.getCompany(id);
        setCompany(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load company');
      } finally {
        setLoading(false);
      }
    };

    loadCompany();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4 pt-20">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Company Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'Could not retrieve company details.'}</p>
          <Link href="/companies" className="text-blue-600 hover:underline">← Back to Companies</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-8 border-b border-gray-200 flex items-start space-x-6">
            <div className="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {(company.name || '').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              <div className="text-sm text-gray-600 flex gap-3 mt-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {company.industry}
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">About</h2>
              <p className="text-gray-700">{company.description || 'No description provided.'}</p>
            </div>

            <Link
              href="/tenders"
              className="block text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              View Tenders →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
