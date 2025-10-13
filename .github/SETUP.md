# GitHub Actions Setup Guide

Complete guide to setting up automated workflows for superpatch.gg

## 📋 Prerequisites

Before enabling GitHub Actions, ensure you have:

- ✅ Repository owner/admin access
- ✅ GitHub Pages enabled
- ✅ Node.js dependencies installed locally (for testing)

## 🚀 Quick Setup (5 minutes)

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top navigation)
3. Scroll down to **Pages** (left sidebar)
4. Under "Source", select **GitHub Actions**
5. Click **Save**

![GitHub Pages Setup](https://docs.github.com/assets/cb-35006/images/help/pages/publishing-source-drop-down.png)

### Step 2: Configure Workflow Permissions

1. Still in **Settings**, click **Actions** → **General** (left sidebar)
2. Scroll to "Workflow permissions"
3. Select **"Read and write permissions"**
4. Check ✅ **"Allow GitHub Actions to create and approve pull requests"**
5. Click **Save**

### Step 3: Enable Issues for Notifications

1. In **Settings**, go to **General**
2. Ensure "Issues" is checked under "Features"
3. This allows workflows to create notification issues

### Step 4: Verify Workflows Exist

1. Navigate to `.github/workflows/` directory
2. Verify these files exist:
   - `auto-patch-scraper.yml` - Main automation workflow
   - `deploy.yml` - Deployment workflow
   - `health-check.yml` - Health monitoring

### Step 5: First Manual Run

1. Go to **Actions** tab
2. Click **"Auto Patch Scraper & Deploy"** (left sidebar)
3. Click **"Run workflow"** button (right side)
4. Select branch: `main`
5. Click green **"Run workflow"** button
6. Wait for completion (2-3 minutes)

✅ **Setup Complete!** Your workflows are now active.

---

## 🔍 Verification Steps

### Verify Scraper Works

1. Go to **Actions** tab
2. Click on the most recent workflow run
3. Click **"scrape-patches"** job
4. Check all steps have green checkmarks ✅
5. Look for "No changes detected" or "Changes detected!" message

### Verify Deployment Works

1. Wait 2-3 minutes after workflow completes
2. Visit your GitHub Pages URL:
   ```
   https://[your-username].github.io/superpatch.gg/
   ```
3. Verify site loads correctly
4. Check if patch data displays

### Verify Issue Creation

1. Go to **Issues** tab
2. Look for an issue created by `github-actions[bot]`
3. Issue titles will be:
   - ✅ "New SUPERVIVE Patch Data Auto-Updated" (success)
   - ❌ "Patch Scraper Failed" (failure)

---

## 📅 Schedule Overview

After setup, workflows run automatically:

| Workflow | Frequency | Purpose |
|----------|-----------|---------|
| Auto Patch Scraper | Every 6 hours | Check for new patches |
| Health Check | Daily at midnight | Monitor site health |
| Deploy | On push to main | Deploy site updates |

---

## 🎯 Testing the Scraper

### Test Locally First

Before relying on automation, test the scraper locally:

```bash
# Install dependencies
npm install

# Run scraper manually
npm run scrape

# Check output
cat assets/data/patches.json | head -50
```

### Force Test on GitHub

To test without waiting for schedule:

1. Go to **Actions** tab
2. Select **"Auto Patch Scraper & Deploy"**
3. Click **"Run workflow"**
4. Observe the run in real-time

---

## 🔧 Configuration

### Change Scraper Frequency

Edit [`.github/workflows/auto-patch-scraper.yml`](.github/workflows/auto-patch-scraper.yml):

```yaml
schedule:
  # Current: Every 6 hours
  - cron: '0 */6 * * *'

  # Option 1: Every 3 hours
  - cron: '0 */3 * * *'

  # Option 2: Every hour
  - cron: '0 * * * *'

  # Option 3: Specific times (8am, 2pm, 8pm UTC)
  - cron: '0 8,14,20 * * *'
```

**Note:** GitHub may delay scheduled workflows by up to 15 minutes during peak times.

### Customize Notifications

Edit the issue creation sections in workflows to customize:

- **Title format**: Change issue titles
- **Body content**: Modify issue descriptions
- **Labels**: Add/remove labels for organization
- **Assignees**: Auto-assign to team members

Example:
```yaml
title: '🎮 Custom Title Here'
labels: ['custom-label', 'patch-update']
assignees: ['your-username']
```

---

## 🐛 Troubleshooting

### "Workflow not found" error

**Cause:** Workflow files aren't in the correct location

**Solution:**
- Ensure files are in `.github/workflows/` directory
- Check file extensions are `.yml` not `.yaml`
- Commit and push workflow files to main branch

### "Permission denied" errors

**Cause:** Insufficient workflow permissions

**Solution:**
1. Settings → Actions → General
2. Workflow permissions: "Read and write"
3. Enable "create and approve pull requests"
4. Save changes

### Scraper finds no changes

**Possible causes:**
- No new patches published on Steam
- Last run was recent and patches already detected
- RSS feed temporarily unavailable

**Normal behavior:**
- "No changes detected" is expected when no new patches exist
- Workflow completes successfully (green checkmark)

### Deployment succeeds but site not updating

**Cause:** Browser/CDN cache

**Solutions:**
1. Wait 5-10 minutes for CDN propagation
2. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)
3. Clear browser cache
4. Try incognito/private window

