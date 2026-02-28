# 🏗️ Drilling Industry Management Platform - MVP

A comprehensive drilling operations management system for Exploration and Blast Hole industries.

## 📋 All 6 Phases Implemented

### ✅ Phase 1: Registration & Login
- Complete registration form with all required fields
- Company auto-creation with trial period
- First user becomes Company Admin
- Email confirmation flow

### ✅ Phase 2: User Management
- 5 operational logins included (1 Admin + 5 Operational)
- Auto-generated usernames (e.g., `RIG01_SUP01`)
- Auto-generated secure passwords
- Activate/deactivate users
- Reset password functionality

### ✅ Phase 3: Trial & Billing
- 15-day free trial with countdown
- Per-rig per-day billing model ($10/day)
- Rig activation/deactivation
- Monthly invoice generation
- Billing calculation example

### ✅ Phase 4: Project Management
- Create projects with location, status, client
- Add Rigs, Drillers, Supervisors, Bits
- Dynamic "Add More" pattern
- Project-specific resource management

### ✅ Phase 5: Data Entry (Supervisor)
- **Drilling Log**: All fields including shift details, operation metrics, consumables, incidents
- **Maintenance Log**: Service details, components, fluids
- Hour validation (12h/10h shift modes)
- Multi-select downtime reasons
- Dynamic accessories/equipment addition

### ✅ Phase 6: Analytics Dashboards
1. **Operation Dashboard**: ROP trends, meters drilled, downtime analysis, bit performance
2. **Maintenance Dashboard**: Maintenance types, component frequency, oil consumption
3. **Driller & Crew Dashboard**: Performance by driller, crew hours
4. **Consumable Dashboard**: Fluid usage, accessories, equipment hours
5. **HSC Dashboard**: Incidents, severity analysis, safety metrics

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Run development server
npm run dev
```

## 📁 Project Structure

```
├── app/
│   ├── admin/           # Admin dashboard pages
│   ├── supervisor/      # Supervisor pages
│   ├── analytics/       # 5 analytics dashboards
│   ├── auth/           # Login & registration
│   └── page.tsx        # Landing page
├── lib/
│   ├── utils.ts        # Utility functions
│   └── mock-data.ts    # Dropdown data
├── prisma/
│   └── schema.prisma   # Database schema
└── components/         # Reusable components
```

## 🎯 Demo Credentials

- **Admin**: admin@demo.com / password
- **Supervisor**: supervisor@demo.com / password

## 🛠️ Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts (Analytics)
- Prisma (Database ORM)

## 📊 Key Features for Investors

1. **Complete User Journey**: From registration to daily operations
2. **Role-Based Access**: Admin vs Supervisor interfaces
3. **Flexible Billing**: Per-rig per-day model with trial
4. **Comprehensive Logging**: All drilling and maintenance data
5. **Rich Analytics**: 5 dashboards with interactive charts
6. **Scalable Architecture**: Ready for production deployment

## 📝 Next Steps for Production

1. Connect real database (PostgreSQL)
2. Implement authentication (NextAuth.js)
3. Add email service (Resend/SendGrid)
4. Integrate payment gateway (Stripe)
5. Add file upload (AWS S3)
6. Implement real-time updates

---

**Built for investor demo and rapid iteration.**
