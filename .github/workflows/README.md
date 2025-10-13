# GitHub Actions Workflows

This directory contains automated workflows that keep superpatch.gg up-to-date with the latest SUPERVIVE patch data.

## 📋 Workflows Overview

### 1. Auto Patch Scraper & Deploy (`auto-patch-scraper.yml`)

**Purpose:** Automatically scrapes Steam RSS feed for new SUPERVIVE patches and deploys updates to GitHub Pages.

**Triggers:**
- 🕐 **Scheduled:** Every 6 hours (0:00, 6:00, 12:00, 18:00 UTC)
- 🖱️ **Manual:** Via Actions tab "Run workflow" button
- 📝 **Push:** When patches.json or HTML files are updated

**What it does:**
1. Fetches latest patch notes from Steam RSS feed
2. Parses and structures the data using smart parser
3. Detects new patches by comparing with existing data
4. Auto-commits new patch data to main branch
5. Creates GitHub Issues with update notifications
6. Deploys updated site to GitHub Pages

**Permissions Required:**
- ✅ `contents: write` - To commit patch data
- ✅ `pages: write` - To deploy to GitHub Pages
- ✅ `id-token: write` - For GitHub Pages deployment
- ✅ `issues: write` - To create notification issues

**Outputs:**
- ✅ Success Issue: Created when new patches are detected and committed
- ❌ Failure Issue: Created when scraper encounters errors
- 📊 Scraper Logs: Uploaded as workflow artifacts (7 day retention)

---

### 2. Deploy to GitHub Pages (`deploy.yml`)

**Purpose:** Simple deployment workflow for manual site updates.

**Triggers:**
- 📝 **Push:** Any push to main branch
- 🖱️ **Manual:** Via Actions tab

**What it does:**
1. Checks out the repository
2. Configures GitHub Pages
3. Uploads site content
4. Deploys to GitHub Pages

**Use Cases:**
- Manual site deployments
- Testing deployment process
- Recovering from failed deployments
- Deploying non-patch content updates

---

### 3. Site Health Check (`health-check.yml`)

**Purpose:** Monitors site health and data integrity.

**Triggers:**
- 🕐 **Scheduled:** Daily at midnight UTC
- 🖱️ **Manual:** Via Actions tab

**What it does:**
1. ✅ Validates patches.json structure and schema
2. 🌐 Checks GitHub Pages site accessibility
3. 📡 Verifies Steam RSS feed availability
4. 📊 Counts and validates patch entries
5. 🚨 Creates issues if any checks fail
6. 📁 Uploads health report as artifact

**Health Checks:**
- JSON file existence and validity
- Required field presence (id, title, date, version, etc.)
- Site HTTP response code (should be 200)
- Steam RSS feed accessibility

---

## 🚀 Setup Instructions

### Prerequisites

1. **GitHub Pages Enabled**
   - Go to repository Settings → Pages
   - Source: "GitHub Actions"
   - Save

2. **Workflow Permissions**
   - Go to Settings → Actions → General
   - Workflow permissions: "Read and write permissions"
   - Allow GitHub Actions to create issues: ✅ Enabled
   - Save

3. **Dependencies Installed**
   - Ensure `package.json` includes all required dependencies
   - `node-fetch` for HTTP requests
   - `natural` for NLP parsing
   - Other scraper dependencies

### First-Time Setup

1. **Enable Workflows**
   ```bash
   # Workflows are enabled by default
   # To manually trigger first run:
   # Go to Actions tab → Select workflow → Run workflow
   ```

2. **Verify Scraper Works**
   ```bash
   # Test locally first
   npm install
   npm run scrape
   ```

3. **Check First Run**
   - Go to Actions tab
   - Watch "Auto Patch Scraper & Deploy" workflow
   - Verify it completes successfully
   - Check if GitHub Issue was created

---

## 🔧 Configuration

### Adjust Scraper Frequency

Edit `.github/workflows/auto-patch-scraper.yml`:

