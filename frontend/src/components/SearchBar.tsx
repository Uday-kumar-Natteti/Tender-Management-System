'use client'

import { useState } from 'react'

interface Filter {
  name: string
  label: string
  options: { value: string; label: string }[]
}

interface SearchBarProps {
  onSearch: (query: string, filters?: Record<string, string>) => void
  placeholder?: string
  filters?: Filter[]
}

export default function SearchBar({
  onSearch,
  placeholder = 'Search...',
  filters = [],
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query, filterValues)
  }

  const handleFilterChange = (name: string, value: string) => {
    const updated = { ...filterValues, [name]: value }
    setFilterValues(updated)
    onSearch(query, updated)
  }

  const clearFilters = () => {
    setQuery('')
    setFilterValues({})
    onSearch('', {})
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {filters.map((filter) => (
            <div key={filter.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{filter.label}</label>
              <select
                className="min-w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                value={filterValues[filter.name] || ''}
                onChange={(e) => handleFilterChange(filter.name, e.target.value)}
              >
                <option value="">All</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {(query || Object.values(filterValues).some(Boolean)) && (
            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </form>
  )
}
