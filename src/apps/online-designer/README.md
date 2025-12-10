# Online Designer (Custom Studio App)

Customer-facing product customization tool integrated with PrintShop OS.

## Origin
Originally created with Lovable.dev as `custom-studio-app` repository.
Migrated into printshop-os monorepo on November 30, 2025.

## Technology Stack
- **Framework:** React + TypeScript + Vite
- **Canvas:** Fabric.js for design editing
- **UI:** Tailwind CSS + shadcn/ui
- **File Upload:** react-dropzone
- **Backend:** PrintShop OS Strapi (replaced Supabase)

## Key Files
- `lib/strapi.ts` - Strapi API client
- `pages/Index.tsx` - Main design upload page
- `components/CustomerDesignSession.tsx` - Design session management
- `components/ShopifyApp.tsx` - Shopify integration (placeholder)

## API Endpoints Used
- `POST /api/design-sessions` - Create design session
- `PUT /api/design-sessions/:id` - Update session
- `POST /api/custom-orders` - Submit order
- `POST /api/upload` - Upload design files
- `POST /api/auth/customer/login` - Customer login
- `POST /api/auth/customer/signup` - Customer signup

## Running Standalone
The online designer was previously at port 8081 as a separate app.
Now it should be integrated into the main frontend routing.

## TODO
- [ ] Add route in main App.tsx: `/designer`
- [ ] Test file upload to Strapi
- [ ] Add customer auth flow
- [ ] Integrate Fabric.js canvas editor
- [ ] Connect to product catalog
