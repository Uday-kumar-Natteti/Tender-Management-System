# B2B Tender Platform - MongoDB Atlas Version

## 📁 Simplified File Structure

```
tender-platform/
├── README.md
├── docker-compose.yml
├── .env.example
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── tenders/page.tsx
│   │   │   ├── companies/page.tsx
│   │   │   └── search/page.tsx
│   │   ├── components/
│   │   │   ├── AuthForm.tsx
│   │   │   ├── TenderCard.tsx
│   │   │   ├── CompanyCard.tsx
│   │   │   └── SearchBar.tsx
│   │   └── lib/
│   │       ├── api.ts
│   │       └── auth.ts
└── backend/
    ├── package.json
    ├── Dockerfile
    ├── server.js
    ├── models/
    │   ├── User.js
    │   ├── Company.js
    │   ├── Tender.js
    │   └── Application.js
    └── config/
        └── database.js
```

## 🚀 Complete MongoDB Implementation

### Backend Implementation

#### 1. package.json (Backend)
```json
{
  "name": "tender-platform-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.0",
    "multer": "^1.4.5-lts.1",
    "joi": "^17.11.0",
    "dotenv": "^16.3.1",
    "@supabase/supabase-js": "^2.38.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

#### 2. models/User.js
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
```

#### 3. models/Company.js
```javascript
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  description: String,
  logoUrl: String,
  website: String,
  phone: String,
  address: String,
  services: [String] // Array of services/products offered
}, {
  timestamps: true
});

// Index for search functionality
companySchema.index({ name: 'text', description: 'text', services: 'text' });

module.exports = mongoose.model('Company', companySchema);
```

#### 4. models/Tender.js
```javascript
const mongoose = require('mongoose');

const tenderSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    min: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'awarded'],
    default: 'active'
  },
  requirements: String,
  category: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Tender', tenderSchema);
```

#### 5. models/Application.js
```javascript
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  tenderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tender',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  proposal: {
    type: String,
    required: true
  },
  quotedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Ensure one application per company per tender
applicationSchema.index({ tenderId: 1, companyId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
```

#### 6. config/database.js
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

#### 7. server.js (Main Backend File)
```javascript
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const connectDB = require('./config/database');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Company = require('./models/Company');
const Tender = require('./models/Tender');
const Application = require('./models/Application');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// File upload middleware
const upload = multer({ storage: multer.memoryStorage() });

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, companyName, industry, services = [] } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      email,
      passwordHash: hashedPassword
    });
    await user.save();
    
    // Create company
    const company = new Company({
      userId: user._id,
      name: companyName,
      industry,
      services
    });
    await company.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, message: 'Login successful' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Company Routes
app.get('/api/companies', async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/companies/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/companies/:id', authenticateToken, async (req, res) => {
  try {
    const { name, industry, description, website, phone, address, services } = req.body;
    
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { name, industry, description, website, phone, address, services },
      { new: true }
    );
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json(company);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/companies/:id/logo', authenticateToken, upload.single('logo'), async (req, res) => {
  try {
    const file = req.file;
    const fileName = `${Date.now()}-${file.originalname}`;
    
    const { data, error } = await supabase.storage
      .from('company-logos')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('company-logos')
      .getPublicUrl(fileName);
    
    await Company.findByIdAndUpdate(req.params.id, { logoUrl: publicUrl });
    
    res.json({ logoUrl: publicUrl });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Tender Routes
app.get('/api/tenders', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const tenders = await Tender.find({ status: 'active' })
      .populate('companyId', 'name industry')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Tender.countDocuments({ status: 'active' });
    
    res.json({
      tenders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tenders/:id', async (req, res) => {
  try {
    const tender = await Tender.findById(req.params.id).populate('companyId', 'name industry');
    if (!tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }
    res.json(tender);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tenders', authenticateToken, async (req, res) => {
  try {
    const { title, description, budget, deadline, requirements, category } = req.body;
    
    // Get company for the user
    const company = await Company.findOne({ userId: req.user.userId });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    const tender = new Tender({
      companyId: company._id,
      title,
      description,
      budget,
      deadline,
      requirements,
      category
    });
    
    await tender.save();
    await tender.populate('companyId', 'name industry');
    
    res.json(tender);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Application Routes
app.post('/api/tenders/:id/applications', authenticateToken, async (req, res) => {
  try {
    const { proposal, quotedPrice } = req.body;
    
    // Get company for the user
    const company = await Company.findOne({ userId: req.user.userId });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    const application = new Application({
      tenderId: req.params.id,
      companyId: company._id,
      proposal,
      quotedPrice
    });
    
    await application.save();
    await application.populate('companyId', 'name industry');
    
    res.json(application);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already applied to this tender' });
    }
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/tenders/:id/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await Application.find({ tenderId: req.params.id })
      .populate('companyId', 'name industry')
      .sort({ createdAt: -1 });
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search Routes
app.get('/api/search/companies', async (req, res) => {
  try {
    const { q, industry } = req.query;
    let filter = {};
    
    if (q) {
      filter.$text = { $search: q };
    }
    
    if (industry) {
      filter.industry = new RegExp(industry, 'i');
    }
    
    const companies = await Company.find(filter).sort({ createdAt: -1 });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's company
app.get('/api/user/company', authenticateToken, async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.userId });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's tenders
app.get('/api/user/tenders', authenticateToken, async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.userId });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    const tenders = await Tender.find({ companyId: company._id }).sort({ createdAt: -1 });
    res.json(tenders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's applications
app.get('/api/user/applications', authenticateToken, async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.userId });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    const applications = await Application.find({ companyId: company._id })
      .populate('tenderId', 'title deadline')
      .sort({ createdAt: -1 });
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Frontend Implementation (Same as before, but updated API calls)

#### 8. Updated src/lib/api.ts
```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const authAPI = {
  register: (data: any) => api.post('/api/auth/register', data),
  login: (data: any) => api.post('/api/auth/login', data),
};