```yaml
schedule:
  # Run every 6 hours (current)
  - cron: '0 */6 * * *'

  # Run every 3 hours
  - cron: '0 */3 * * *'

  # Run every hour
  - cron: '0 * * * *'

  # Run twice daily (8am and 8pm UTC)
  - cron: '0 8,20 * * *'
```

### Customize Notifications

Edit the issue creation sections to customize:
- Issue titles
- Issue body content
- Labels applied
- Who gets notified

---

## 📊 Monitoring

### View Workflow Status

1. Go to **Actions** tab
2. Select a workflow on the left
3. View recent runs and their status

### Check Workflow Logs

1. Click on a workflow run
2. Click on a job (e.g., "scrape-patches")
3. Expand steps to see detailed logs

### Download Artifacts

1. Go to completed workflow run
2. Scroll to "Artifacts" section
3. Download:
   - `scraper-logs` - Detailed scraper output
   - `health-report` - Health check results

---

## 🐛 Troubleshooting

### Workflow Not Running

**Problem:** Scheduled workflow doesn't run
**Solutions:**
- Check if repository has recent activity (GitHub may disable workflows)
- Manually trigger workflow to reactivate
- Verify cron syntax is correct

### Scraper Fails to Commit

**Problem:** Scraper finds patches but can't commit
**Solutions:**
- Check workflow permissions (Settings → Actions → General)
- Ensure `GITHUB_TOKEN` has write access
- Verify git configuration in workflow

### GitHub Pages Not Updating

**Problem:** Deployment succeeds but site shows old content
**Solutions:**
- Wait 5-10 minutes for CDN cache to clear
- Check Pages settings (Settings → Pages)
- Verify Pages source is "GitHub Actions"
- Force browser cache refresh (Ctrl+F5)

### Steam RSS Feed Unreachable

**Problem:** Health check reports RSS feed offline
**Solutions:**
- Check if Steam is down or rate-limiting
- Wait and retry (transient network issues)
- Verify RSS URL is correct in scraper script

### JSON Validation Fails

**Problem:** Health check reports invalid JSON
**Solutions:**
- Review recent commits to patches.json
- Validate JSON syntax manually
- Check scraper logs for parsing errors
- Restore from previous working commit if needed

---

## 🔐 Security

### Secrets and Tokens

- `GITHUB_TOKEN` is automatically provided by GitHub Actions
- No additional secrets needed for basic operation
- If using external APIs (e.g., Hugging Face), add secrets:
  1. Go to Settings → Secrets → Actions
  2. Add new repository secret
  3. Reference in workflow: `${{ secrets.SECRET_NAME }}`

### Permissions Best Practices

- Workflows use minimal required permissions
- `contents: write` only for committing data
- `issues: write` only for creating notifications
- Token expires after workflow completes

---

## 📈 Future Improvements

### Potential Enhancements

- [ ] Add Discord/Slack notifications for new patches
- [ ] Implement diff viewer for patch changes
- [ ] Add automated testing before deployment
- [ ] Create backup/restore workflow
- [ ] Add analytics tracking
- [ ] Implement A/B testing for UI changes

### Adding New Features

To add a new workflow:

1. Create new `.yml` file in `.github/workflows/`
2. Define triggers, permissions, and jobs
3. Test thoroughly with manual triggers
4. Monitor first scheduled runs
5. Document in this README

---

## 🆘 Support

### Getting Help

- **GitHub Docs:** [GitHub Actions Documentation](https://docs.github.com/en/actions)
- **Issues:** Create an issue in this repository
- **Logs:** Always check workflow logs first
- **Community:** SUPERVIVE Discord/Reddit

### Useful Commands

```bash
# Test scraper locally
npm run scrape

# Validate JSON structure
jq empty assets/data/patches.json

# Check for workflow syntax errors
# (GitHub will flag these on commit)

# View recent git commits
git log --oneline -10

# Manually trigger deployment
# Use GitHub Actions tab → Run workflow
```

---

## 📝 Changelog

### 2025-10-13
- ✨ Initial workflow setup
- ✨ Added auto-scraper with deployment
- ✨ Added health check monitoring
- ✨ Added comprehensive documentation

---

**Made with ❤️ for the SUPERVIVE community**
