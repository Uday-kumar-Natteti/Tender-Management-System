'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, Tender } from '../../../lib/api';
import { isAuthenticated } from '../../../lib/auth';

export default function TenderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tender, setTender] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const tender = await api.getTender(params.id as string);
        setTender(tender);
      } catch {
        setError('Failed to load tender');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  const handleApply = async () => {
    if (!isAuthenticated()) return router.push('/login');
    setApplying(true);
    try {
      await api.createApplication(tender!._id, {
        proposal: 'Interested in this tender.',
        quotedPrice: tender?.budget || 0,
      });
      setApplied(true);
    } catch {
      setError('Application failed');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error || !tender) return <div className="p-8 text-center text-red-500">{error || 'Tender not found'}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{tender.title}</h1>
            <p className="text-gray-600">{tender.category}</p>
            <p className="text-sm text-gray-500">{new Date(tender.deadline).toLocaleDateString()}</p>
          </div>
          <div>
            {applied ? (
              <span className="text-green-600 font-semibold">Application Submitted</span>
            ) : (
              <button
                onClick={handleApply}
                disabled={applying || tender.status === 'closed'}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
              >
                {applying ? 'Applying...' : 'Apply'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p><strong>Budget:</strong> ₹{tender.budget}</p>
          <p><strong>Status:</strong> {tender.status}</p>
          <p className="text-gray-700 whitespace-pre-line">{tender.description}</p>
          {tender.requirements && <p><strong>Requirements:</strong> {tender.requirements}</p>}
        </div>
      </div>
    </div>
  );
}
