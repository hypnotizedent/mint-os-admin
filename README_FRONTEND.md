# PrintShop OS Frontend

Modern React + TypeScript frontend for PrintShop OS print management system.

Built with:
- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **Radix UI** - Accessible components
- **React Query** - Data fetching
- **React Hook Form** - Form handling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend services running (see main repo README)

### Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Development server runs at `http://localhost:5173` by default.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── ui/             # UI component library
│   │   ├── dashboard/      # Dashboard page
│   │   ├── jobs/           # Job management
│   │   ├── customers/      # Customer portal
│   │   ├── files/          # File management
│   │   ├── machines/       # Machine tracking
│   │   ├── reports/        # Analytics & reports
│   │   ├── settings/       # Configuration
│   │   └── layout/         # Layout components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and helpers
│   ├── styles/             # Global styles
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── package.json            # Dependencies
├── vite.config.ts          # Build config
├── tailwind.config.js      # Tailwind config
├── tsconfig.json           # TypeScript config
├── Dockerfile              # Container config
├── .env.example            # Environment template
└── README.md               # This file
```

## 🔨 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
npm run type-check      # Check TypeScript

# Utilities
npm run optimize        # Optimize Vite deps
npm run kill            # Kill process on port 5000
```

## 🌐 Environment Configuration

See `.env.example` for all available options:

```env
# Backend APIs
VITE_API_URL=http://localhost:3002          # Main API service
VITE_STRAPI_URL=http://localhost:1337       # Strapi CMS
VITE_WS_URL=ws://localhost:3004             # WebSocket server

# Features
VITE_ENABLE_CUSTOMER_PORTAL=true
VITE_ENABLE_ADVANCED_PRICING=true
VITE_ENABLE_SUPPLIER_SYNC=true
VITE_ENABLE_ANALYTICS=true
```

## 🐳 Docker

### Build Docker Image

```bash
docker build -t printshop-frontend:latest .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e VITE_API_URL=http://host.docker.internal:3002 \
  -e VITE_STRAPI_URL=http://host.docker.internal:1337 \
  printshop-frontend:latest
```

### Docker Compose (from main repo)

```bash
cd ..
docker-compose up frontend
```

## 🔗 Backend Integration

Frontend connects to these backend services:

| Service | Port | Purpose |
|---------|------|---------|
| API Service | 3002 | Main business logic API |
| Strapi CMS | 1337 | Content management & data |
| Job Estimator | 3001 | Pricing calculations |
| Production Dashboard | 3004 | WebSocket real-time updates |

See `/docs/SPARK_FRONTEND_TECHNICAL_BRIEF.md` for complete API reference.

## 🧪 Component Library

Frontend includes a comprehensive UI component library built with Radix UI and Tailwind CSS:

- Buttons, inputs, forms
- Dialogs, modals, popovers
- Tables, pagination
- Cards, badges, alerts
- Navigation, menus
- And much more...

Browse components and examples in `src/components/ui/`.

## 🎨 Styling

Uses **Tailwind CSS v4** with:
- Custom theme in `theme.json`
- Global styles in `src/styles/`
- Component-level CSS modules where needed

## 🚀 Deployment

### Production Build

```bash
npm run build
```

Creates optimized bundle in `dist/` directory.

### Deployment Options

1. **Static Hosting** (Vercel, Netlify, S3+CloudFront)
   ```bash
   npm run build
   # Upload dist/ folder
   ```

2. **Docker** (Any cloud provider)
   ```bash
   docker build -t printshop-frontend:latest .
   docker push your-registry/printshop-frontend:latest
   ```

3. **Node.js Server**
   ```bash
   npm run build
   npm install -g serve
   serve -s dist -l 3000
   ```

## 📚 Documentation

- Architecture & Integration: `/docs/FRONTEND_INTEGRATION_STRATEGY.md`
- API Reference: `/docs/SPARK_FRONTEND_TECHNICAL_BRIEF.md`
- Development Roadmap: `/docs/FRONTEND_DEVELOPMENT_ROADMAP.md`
- Executive Summary: `/docs/SPARK_FRONTEND_EXECUTIVE_SUMMARY.md`

## 🤝 Contributing

See main repository `CONTRIBUTING.md` for guidelines.

## 📄 License

See `LICENSE` file.

## 🆘 Troubleshooting

### Port already in use
```bash
npm run kill              # Kill process on port 5000
# Or specify different port:
npm run dev -- --port 5174
```

### Dependencies issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build errors
```bash
npm run type-check        # Check TypeScript errors
npm run lint              # Check ESLint issues
```

## 📞 Support

See main PrintShop OS repository for support and contribution guidelines.
