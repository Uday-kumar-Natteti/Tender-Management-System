'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Company, Tender } from '../../lib/api';
import { isAuthenticated } from '../../lib/auth';
import CompanyCard from '../../components/CompanyCard';
import TenderCard from '../../components/TenderCard';

export default function DashboardPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated()) {
      setAuthenticated(true);
      const fetchData = async () => {
        try {
          const userCompanies = await api.getCompanies();
          const userTenders = await api.getTenders();
          setCompanies(userCompanies);
          setTenders(userTenders.tenders);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setAuthenticated(false);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="text-center pt-20">Loading dashboard...</div>;
  }

  if (!authenticated) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">You're not signed in</h1>
        <p className="text-gray-600 mb-6">Please sign in to view your dashboard.</p>
        <div className="flex justify-center gap-4">
          <Link href="/login" className="btn btn-secondary">Sign In</Link>
          <Link href="/register" className="btn btn-primary">Register</Link>
        </div>
      </div>
    </div>
  );
}


  return (
    <div className="min-h-screen pt-20 px-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Companies</h2>
          <Link href="/companies" className="btn btn-primary">Browse</Link>
        </div>
        {companies.length === 0 ? (
          <p className="text-gray-600">No companies found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companies.map((company) => (
              <CompanyCard key={company._id} company={company} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Tenders</h2>
        </div>
        {tenders.length === 0 ? (
          <p className="text-gray-600">No tenders posted yet.</p>
        ) : (
          <div className="space-y-4">
            {tenders.map((tender) => (
              <TenderCard key={tender._id} {...tender} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
