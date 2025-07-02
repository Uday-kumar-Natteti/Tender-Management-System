'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { setToken } from '@/lib/auth'

interface AuthFormProps {
  type: 'login' | 'register'
}

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: '',
    industry: '',
    services: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (type === 'login') {
        const res = await api.login(formData.email, formData.password)
        setToken(res.token)
      } else {
        const services = formData.services
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        const res = await api.register({
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          industry: formData.industry,
          services
        })
        setToken(res.token)
      }
      router.push('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          {type === 'login' ? 'Sign In' : 'Create Account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {type === 'login' ? (
            <>Don’t have an account? <Link href="/register" className="text-blue-600 hover:underline">Register</Link></>
          ) : (
            <>Already registered? <Link href="/login" className="text-blue-600 hover:underline">Login</Link></>
          )}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {error && <div className="text-red-600 bg-red-50 p-2 rounded">{error}</div>}

          <input
            type="email"
            name="email"
            value={formData.email}
            required
            onChange={handleChange}
            placeholder="Email"
            className="form-input w-full"
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            required
            onChange={handleChange}
            placeholder="Password"
            className="form-input w-full"
          />

          {type === 'register' && (
            <>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                required
                onChange={handleChange}
                placeholder="Company Name"
                className="form-input w-full"
              />

              <select
                name="industry"
                required
                value={formData.industry}
                onChange={handleChange}
                className="form-input w-full"
              >
                <option value="">Select Industry</option>
                {[
                  'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Construction',
                  'Education', 'Retail', 'Transportation', 'Energy', 'Agriculture', 'Other'
                ].map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>

              <input
                type="text"
                name="services"
                value={formData.services}
                onChange={handleChange}
                placeholder="Services (comma-separated)"
                className="form-input w-full"
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3"
          >
            {loading ? 'Processing...' : type === 'login' ? 'Sign In' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  )
}
