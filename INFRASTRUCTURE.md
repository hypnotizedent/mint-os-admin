# Mint OS Infrastructure Overview

## Quick Reference

| Service | Container | Port | URL | Status |
|---------|-----------|------|-----|--------|
| Admin Dashboard | mint-os-admin | 3333 | http://docker-host:3333 | Healthy |
| Customer Portal | mint-os-customer | 3334 | http://docker-host:3334 | Healthy |
| Dashboard API | mint-os-dashboard-api | 3335 | http://docker-host:3335 | Healthy |
| Strapi CMS | mint-os-strapi | 11337 | http://docker-host:11337 | Running |
| Job Estimator | mint-os-job-estimator | 3001 | http://docker-host:3001 | Healthy |
| PostgreSQL | mint-os-postgres | 15432 | - | Healthy |
| Redis | mint-os-redis | 16379 | - | Healthy |
| MinIO (S3) | mint-os-minio | 9000/9001 | http://docker-host:9001 | Running |
| Grafana | mint-os-grafana | 3000 | http://docker-host:3000 | Healthy |
| Prometheus | mint-os-prometheus | 9090 | http://docker-host:9090 | Healthy |
| Cloudflare Tunnel | homelab-cloudflared | - | - | Running |

## Architecture Diagram

```
                    +-------------------------------------------------------------+
                    |                    INTERNET                                  |
                    +-------------------------------------------------------------+
                                              |
                                              v
                    +-------------------------------------------------------------+
                    |              Cloudflare Tunnel (homelab-cloudflared)         |
                    |   mintprints.ronny.works -> :3333 (admin)                    |
                    |   mintprints-api.ronny.works -> :3335 (dashboard-api)        |
                    |   cms.ronny.works -> :11337 (strapi)                         |
                    |   grafana.ronny.works -> :3000 (grafana)                     |
                    +-------------------------------------------------------------+
                                              |
        +-----------------------------------------+---------------------------------+
        |                                         |                                 |
        v                                         v                                 v
+-------------------+               +-------------------+               +-------------------+
|   Admin Dashboard |               |  Customer Portal  |               |   Dashboard API   |
|   (mint-os-admin) |               | (mint-os-customer)|               |(mint-os-dashboard)|
|      :3333        |               |      :3334        |               |      :3335        |
|  React + Vite     |               |  React + Vite     |               |   Node.js/Express |
+---------+---------+               +---------+---------+               +---------+---------+
          |                                   |                                   |
          | API calls                         | API calls                         | SQL queries
          |                                   |                                   |
          v                                   v                                   v
+-------------------------------------------------------------------------------+
|                        Strapi CMS (mint-os-strapi) :11337                       |
|                        Node.js headless CMS                                     |
+---------------------------------------+---------------------------------------+
                                        |
          +-----------------------------+-----------------------------+
          |                             |                             |
          v                             v                             v
+-------------------+       +-------------------+       +-------------------+
|    PostgreSQL     |       |      Redis        |       |      MinIO        |
| (mint-os-postgres)|       |  (mint-os-redis)  |       |  (mint-os-minio)  |
|      :15432       |       |      :16379       |       |    :9000/:9001    |
|    Database       |       |   Cache/Sessions  |       |   File Storage    |
|  12,854 orders    |       |                   |       |                   |
|  3,357 customers  |       |                   |       |                   |
+-------------------+       +-------------------+       +-------------------+

+-------------------------------------------------------------------------------+
|                                 MONITORING STACK                               |
+-------------------+-------------------+-------------------+--------------------+
|    Prometheus     |    Grafana        |   Alertmanager    |     Exporters      |
|      :9090        |      :3000        |      :9093        | node:9100          |
|    Metrics DB     |   Dashboards      |     Alerts        | cadvisor:8181      |
|                   |                   |                   | postgres:9187      |
|                   |                   |                   | redis:9121         |
+-------------------+-------------------+-------------------+--------------------+
```

## Docker Compose Files

| File | Purpose | Services |
|------|---------|----------|
| `docker-compose.yml` | Core infrastructure | postgres, redis, strapi, job-estimator |
| `docker-compose.admin.yml` | Admin dashboard | admin-dashboard |
| `docker-compose.frontends.yml` | All frontends + APIs | admin, customer, dashboard-api, job-estimator |
| `docker-compose.monitoring.yml` | Observability | prometheus, grafana, alertmanager, exporters |
| `docker-compose.minio.yml` | Object storage | minio |

## Database Schema (PostgreSQL)

Key tables in `mint_os` database:
- `orders` - 12,854 records (synced from Printavo)
- `customers` - 3,357 records
- `line_items` - Order line items with quantities
- `imprints` - Print/embroidery details
- `payments` - Payment records
- `quotes` - Quote records
- `jobs` - Production jobs
- `employees` - Staff records
- `machines` - Equipment inventory

## Environment Variables

### Root `.env` (Docker services)
| Variable | Purpose |
|----------|---------|
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `JWT_SECRET` | Strapi JWT signing |
| `ADMIN_JWT_SECRET` | Strapi admin JWT |
| `APP_KEYS` | Strapi encryption keys |
| `API_TOKEN_SALT` | API token generation |
| `MINIO_ROOT_USER/PASSWORD` | MinIO admin credentials |
| `STRAPI_API_TOKEN` | Import script token |
| `GRAFANA_PASSWORD` | Grafana admin password |

