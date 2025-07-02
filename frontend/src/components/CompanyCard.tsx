'use client';
import Link from 'next/link';
import { Company } from '@/lib/api';

interface Props {
  company: Company;
}

export default function CompanyCard({ company }: Props) {
  return (
    <div className="card hover:shadow-md transition-shadow p-4 border rounded-lg bg-white">
      <div className="flex items-center space-x-4 mb-3">
        <div className="w-12 h-12 bg-primary-100 flex items-center justify-center rounded">
          <span className="text-primary-600 font-semibold text-lg">
            {company.name[0]}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
          <p className="text-sm text-gray-600">{company.industry}</p>
        </div>
      </div>

      {company.description && (
        <p className="text-sm text-gray-700 mb-3 truncate">
          {company.description}
        </p>
      )}

      {company.services?.length > 0 && (
        <div className="flex flex-wrap gap-1 text-xs text-gray-600 mb-3">
          {company.services.slice(0, 3).map((s, i) => (
            <span key={i} className="bg-gray-100 px-2 py-1 rounded">
              {s}
            </span>
          ))}
          {company.services.length > 3 && (
            <span className="text-gray-500">
              +{company.services.length - 3} more
            </span>
          )}
        </div>
      )}

      <div className="flex justify-between text-sm text-blue-600">
        <Link href={`/companies/${company._id}`}>View Details →</Link>
        {company.website && (
          <a
            href={
              company.website.startsWith('http')
                ? company.website
                : `https://${company.website}`
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            Website
          </a>
        )}
      </div>
    </div>
  );
}