export const companyAPI = {
  getAll: () => api.get('/api/companies'),
  getById: (id: string) => api.get(`/api/companies/${id}`),
  update: (id: string, data: any) => api.put(`/api/companies/${id}`, data),
  uploadLogo: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post(`/api/companies/${id}/logo`, formData);
  },
  getUserCompany: () => api.get('/api/user/company'),
  search: (params: any) => api.get('/api/search/companies', { params }),
};

export const tenderAPI = {
  getAll: (params?: any) => api.get('/api/tenders', { params }),
  getById: (id: string) => api.get(`/api/tenders/${id}`),
  create: (data: any) => api.post('/api/tenders', data),
  getUserTenders: () => api.get('/api/user/tenders'),
  getApplications: (id: string) => api.get(`/api/tenders/${id}/applications`),
  applyToTender: (id: string, data: any) => api.post(`/api/tenders/${id}/applications`, data),
};

export const applicationAPI = {
  getUserApplications: () => api.get('/api/user/applications'),
};

export default api;
```

## 🚀 MongoDB Atlas Setup

### 1. MongoDB Atlas Configuration
```bash
# 1. Go to MongoDB Atlas (https://cloud.mongodb.com/)
# 2. Create a free cluster
# 3. Create a database user
# 4. Whitelist your IP address
# 5. Get your connection string
```

### 2. Environment Variables

**Backend (.env):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tender_platform?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=5000
NODE_ENV=development
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Docker Configuration

**docker-compose.yml**
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:5000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
```

## 🎯 Why MongoDB Atlas is Perfect for This Project

### ✅ **Advantages:**

1. **No Setup Required** - Just create account and get connection string
2. **Free Tier** - 512MB storage, perfect for internship project
3. **Built-in Security** - Authentication and SSL included
4. **Easy Scaling** - Can upgrade easily if needed
5. **No Migrations** - Schema changes are flexible
6. **Better for Rapid Development** - Less boilerplate code
7. **JSON-like Structure** - Perfect for JavaScript/Node.js
8. **Text Search Built-in** - Easy search functionality
9. **Cloud-Based** - No local database setup needed
10. **Automatic Backups** - Data protection included

### 📊 **MongoDB vs PostgreSQL for This Project:**

| Feature | MongoDB Atlas | PostgreSQL |
|---------|---------------|------------|
| Setup Time | 5 minutes | 30+ minutes |
| Free Hosting | ✅ Yes | ❌ Need separate service |
| Schema Changes | ✅ Flexible | ❌ Requires migrations |
| JSON Support | ✅ Native | ⚠️ Additional setup |
| Search | ✅ Built-in text search | ❌ Need additional config |
| Learning Curve | ✅ Easier for beginners | ❌ More complex |

## 🚀 Quick Start Commands

```bash
# 1. Setup project
mkdir tender-platform && cd tender-platform

# 2. Backend setup
mkdir backend && cd backend
npm init -y
npm install express cors bcryptjs jsonwebtoken mongoose multer joi dotenv @supabase/supabase-js
npm install -D nodemon

# 3. Frontend setup
cd .. && mkdir frontend && cd frontend
npx create-next-app@latest . --typescript --tailwind --app --src-dir
npm install axios react-hook-form

# 4. Create MongoDB Atlas cluster and get connection string
# 5. Create Supabase project for file storage
# 6. Add environment variables
# 7. Run both servers and start coding!
```

## 📋 Updated 5-Day Plan

### Day 1: Setup & Database
- [ ] MongoDB Atlas cluster setup
- [ ] Project structure creation
- [ ] Models and database connection
- [ ] Basic authentication

### Day 2: Core API
- [ ] All CRUD operations
- [ ] File upload with Supabase
- [ ] Authentication middleware
- [ ] API testing

### Day 3: Frontend Integration
- [ ] All pages and components
- [ ] API integration
- [ ] Authentication flow
- [ ] Form validations

### Day 4: Features & Polish
- [ ] Search functionality
- [ ] Applications workflow
- [ ] UI improvements
- [ ] Error handling

### Day 5: Deployment
- [ ] Production deployment
- [ ] Environment configuration
- [ ] Testing and bug fixes
- [ ] Documentation and video

MongoDB Atlas makes this project much more manageable and realistic for a 5-day timeline!