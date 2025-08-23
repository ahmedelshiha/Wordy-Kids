# 🚀 Wordy Kids Deployment Checklist

## Pre-Deployment (5 minutes)

- [ ] **Backup current version**

  - Note current app URL that's working
  - Take screenshot of working app

- [ ] **Code is ready**
  - All files are saved
  - No obvious errors in browser console during testing

## Render Deployment (15 minutes)

### 1. Connect Repository

- [ ] Login to [render.com](https://render.com)
- [ ] Click "New +" → "Web Service"
- [ ] Connect your GitHub repository
- [ ] Select the "wordy-kids" repository

### 2. Configure Service

Copy these settings exactly:

```
Name: wordy-kids-app
Environment: Node
Region: Oregon (US West)
Branch: main
Build Command: npm run build
Start Command: npm start
Instance Type: Starter (Free)
```

### 3. Add Environment Variables

Click "Advanced" → "Add Environment Variable" for each:

```
NODE_ENV = production
PBKDF2_ITERATIONS = 100000
PBKDF2_KEY_LENGTH = 64
PBKDF2_DIGEST = sha512
PING_MESSAGE = Wordy Kids API is healthy! 🦁
```

⚠️ **Important:** After creating the service, add one more variable:

```
CORS_ORIGIN = https://YOUR-SERVICE-NAME.onrender.com
```

(Replace YOUR-SERVICE-NAME with the actual name Render gives you)

### 4. Deploy

- [ ] Click "Create Web Service"
- [ ] Watch build logs (should take 5-10 minutes)
- [ ] Wait for "Deploy succeeded" message
- [ ] Copy the app URL (e.g., https://wordy-kids-app.onrender.com)

## Post-Deployment Testing (10 minutes)

### Automated Test

```bash
node scripts/verify-deployment.js https://YOUR-APP-URL.onrender.com
```

### Manual Security Check

1. [ ] Open your app URL
2. [ ] Create a new account with test email/password
3. [ ] Press F12 → Application tab → Local Storage
4. [ ] Verify NO plaintext passwords visible
5. [ ] Login/logout should work normally

### Performance Check

1. [ ] Press F12 → Lighthouse tab
2. [ ] Click "Generate report"
3. [ ] Record scores:
   - Performance: \_\_\_/100
   - Accessibility: \_\_\_/100
   - SEO: \_\_\_/100
   - Best Practices: \_\_\_/100

### Features Check

- [ ] App loads completely
- [ ] No broken images or sounds
- [ ] Games/features work as expected
- [ ] No red errors in browser console

## If Something Goes Wrong 🚨

### Common Issues & Fixes

**Build Failed:**

1. Check Render logs for error details
2. Common fix: In Render dashboard, Environment → Add:
   ```
   NPM_CONFIG_PRODUCTION = false
   ```

**App Won't Start:**

1. Verify environment variables are set correctly
2. Check Start Command is: `npm start`
3. Verify Build Command is: `npm run build`

**Immediate Rollback:**

1. Go to Render Dashboard → Your Service
2. Settings → Deploy
3. Click "Redeploy" on last working version

**Emergency Contact:**

- Check DEPLOYMENT_GUIDE.md for detailed troubleshooting
- Render Support: help@render.com
- Save error messages/screenshots

## Success! ✅

When all checks pass:

- [ ] Update team with new production URL
- [ ] Schedule regular health checks
- [ ] Plan Builder.io integration (Phase 2)

**Production URL:** ******\_\_\_\_******

**Deployment Date:** ******\_\_\_\_******

**Performance Baseline Scores:** P**_ A_** S**_ BP_**

---

🎉 **Congratulations!** Wordy Kids is now live in production with enterprise security.
