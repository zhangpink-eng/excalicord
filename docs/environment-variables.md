# Environment Variables

## Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe Configuration (for payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# PostHog Analytics (optional)
VITE_POSTHOG_API_KEY=phc_your_key

# Feature Flags
VITE_ENABLE_AI_AVATARS=false
VITE_ENABLE_BEAUTY_FILTERS=true
```

## Environment Variable Reference

### Supabase

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous (public) key | Yes |

### Stripe

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (pk_test_... or pk_live_...) | Yes |

### PostHog

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_POSTHOG_API_KEY` | PostHog project API key | No |

### Feature Flags

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_ENABLE_AI_AVATARS` | Enable AI avatar features | false |
| `VITE_ENABLE_BEAUTY_FILTERS` | Enable beauty filter features | true |

## Deployment

### Vercel

For Vercel deployment, set these variables in the Vercel Dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable with the appropriate value

### Local Development

For local development, create a `.env.local` file (already in .gitignore):

```bash
cp .env.example .env.local
```

## Security Notes

- Never commit `.env.local` or `.env.production` to git
- The `VITE_` prefix makes variables exposed to the client - use only public keys
- Secret keys should be handled by server-side code or Edge Functions
