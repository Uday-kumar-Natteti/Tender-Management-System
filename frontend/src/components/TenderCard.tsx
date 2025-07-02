'use client';

import Link from 'next/link';

interface TenderCardProps {
  _id: string;
  companyId: string;
  title: string;
  description: string;
  budget?: number;
  deadline: string;
  status: 'active' | 'closed' | 'awarded';
  requirements?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TenderCard({
  _id,
  title,
  description,
  budget,
  deadline,
  status,
  category = 'General',
  requirements = '',
  createdAt,
}: TenderCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return 'badge-green';
      case 'closed':
        return 'badge-red';
      case 'awarded':
        return 'badge-yellow';
      default:
        return 'badge-blue';
    }
  };

  const getDaysUntilDeadline = () => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilDeadline();

  return (
    <div className="entity-card group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={`badge ${getStatusBadge()}`}>{status.toUpperCase()}</span>
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
        </div>
        <div className="text-sm text-gray-500">
          {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
        </div>
      </div>

      <p className="text-gray-600 mb-6 line-clamp-3">{description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-600">Budget</div>
          <div className="text-lg font-bold text-blue-600">{budget ?? 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Category</div>
          <div className="text-lg font-bold text-green-600">{category}</div>
        </div>
      </div>

      {requirements && (
        <div className="text-sm text-gray-600 mb-4">
          <span className="font-semibold">Requirements:</span> {requirements}
        </div>
      )}

      <div className="text-sm text-gray-500 mb-4">Posted on: {new Date(createdAt).toLocaleDateString()}</div>

      <Link href={`/tenders/${_id}`} className="btn btn-primary text-sm">
        View Details
      </Link>
    </div>
  );
}
