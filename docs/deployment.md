# Deployment Documentation

## Repository Information

| Property | Value |
|----------|-------|
| **Repository** | `vishnumelur/molvexa` |
| **Visibility** | Private |
| **Platform** | GitHub |
| **URL** | https://github.com/vishnumelur/molvexa |
| **Default Branch** | `main` |

## Live Deployment

| Property | Value |
|----------|-------|
| **Platform** | Vercel |
| **Live URL** | https://molvexa.vercel.app |
| **Auto Deploy** | Yes (on push to main) |

## Git Configuration

### Remote Setup
```bash
# Origin remote
git remote -v
# origin  https://github.com/vishnumelur/molvexa.git (fetch)
# origin  https://github.com/vishnumelur/molvexa.git (push)
```

### Push Commands
```bash
# Standard push (if credentials cached)
git push origin main

# Push with token (replace TOKEN with actual token)
git push https://vishnumelur:TOKEN@github.com/vishnumelur/molvexa.git main
```

## Credentials

**Important:** GitHub Personal Access Token (PAT) should be stored securely and NOT committed to the repository.

Store credentials in one of these locations:
1. **Environment variable:** `GITHUB_TOKEN`
2. **Local file:** `.env.local` (gitignored)
3. **Git credential manager:** `git config --global credential.helper store`

### Local Credentials File
Create `.env.local` in project root:
```env
GITHUB_TOKEN=your_token_here
GITHUB_USERNAME=vishnumelur
```

## Deployment Workflow

1. **Development:** Make changes locally
2. **Test:** Run `npm run build` and `npm run lint`
3. **Commit:** Create commit with descriptive message
4. **Push:** `git push origin main`
5. **Deploy:** Vercel automatically deploys on push

## Current Status

### Completed Stories (Epic 1)
- [x] Story 1.1 - Project Setup
- [x] Story 1.2 - Design System
- [x] Story 1.3 - Home Page
- [x] Story 1.4 - Services Page
- [x] Story 1.5 - About Page

### Commit History
| Commit | Description |
|--------|-------------|
| `9d9d931` | feat(story-1.5): Implement About Page |
| `e7743f5` | docs: Prepare Story 1.5 for development |
| `cde79b1` | feat(story-1.4): Implement Services Page |
| `0d0f330` | feat(story-1.3): Implement Home Page |
| `715b64b` | feat(story-1.2): Design System & Components |

---

*Last updated: 2026-01-15*
