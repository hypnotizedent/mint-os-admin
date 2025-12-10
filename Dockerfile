# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for Vite environment variables
# Empty string = relative URLs (proxied by nginx)
ARG VITE_DASHBOARD_API_URL=
ARG VITE_API_URL=
ARG VITE_STRAPI_URL=
ARG VITE_PRICING_API_URL=

# Set as environment variables for the build
ENV VITE_DASHBOARD_API_URL=$VITE_DASHBOARD_API_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_STRAPI_URL=$VITE_STRAPI_URL
ENV VITE_PRICING_API_URL=$VITE_PRICING_API_URL

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build application
RUN npm run build

# Production stage - nginx
FROM nginx:alpine

# Copy built application to nginx html dir
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Port 3333 for admin dashboard
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3   CMD wget --no-verbose --tries=1 --spider http://localhost:3333 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
