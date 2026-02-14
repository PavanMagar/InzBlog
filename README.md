# Inkwell — Modern Blog Platform

A full-featured, modern blog platform built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- 📝 Rich text post editor with image uploads
- 🗂️ Category management and filtering
- 💬 Nested comment system with likes
- 🔗 Link shortener with password protection & click tracking
- 📊 Admin dashboard with analytics
- ⚙️ Dynamic site settings (title, favicon, SEO, social links)
- 🔒 Role-based admin access with Row Level Security
- 🌙 Dark/light mode support
- 📱 Fully responsive design

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Supabase Setup](#supabase-setup)
4. [Environment Variables](#environment-variables)
5. [Local Development](#local-development)
6. [Edge Functions](#edge-functions)
7. [Building for Production](#building-for-production)
8. [Deployment](#deployment)
   - [Vercel](#deploy-to-vercel)
   - [Cloudflare Pages](#deploy-to-cloudflare-pages)
   - [Render](#deploy-to-render)
   - [Netlify](#deploy-to-netlify)
   - [Self-Hosted / VPS](#deploy-to-vps--self-hosted)
9. [Admin Setup](#admin-setup)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, make sure you have:

- **Node.js** v18 or later — [Download](https://nodejs.org/) or use [nvm](https://github.com/nvm-sh/nvm)
- **npm** (comes with Node.js) or **bun** — [Download bun](https://bun.sh/)
- **Git** — [Download](https://git-scm.com/)
- **Supabase account** (free) — [Sign up](https://supabase.com/)

Verify your installations:

```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
git --version     # Should show git version 2.x.x
```

---

## Project Structure

```
inkwell/
├── public/                    # Static assets (favicon, robots.txt)
├── src/
│   ├── components/            # Reusable React components
│   │   ├── ui/                # shadcn/ui primitives
│   │   └── skeletons/         # Loading skeleton components
│   ├── hooks/                 # Custom React hooks
│   ├── integrations/supabase/ # Supabase client & types
│   ├── lib/                   # Utilities & auth context
│   ├── pages/                 # Page components
│   │   └── admin/             # Admin panel pages
│   ├── index.css              # Global styles & design tokens
│   ├── main.tsx               # App entry point
│   └── App.tsx                # Router & providers
├── supabase/
│   └── functions/             # Supabase Edge Functions
│       ├── increment-link-click/
│       └── setup-admin/
├── database.sql               # Complete database setup script
├── .env.example               # Environment variable template
├── tailwind.config.ts         # Tailwind CSS configuration
├── vite.config.ts             # Vite build configuration
└── package.json               # Dependencies & scripts
```

---

## Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Choose your **organization** (or create one)
4. Enter a **project name** (e.g., `inkwell-blog`)
5. Set a **database password** — save this somewhere safe
6. Select a **region** close to your users
7. Click **"Create new project"**
8. Wait 1-2 minutes for provisioning to complete

### Step 2: Get Your API Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values (you'll need them for `.env`):
   - **Project URL** — looks like `https://abcdefg.supabase.co`
   - **anon public key** — a long JWT string starting with `eyJ...`
   - **Project Reference ID** — the `abcdefg` part of your URL

### Step 3: Run the Database Setup Script

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Open the `database.sql` file from this repository
4. **Copy the entire contents** and paste into the SQL Editor
5. Click **"Run"** (or press Ctrl+Enter / Cmd+Enter)
6. You should see "Success. No rows returned" — this is expected
7. Verify by going to **Table Editor** — you should see these tables:
   - `user_roles`
   - `categories`
   - `posts`
   - `post_categories`
   - `comments`
   - `comment_likes`
   - `site_settings`
   - `shortened_links`

### Step 4: Verify RLS Policies

1. Go to **Authentication** → **Policies** in your Supabase dashboard
2. Each table should have multiple policies listed
3. All tables should show **"RLS enabled"**

### Step 5: Verify Storage Bucket

1. Go to **Storage** in the Supabase dashboard
2. You should see a `thumbnails` bucket
3. It should be marked as **Public**

### Step 6: Deploy Edge Functions

Edge functions handle server-side logic. You need the Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (use your project ref from Step 2)
supabase link --project-ref YOUR_PROJECT_REF_ID

# Deploy all edge functions
supabase functions deploy increment-link-click --no-verify-jwt
supabase functions deploy setup-admin
```

> **Note:** `increment-link-click` uses `--no-verify-jwt` because it's called from the public frontend without authentication.

### Step 7: Create Admin User

After deploying edge functions, create your admin user:

```bash
# Using curl
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/setup-admin' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

Or open this URL in your browser:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/setup-admin
```

This creates an admin user with:
- **Email:** `admin@inkwell.blog`
- **Password:** `admin1234`

> ⚠️ **IMPORTANT:** Change these credentials immediately after first login via the Admin Settings page!

---

## Environment Variables

### Step 1: Create the .env File

```bash
cp .env.example .env
```

### Step 2: Fill in Your Values

Open `.env` in your editor and replace the placeholder values:

```env
VITE_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsIn..."
VITE_SUPABASE_PROJECT_ID="YOUR_PROJECT_REF"
```

> **Where to find these:** Supabase Dashboard → Settings → API

---

## Local Development

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/inkwell.git
cd inkwell
```

### Step 2: Install Dependencies

```bash
# Using npm
npm install

# OR using bun (faster)
bun install
```

### Step 3: Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your Supabase credentials (see above)
```

### Step 4: Start the Development Server

```bash
# Using npm
npm run dev

# OR using bun
bun run dev
```

### Step 5: Open in Browser

Navigate to [http://localhost:8080](http://localhost:8080)

The dev server features:
- ⚡ Hot Module Replacement (instant updates)
- 🔍 TypeScript type checking
- 📦 Auto-imports

### Step 6: Access Admin Panel

1. Go to [http://localhost:8080/admin/login](http://localhost:8080/admin/login)
2. Login with:
   - Email: `admin@inkwell.blog`
   - Password: `admin1234`
3. **Change your password** in Admin → Settings → Account

---

## Edge Functions

The project includes two Supabase Edge Functions:

### 1. `increment-link-click`
- **Purpose:** Increments the click counter for shortened links
- **Auth:** No JWT verification (public access)
- **Method:** POST
- **Body:** `{ "link_id": "uuid-string" }`

### 2. `setup-admin`
- **Purpose:** Creates the initial admin user and role
- **Auth:** Uses service role key internally
- **Method:** POST
- **Body:** None required

### Local Edge Function Development

```bash
# Start edge functions locally (requires Docker)
supabase start
supabase functions serve

# Test locally
curl -X POST http://localhost:54321/functions/v1/setup-admin \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

---

## Building for Production

### Step 1: Build the Project

```bash
# Using npm
npm run build

# OR using bun
bun run build
```

This creates a `dist/` folder with optimized static files.

### Step 2: Preview the Build Locally

```bash
# Using npm
npm run preview

# OR using npx
npx vite preview --port 4173
```

Navigate to [http://localhost:4173](http://localhost:4173) to verify.

---

## Deployment

The build output is a static site (HTML + JS + CSS). It can be hosted on any static hosting platform.

---

### Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com) and sign in**

3. **Click "Add New..." → "Project"**

4. **Import your repository**
   - Select your Git provider
   - Find and select your `inkwell` repository
   - Click "Import"

5. **Configure the project**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

6. **Add Environment Variables**
   - Click "Environment Variables"
   - Add each variable one by one:
     ```
     Name: VITE_SUPABASE_URL
     Value: https://YOUR_PROJECT_REF.supabase.co
     
     Name: VITE_SUPABASE_PUBLISHABLE_KEY
     Value: eyJhbGciOiJIUzI1NiIsIn...
     
     Name: VITE_SUPABASE_PROJECT_ID
     Value: YOUR_PROJECT_REF
     ```

7. **Click "Deploy"**

8. **Wait for deployment** (usually 1-2 minutes)

9. **Your site is live!** Vercel gives you a URL like `https://inkwell-xxxx.vercel.app`

#### Option B: Via Vercel CLI

```bash
# Step 1: Install Vercel CLI
npm install -g vercel

# Step 2: Login to Vercel
vercel login

# Step 3: Deploy (first time — will ask questions)
vercel

# When prompted:
#   Set up and deploy? → Y
#   Which scope? → Select your account
#   Link to existing project? → N
#   Project name? → inkwell (or your preferred name)
#   Directory? → ./
#   Override settings? → N

# Step 4: Set environment variables
vercel env add VITE_SUPABASE_URL
# Paste: https://YOUR_PROJECT_REF.supabase.co
# Select: Production, Preview, Development → Press Enter

vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
# Paste your anon key

vercel env add VITE_SUPABASE_PROJECT_ID
# Paste your project ref

# Step 5: Deploy to production
vercel --prod
```

#### Adding a Custom Domain on Vercel

1. Go to your project on [vercel.com](https://vercel.com)
2. Click **Settings** → **Domains**
3. Enter your domain (e.g., `blog.yourdomain.com`)
4. Click **Add**
5. Follow the DNS configuration instructions:
   - **For apex domain** (yourdomain.com): Add an `A` record pointing to `76.76.21.21`
   - **For subdomain** (blog.yourdomain.com): Add a `CNAME` record pointing to `cname.vercel-dns.com`
6. Wait for DNS propagation (usually 5 minutes to 48 hours)

#### SPA Routing Fix for Vercel

Create a `vercel.json` file in your project root:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures client-side routing works for all routes.

---

### Deploy to Cloudflare Pages

#### Option A: Via Cloudflare Dashboard (Recommended)

1. **Push your code to GitHub/GitLab**

2. **Go to [dash.cloudflare.com](https://dash.cloudflare.com)**

3. **Navigate to Workers & Pages → Pages**

4. **Click "Create a project" → "Connect to Git"**

5. **Select your repository**
   - Authorize Cloudflare to access your GitHub/GitLab
   - Select the `inkwell` repository

6. **Configure build settings**
   - **Project name:** `inkwell` (this becomes `inkwell.pages.dev`)
   - **Production branch:** `main`
   - **Framework preset:** None
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (leave empty)

7. **Add Environment Variables**
   - Expand "Environment variables (advanced)"
   - Click "Add variable" for each:
     ```
     Variable name: VITE_SUPABASE_URL
     Value: https://YOUR_PROJECT_REF.supabase.co
     
     Variable name: VITE_SUPABASE_PUBLISHABLE_KEY
     Value: eyJhbGciOiJIUzI1NiIsIn...
     
     Variable name: VITE_SUPABASE_PROJECT_ID
     Value: YOUR_PROJECT_REF
     ```

8. **Click "Save and Deploy"**

9. **Wait for the build** (2-5 minutes)

10. **Your site is live** at `https://inkwell.pages.dev`

#### Option B: Via Wrangler CLI

```bash
# Step 1: Install Wrangler CLI
npm install -g wrangler

# Step 2: Login to Cloudflare
wrangler login

# Step 3: Build your project
npm run build

# Step 4: Create and deploy the project
wrangler pages project create inkwell

# Step 5: Deploy
wrangler pages deploy dist --project-name=inkwell
```

#### SPA Routing Fix for Cloudflare Pages

Cloudflare Pages needs a `_redirects` file in the `public/` folder:

Create `public/_redirects`:
```
/*    /index.html   200
```

This ensures all routes serve the SPA correctly.

#### Adding a Custom Domain on Cloudflare Pages

1. Go to Workers & Pages → your project
2. Click **Custom domains** tab
3. Click **Set up a custom domain**
4. Enter your domain
5. Click **Activate domain**
6. If your domain is already on Cloudflare DNS, it's automatic
7. If not, add the provided CNAME record to your DNS provider

---

### Deploy to Render

#### Option A: Via Render Dashboard (Recommended)

1. **Push your code to GitHub/GitLab**

2. **Go to [render.com](https://render.com) and sign in**

3. **Click "New +" → "Static Site"**

4. **Connect your repository**
   - Click "Connect account" for GitHub/GitLab
   - Select the `inkwell` repository

5. **Configure the static site**
   - **Name:** `inkwell` (or your preferred name)
   - **Branch:** `main`
   - **Root Directory:** (leave empty)
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

6. **Add Environment Variables**
   - Scroll down to "Environment Variables"
   - Click "Add Environment Variable" for each:
     ```
     Key: VITE_SUPABASE_URL
     Value: https://YOUR_PROJECT_REF.supabase.co
     
     Key: VITE_SUPABASE_PUBLISHABLE_KEY
     Value: eyJhbGciOiJIUzI1NiIsIn...
     
     Key: VITE_SUPABASE_PROJECT_ID
     Value: YOUR_PROJECT_REF
     ```

7. **Click "Create Static Site"**

8. **Wait for deployment** (3-5 minutes)

9. **Your site is live** at `https://inkwell.onrender.com`

#### SPA Routing Fix for Render

In Render dashboard:
1. Go to your static site → **Redirects/Rewrites**
2. Add a rewrite rule:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** `Rewrite`

#### Adding a Custom Domain on Render

1. Go to your static site → **Settings** → **Custom Domains**
2. Click **Add Custom Domain**
3. Enter your domain
4. Add the DNS records shown:
   - For apex: `A` record to Render's IP
   - For subdomain: `CNAME` record to `*.onrender.com`
5. Render auto-provisions SSL

---

### Deploy to Netlify

#### Option A: Via Netlify Dashboard

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Go to [app.netlify.com](https://app.netlify.com)**

3. **Click "Add new site" → "Import an existing project"**

4. **Connect to your Git provider and select the repository**

5. **Configure build settings**
   - **Branch to deploy:** `main`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

6. **Click "Show advanced" → "New variable"**
   - Add all three environment variables (same as other platforms)

7. **Click "Deploy site"**

#### SPA Routing Fix for Netlify

Create `public/_redirects`:
```
/*    /index.html   200
```

Or create `netlify.toml` in project root:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Deploy to VPS / Self-Hosted

For deploying on a VPS (DigitalOcean, Linode, AWS EC2, etc.):

#### Step 1: Set Up the Server

```bash
# Connect to your server
ssh user@your-server-ip

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install nginx (web server)
sudo apt install -y nginx

# Install certbot for SSL (optional but recommended)
sudo apt install -y certbot python3-certbot-nginx
```

#### Step 2: Clone and Build

```bash
# Clone your repository
cd /var/www
sudo git clone https://github.com/YOUR_USERNAME/inkwell.git
cd inkwell

# Set ownership
sudo chown -R $USER:$USER /var/www/inkwell

# Install dependencies
npm install

# Create .env file
cp .env.example .env
nano .env
# Fill in your Supabase credentials and save (Ctrl+X, Y, Enter)

# Build for production
npm run build
```

#### Step 3: Configure Nginx

```bash
# Create nginx config
sudo nano /etc/nginx/sites-available/inkwell
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/inkwell/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback — serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/inkwell /etc/nginx/sites-enabled/

# Remove default nginx site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

#### Step 4: Set Up SSL (HTTPS)

```bash
# Get SSL certificate from Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
#   Enter email → your@email.com
#   Agree to terms → Y
#   Share email → N (optional)
#   Redirect HTTP to HTTPS → 2 (Redirect)

# Verify auto-renewal
sudo certbot renew --dry-run
```

#### Step 5: Set Up Auto-Deployment (Optional)

Create a deploy script:

```bash
nano /var/www/inkwell/deploy.sh
```

```bash
#!/bin/bash
cd /var/www/inkwell
git pull origin main
npm install
npm run build
echo "Deployed at $(date)"
```

```bash
chmod +x /var/www/inkwell/deploy.sh
```

Run whenever you push new code:
```bash
/var/www/inkwell/deploy.sh
```

---

## Admin Setup

### First-Time Admin Login

1. Make sure you've run the `setup-admin` edge function (see [Step 7 of Supabase Setup](#step-7-create-admin-user))
2. Navigate to `/admin/login` on your deployed site
3. Login with:
   - **Email:** `admin@inkwell.blog`
   - **Password:** `admin1234`
4. **Immediately change your credentials:**
   - Go to Admin → Settings → Account
   - Update your email
   - Update your password

### Admin Features

| Feature | Path | Description |
|---------|------|-------------|
| Dashboard | `/admin` | Overview and stats |
| Analytics | `/admin/analytics` | Traffic and view analytics |
| Posts | `/admin/posts` | Create, edit, delete posts |
| Post Editor | `/admin/posts/new` | Rich text editor with image upload |
| Comments | `/admin/comments` | Moderate and reply to comments |
| Categories | `/admin/categories` | Manage post categories |
| Link Shortener | `/admin/link-shortener` | Create and manage shortened links |
| Settings | `/admin/settings` | Site branding, SEO, social, account |

---

## Troubleshooting

### Common Issues

#### "Failed to fetch" or Network Errors
- ✅ Check that your `.env` values are correct
- ✅ Ensure your Supabase project is running (not paused)
- ✅ Verify the anon key matches your project

#### "Row Level Security policy violation"
- ✅ Make sure you ran the complete `database.sql` script
- ✅ Verify RLS policies exist on all tables (Supabase Dashboard → Authentication → Policies)
- ✅ Ensure you're logged in as admin for write operations

#### Routes Return 404 on Refresh
- ✅ Add the SPA rewrite/redirect rules for your hosting platform (see deployment sections above)
- ✅ This is a client-side routing issue — all routes need to serve `index.html`

#### Admin Login Doesn't Work
- ✅ Make sure the `setup-admin` edge function was deployed and called
- ✅ Check that `user_roles` table has a row with `role = 'admin'`
- ✅ Verify the user exists in Authentication → Users

#### Images Don't Upload
- ✅ Check that the `thumbnails` storage bucket exists and is public
- ✅ Verify storage policies allow authenticated uploads

#### Edge Function Errors
- ✅ Check that edge functions are deployed: `supabase functions list`
- ✅ View edge function logs: `supabase functions logs increment-link-click`
- ✅ Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` secrets are set

### Getting Help

- Open an issue on the GitHub repository
- Check the [Supabase documentation](https://supabase.com/docs)
- Review the [Vite documentation](https://vitejs.dev/)

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| [React 18](https://react.dev) | UI framework |
| [TypeScript](https://typescriptlang.org) | Type safety |
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com) | Component library |
| [Supabase](https://supabase.com) | Database, auth, storage, edge functions |
| [Framer Motion](https://framer.com/motion) | Animations |
| [TanStack Query](https://tanstack.com/query) | Data fetching & caching |
| [React Router](https://reactrouter.com) | Client-side routing |
| [Tiptap](https://tiptap.dev) | Rich text editor |
| [Recharts](https://recharts.org) | Analytics charts |
| [React Helmet Async](https://github.com/staylor/react-helmet-async) | SEO meta tags |

---

## License

This project is open source. Feel free to use, modify, and distribute.