### Admin Dashboard `.env`
| Variable | Purpose | Value |
|----------|---------|-------|
| `VITE_DASHBOARD_API_URL` | Dashboard API endpoint | http://docker-host:3335 |
| `VITE_API_URL` | Strapi API endpoint | http://docker-host:11337 |
| `VITE_STRAPI_URL` | Strapi URL (alias) | http://docker-host:11337 |
| `VITE_OVERHEAD_PERCENTAGE` | Quote builder overhead | 15.0 |
| `VITE_DEFAULT_HOURLY_RATE` | Quote builder labor rate | 25.00 |
| `EASYPOST_API_KEY` | Shipping label API | (set in .env) |

## Storage

| Path | Size | Purpose |
|------|------|---------|
| `/mnt/docker/mint-os/postgres` | ~18K | PostgreSQL data |
| `/mnt/docker/mint-os/redis` | ~19K | Redis persistence |
| `/mnt/docker/mint-os/prometheus` | ~118M | Metrics storage |
| `/mnt/docker/mint-os/grafana` | ~30M | Dashboards & config |
| `/mnt/docker/mint-os/backups` | ~100G | Database backups |
| `/mnt/docker/mint-os/strapi` | ~1K | Strapi uploads |
| `/mnt/docker/printshop-os/minio` | - | S3-compatible storage |

## Networks

| Network | Purpose |
|---------|---------|
| `mint-os-network` | Internal service communication |
| `tunnel_network` | Cloudflare tunnel access (external) |

## API Endpoints

### Dashboard API (:3335)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/production-stats` | GET | Production metrics (quote, art, screenprint counts) |
| `/api/orders` | GET | List orders with pagination |
| `/api/customers` | GET | Customer list with stats |
| `/api/recent-jobs` | GET | Recent active jobs |
| `/api/dashboard-stats` | GET | Dashboard KPIs |
| `/api/files` | GET | MinIO file browser |
| `/api/files/download` | GET | Pre-signed download URLs |

### Strapi CMS (:11337)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/orders` | CRUD | Order management |
| `/api/customers` | CRUD | Customer management |
| `/api/quotes` | CRUD | Quote management |
| `/admin` | - | Strapi admin panel |

### Job Estimator (:3001)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/api/estimate` | POST | Calculate job pricing |

## Common Issues & Solutions

### 1. Files Page Shows "Failed to fetch"
**Cause:** VITE_API_URL not pointing to correct API
**Fix:** Check `packages/admin-dashboard/.env`:
```bash
VITE_DASHBOARD_API_URL=http://docker-host:3335
```

### 2. Dashboard Shows No Data
**Cause:** Dashboard API not running or can't reach PostgreSQL
**Fix:**
```bash
docker logs mint-os-dashboard-api
docker restart mint-os-dashboard-api
```

### 3. Pages Not Filling Full Width
**Cause:** Flex chain broken by wrapper elements (see TROUBLESHOOTING.md)
**Fix:** Ensure wrapper divs have `flex-1 min-w-0` class

### 4. Strapi Admin 502 Error
**Cause:** Strapi crashed or PostgreSQL connection lost
**Fix:**
```bash
docker restart mint-os-strapi
docker logs -f mint-os-strapi
```

### 5. MinIO Files Not Appearing
**Cause:** Wrong bucket or CORS configuration
**Fix:** Check MinIO console at http://docker-host:9001

## Maintenance Commands

### View All Logs
```bash
# All services
docker compose logs -f

# Specific service
docker logs -f mint-os-admin
docker logs -f mint-os-strapi
docker logs -f mint-os-dashboard-api
```

### Restart Services
```bash
# Restart everything
cd ~/stacks/mint-os
docker compose restart
docker compose -f docker-compose.admin.yml restart
docker compose -f docker-compose.frontends.yml restart

# Restart specific container
docker restart mint-os-admin
```

### Rebuild After Code Changes
```bash
# Admin Dashboard
cd ~/stacks/mint-os/packages/admin-dashboard
npm run build
docker compose -f ~/stacks/mint-os/docker-compose.admin.yml build
docker compose -f ~/stacks/mint-os/docker-compose.admin.yml up -d
```

### Database Operations
```bash
# Connect to PostgreSQL
docker exec -it mint-os-postgres psql -U mintadmin -d mint_os

# Backup database
docker exec mint-os-postgres pg_dump -U mintadmin mint_os > backup.sql

# Check table counts
docker exec mint-os-postgres psql -U mintadmin -d mint_os -c "SELECT COUNT(*) FROM orders;"
```

### Health Checks
```bash
# Check all container health
docker ps --format "table {{.Names}}\t{{.Status}}"

# Test API endpoints
curl http://localhost:3335/api/production-stats
curl http://localhost:3001/health
curl http://localhost:11337/api/health
```

## Resource Usage (Typical)

| Container | CPU | Memory | Notes |
|-----------|-----|--------|-------|
| mint-os-admin | <1% | ~8MB | Static nginx |
| mint-os-dashboard-api | <1% | ~29MB | Node.js API |
| mint-os-strapi | <1% | ~336MB | Headless CMS |
| mint-os-postgres | <1% | ~114MB | Database |
| mint-os-minio | ~10% | ~1GB | File storage (high I/O) |
| mint-os-prometheus | <1% | ~231MB | Metrics DB |
| mint-os-grafana | <1% | ~86MB | Dashboards |

Total typical memory: ~2GB of 62.8GB available

## Public URLs (via Cloudflare Tunnel)

| Service | URL |
|---------|-----|
| Admin Dashboard | https://mintprints.ronny.works |
| Dashboard API | https://mintprints-api.ronny.works |
| Strapi CMS | https://cms.ronny.works |
| Grafana | https://grafana.ronny.works |
