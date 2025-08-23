# Wordy Kids - Production Deployment Guide

## 🚀 Render Deployment Instructions

### Prerequisites

- [Render account](https://render.com) (free tier available)
- Your code pushed to GitHub/GitLab repository
- Environment variables ready

### Step 1: Prepare Your Repository

1. **Commit all deployment files:**
   ```bash
   git add .
   git commit -m "Add production deployment configuration"
   git push origin main
   ```

### Step 2: Create Render Service

1. **Login to Render Dashboard:**

   - Go to [render.com](https://render.com)
   - Sign in with GitHub/GitLab

2. **Create New Web Service:**

   - Click "New +" → "Web Service"
   - Connect your repository (wordy-kids)
   - Choose your repository

3. **Configure Service Settings:**
   - **Name:** `wordy-kids-app`
   - **Environment:** `Node`
   - **Region:** `Oregon (US West)` or closest to your users
   - **Branch:** `main`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Starter` (free tier)

### Step 3: Set Environment Variables

In Render dashboard, go to Environment tab and add:

```
NODE_ENV=production
PBKDF2_ITERATIONS=100000
PBKDF2_KEY_LENGTH=64
PBKDF2_DIGEST=sha512
CORS_ORIGIN=https://wordy-kids-app.onrender.com
PING_MESSAGE=Wordy Kids API is healthy! 🦁
```

**Important:** Replace `wordy-kids-app` with your actual service name.

### Step 4: Deploy

1. **Click "Create Web Service"**
2. **Monitor build logs** in real-time
3. **Wait for deployment** (usually 5-10 minutes)
4. **Service will be available** at: `https://your-service-name.onrender.com`

### Step 5: Configure Custom Domain (Optional)

1. **In Render Dashboard:**
   - Go to Settings → Custom Domains
   - Add your domain (e.g., `wordykids.com`)
   - Follow DNS configuration instructions

## 📋 Post-Deployment Verification Checklist

### Security Verification

- [ ] **Test Signup/Login Flow:**

  ```
  1. Go to https://your-app.onrender.com
  2. Create new account
  3. Open browser DevTools → Application → Local Storage
  4. Verify NO plaintext passwords stored
  5. Check only hashed/encrypted data present
  ```

- [ ] **API Security Check:**
  ```bash
  curl https://your-app.onrender.com/api/ping
  # Should return: {"message":"Wordy Kids API is healthy! 🦁"}
  ```

### Performance Baseline (Lighthouse)

- [ ] **Run Lighthouse Audit:**
  1. Open Chrome DevTools
  2. Go to Lighthouse tab
  3. Run audit for: Performance, Accessibility, SEO, Best Practices
  4. **Record baseline scores:**
     - Performance: \_\_\_/100
     - Accessibility: \_\_\_/100
     - SEO: \_\_\_/100
     - Best Practices: \_\_\_/100

### Builder.io Assets Verification

- [ ] **Check Media Loading:**

  ```
  1. Navigate through app features
  2. Verify all images load correctly
  3. Test sound effects work
  4. Check animations render properly
  5. Verify no broken asset links in console
  ```

- [ ] **Console Error Check:**
  ```
  1. Open DevTools → Console
  2. Navigate through all major features
  3. Verify no 404 errors for assets
  4. Confirm no JavaScript errors
  ```

### Health Check

- [ ] **Service Health:**
  ```bash
  curl https://your-app.onrender.com/health
  # Should return: {"status":"healthy","timestamp":"...","service":"wordy-kids-app"}
  ```

## 🔄 Rollback Plan

### If Deployment Fails:

1. **Check Build Logs:**

   - Go to Render Dashboard → Your Service → Events
   - Review build/deploy logs for errors

2. **Immediate Rollback:**

   ```bash
   # Option 1: Revert to previous commit
   git revert HEAD
   git push origin main
   # Render will auto-deploy previous version

   # Option 2: Deploy specific commit
   # In Render Dashboard:
   # Settings → Deploy → Manual Deploy → Enter commit SHA
   ```

3. **Emergency Fixes:**
   ```bash
   # Quick fix for critical issues
   git checkout main
   # Make minimal fix
   git add .
   git commit -m "hotfix: critical production issue"
   git push origin main
   ```

### Downtime Mitigation:

- Render provides **zero-downtime deployments**
- Old version runs until new version is healthy
- Built-in health checks prevent bad deployments

## 🏗️ Next Phase: Builder.io Integration

### Phase 2 Setup:

1. **Install Builder.io SDK:**

   ```bash
   npm install @builder.io/react @builder.io/sdk
   ```

2. **Register Components:**

   ```typescript
   // client/lib/builder-registry.ts
   import { Builder } from "@builder.io/react";
   import { WordCard } from "@/components/WordCard";
   import { GameHub } from "@/components/games/GameHub";

   Builder.registerComponent(WordCard, {
     name: "WordCard",
     inputs: [
       { name: "word", type: "string" },
       { name: "difficulty", type: "string" },
     ],
   });

   Builder.registerComponent(GameHub, {
     name: "GameHub",
     inputs: [{ name: "gameType", type: "string" }],
   });
   ```

3. **Add BuilderComponent:**

   ```typescript
   // client/components/BuilderContent.tsx
   import { BuilderComponent } from '@builder.io/react';

   export function BuilderContent({ model = 'page' }) {
     return (
       <BuilderComponent
         model={model}
         apiKey={import.meta.env.VITE_BUILDER_IO_API_KEY}
       />
     );
   }
   ```

4. **Environment Variables:**
   ```
   # Add to Render environment:
   VITE_BUILDER_IO_API_KEY=your_builder_io_api_key
   BUILDER_IO_SPACE_ID=your_space_id
   ```

### Benefits of Builder.io Integration:

- **Content Management:** Update app content without code deployment
- **A/B Testing:** Test different learning experiences
- **Visual Editor:** Non-technical team members can edit content
- **Performance:** CDN-optimized content delivery
- **Analytics:** Built-in performance and engagement tracking

## 🔍 Monitoring & Maintenance

### Recommended Tools:

- **Error Tracking:** Add Sentry for production error monitoring
- **Analytics:** Google Analytics or Mixpanel for user behavior
- **Uptime Monitoring:** UptimeRobot for service availability
- **Performance:** Web Vitals monitoring

### Regular Maintenance:

- [ ] Weekly dependency updates
- [ ] Monthly security audits
- [ ] Quarterly performance reviews
- [ ] Backup strategy implementation

## 📞 Support

- **Render Issues:** [Render Documentation](https://render.com/docs)
- **Builder.io Setup:** [Builder.io Docs](https://www.builder.io/c/docs)
- **App Issues:** Check logs in Render Dashboard

---

✅ **Deployment Complete!** Your Wordy Kids app is now running in production with enterprise-grade security and scalability.
