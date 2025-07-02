const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ------------ Interfaces ------------
export interface User {
  _id: string;
  email: string;
}




export interface Company {
  _id: string;
  userId: string;
  name: string;
  industry: string;
  services: string[];
  description?: string;
  website?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tender {
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

export interface Application {
  _id: string;
  tenderId: string;
  companyId: string;
  proposal: string;
  quotedPrice: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  message: string;
}

export interface PaginatedResponse<T> {
  tenders: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}



// ------------ Helpers ------------
const buildQuery = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') query.append(key, String(value));
  }
  return query.toString();
};

// ------------ API Client ------------
class ApiClient {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private normalizeHeaders(headers?: HeadersInit): Record<string, string> {
    if (!headers) return {};
    if (headers instanceof Headers) {
      return Object.fromEntries(headers.entries());
    } else if (Array.isArray(headers)) {
      return Object.fromEntries(headers);
    } else {
      return { ...headers };
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const authHeaders = this.getAuthHeaders();
    const userHeaders = this.normalizeHeaders(options.headers);

    const mergedHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...userHeaders,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: mergedHeaders,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }




  // ------------ AUTH ------------
  async register(data: {
    email: string;
    password: string;
    companyName: string;
    industry: string;
    services?: string[];
  }): Promise<AuthResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // ------------ COMPANIES ------------
  async getCompanies(params?: Record<string, string>): Promise<Company[]> {
  const query = buildQuery(params || {});
  return this.request(`/companies${query ? `?${query}` : ''}`);
}


  async getCompany(id: string): Promise<Company> {
    return this.request(`/companies/${id}`);
  }

  async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
    return this.request(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ------------ TENDERS ------------
  async getTenders(params?: {
    q?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Tender>> {
    const query = buildQuery(params || {});
    return this.request(`/tenders${query ? `?${query}` : ''}`);
  }

  async getTender(id: string): Promise<Tender> {
    return this.request(`/tenders/${id}`);
  }

  async createTender(data: {
    title: string;
    description: string;
    budget?: number;
    deadline: string;
    requirements?: string;
    category?: string;
  }): Promise<Tender> {
    return this.request('/tenders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async updateTender(id: string, data: Partial<Tender>): Promise<Tender> {
  return this.request(`/tenders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

async deleteCompany(id: string): Promise<{ message: string }> {
  return this.request(`/companies/${id}`, {
    method: 'DELETE',
  });
}


  async deleteTender(id: string): Promise<{ message: string }> {
    return this.request(`/tenders/${id}`, {
      method: 'DELETE',
    });
  }

  // ------------ APPLICATIONS ------------
  async createApplication(tenderId: string, data: {
    proposal: string;
    quotedPrice: number;
  }): Promise<Application> {
    return this.request(`/tenders/${tenderId}/applications`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTenderApplications(tenderId: string): Promise<Application[]> {
    return this.request(`/tenders/${tenderId}/applications`);
  }
}

export const api = new ApiClient();
