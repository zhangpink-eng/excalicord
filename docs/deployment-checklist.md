# Deployment Checklist

## Pre-Deployment Verification

### Code Quality
- [ ] All TypeScript errors resolved (`npm run build`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] All tests passing (`npm run test` if configured)

### Security
- [ ] Environment variables configured in Vercel
- [ ] Supabase RLS policies verified
- [ ] No sensitive data in client-side code
- [ ] CORS settings configured for API

### Functionality
- [ ] User registration/login working
- [ ] Project creation and saving working
- [ ] Canvas drawing functional
- [ ] Recording controls functional
- [ ] Export dialog functional

## Vercel Deployment Steps

### 1. Connect Repository
- [ ] Connect GitHub repository to Vercel
- [ ] Select the `main` branch for production

### 2. Configure Project
- [ ] Framework: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`

### 3. Set Environment Variables
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] `VITE_POSTHOG_API_KEY` (optional)

### 4. Deploy
- [ ] Trigger initial deployment
- [ ] Verify build succeeds
- [ ] Check production URL

### 5. Post-Deployment
- [ ] Test authentication flow
- [ ] Verify database operations
- [ ] Check browser console for errors
- [ ] Test recording and export

## Supabase Setup

### 1. Create Project
- [ ] Create Supabase project at supabase.com
- [ ] Note project URL and anon key

### 2. Run Migrations
- [ ] Navigate to SQL Editor
- [ ] Run `supabase/migrations/001_initial_schema.sql`

### 3. Configure Auth
- [ ] Enable Email/Password provider
- [ ] Configure Google OAuth (if using)
- [ ] Set redirect URLs

### 4. Configure Storage
- [ ] Create `recordings` bucket
- [ ] Set storage policies

## Stripe Setup

### 1. Create Products
- [ ] Create Free tier product ($0)
- [ ] Create Pro tier product ($19/month)
- [ ] Create Team tier product ($49/month)

### 2. Configure Webhooks
- [ ] Set up Stripe webhook endpoint
- [ ] Add webhook signing secret to Vercel env vars

## Domain Configuration (Optional)

### Vercel
- [ ] Purchase domain from Namecheap
- [ ] Add domain to Vercel project
- [ ] Configure DNS records

### DNS Records
```
A Record: @ -> Vercel IP
CNAME: www -> cname.vercel-dns.com
```

## Monitoring Setup

### PostHog
- [ ] Create PostHog project
- [ ] Add API key to environment
- [ ] Verify events being tracked

### Uptime Monitoring
- [ ] Set up uptime monitoring (e.g., Grafana, Pingdom)
- [ ] Configure alert notifications

## Post-Launch

### Analytics Review
- [ ] Monitor user sign-ups
- [ ] Track feature usage
- [ ] Review error reports

### Performance
- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Optimize bundle size if needed

### Support
- [ ] Set up support email
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Create help documentation
