# ADR-008: Deployment Architecture — Multi-Subdomain Edge CDN with Unified Backend

## Status
**Accepted** (Phase 02)

## Context
The platform consists of five independent React + Vite SPAs connected to one Supabase backend. We evaluated two deployment models:
1. **Monolithic Multi-Domain Container (Docker / Kubernetes)**: Hosting all portals inside a single containerized Node.js / Nginx cluster managing subdomain routing dynamically.
2. **Static Edge CDN Deployment with Centralized Supabase BaaS**: Compiling each portal into static assets (`apps/*/dist`) deployed to global edge CDN nodes (e.g., Cloudflare Pages, Vercel, AWS S3/CloudFront) with wildcard DNS pointing to subdomains.

## Decision
We decided to adopt **Static Edge CDN Deployments with Centralized Supabase Backend**.

### Key Drivers
1. **Extreme Performance & Low Latency**: Static HTML, JS, and CSS bundles are served directly from edge CDN caches nearest to users across Uzbekistan and globally.
2. **Zero Server Maintenance**: Eliminates the operational burden of managing Node.js server runtimes, OS patches, container orchestration, and server monitoring.
3. **Fault-Isolated Deployments**: Updating the Student or Parent portal does not require container restarts or risk downtime for the Admin cashiering portal.
4. **Cost Efficiency**: Static edge hosting has negligible cost compared to persistent container clusters while scaling effortlessly to peak enrollment seasons.

## Consequences
- **Positive**: Blazing fast initial loads (< 1.5s LCP), zero server runtime vulnerabilities, automatic CDN scaling, independent CI/CD release cycles.
- **Trade-off**: Requires DNS wildcard configuration (`*.example.uz`) and edge rewrite rules (`/* -> /index.html`) to support client-side SPA routing.