### Workflow doesn't run on schedule

**Cause:** Repository inactivity or GitHub restrictions

**Solutions:**
- Public repos: Workflows may pause after 60 days of no commits
- Private repos: May have different limits
- Solution: Make a commit or run workflow manually to reactivate

---

## 🔐 Security Best Practices

### Token Security

- ✅ `GITHUB_TOKEN` is auto-provided and secure
- ✅ Expires after workflow completes
- ✅ Scoped to repository only
- ❌ **Never** commit actual tokens to repository

### External API Keys

If using external APIs (Hugging Face, Discord webhooks, etc.):

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add your secret:
   - Name: `API_KEY_NAME`
   - Value: `your-actual-key`
4. Reference in workflow:
   ```yaml
   env:
     API_KEY: ${{ secrets.API_KEY_NAME }}
   ```

### Permissions Audit

Regularly review workflow permissions:
- Only grant minimum required permissions
- Review Actions logs for suspicious activity
- Monitor who can trigger workflows

---

## 📊 Monitoring & Maintenance

### Weekly Checks

- ✅ Check Actions tab for failed workflows
- ✅ Review issues created by automation
- ✅ Verify site is displaying latest data
- ✅ Check scraper logs for warnings

### Monthly Maintenance

- 🔍 Review workflow execution times
- 🔍 Audit dependencies for updates
- 🔍 Check GitHub Pages storage usage
- 🔍 Review and close old automation issues

### Logs & Artifacts

Access detailed logs:
1. Actions tab → Select workflow run
2. Click on job name
3. Expand steps to see detailed output
4. Download artifacts (scraper-logs, health-reports)

---

## 🎓 Learning Resources

### GitHub Actions Documentation
- [Official Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [GitHub Pages Deploy](https://github.com/marketplace/actions/deploy-to-github-pages)

### Cron Schedule Helper
- [Crontab Guru](https://crontab.guru/) - Interactive cron editor
- [Cron Expression Generator](https://crontab.cronhub.io/)

### YAML Syntax
- [YAML Validator](https://www.yamllint.com/)
- [Learn YAML in 5 minutes](https://learnxinyminutes.com/docs/yaml/)

---

## 🆘 Getting Help

### Common Issues
1. Check [Troubleshooting](#-troubleshooting) section above
2. Review workflow logs in Actions tab
3. Check [GitHub Status](https://www.githubstatus.com/)

### Create an Issue
If you encounter problems:
1. Go to Issues tab
2. Click "New issue"
3. Include:
   - What you tried to do
   - What happened
   - Workflow run URL
   - Error messages from logs

### Community Support
- **GitHub Discussions** - Ask questions
- **SUPERVIVE Discord** - Community help
- **Stack Overflow** - Technical questions

---

## ✅ Checklist

Before going live, ensure:

- [ ] GitHub Pages is configured for "GitHub Actions"
- [ ] Workflow permissions are "Read and write"
- [ ] Issues are enabled for notifications
- [ ] All 3 workflow files exist in `.github/workflows/`
- [ ] Scraper tested locally with `npm run scrape`
- [ ] First workflow run completed successfully
- [ ] Site is accessible at GitHub Pages URL
- [ ] Issues are being created by automation
- [ ] Deployment workflow succeeded
- [ ] Health check workflow passed

---

## 🎉 Success!

Your automated patch scraping system is now live!

**What happens next:**
1. ⏰ Every 6 hours, scraper checks for new patches
2. 📊 New patches are automatically added to JSON
3. 🚀 Site deploys with updated data
4. 📬 You get notified via GitHub Issues
5. ✅ Daily health checks ensure everything works

**No manual intervention needed!** 🎊

---

**Questions?** Open an issue or check [Workflows Documentation](workflows/README.md)
