# glass-ripple Launch Playbook

Step-by-step guide for maximizing reach on launch day.

---

## Pre-Launch Checklist

Before posting anywhere, verify:

- [ ] Demo site is live: https://zenalexa.github.io/glass-ripple/
- [ ] npm package is published: `npm info glass-ripple`
- [ ] GitHub repo is public with README, LICENSE, demo.gif
- [ ] `demo.gif` renders correctly on GitHub (check README preview)
- [ ] All promotional copy is ready (this `/promo` directory)
- [ ] You have accounts on: Twitter/X, Reddit, Hacker News, Dev.to
- [ ] Reddit account has enough karma to post (if new account, engage for a few days first)

---

## Launch Day Schedule

### Optimal Day: Tuesday, Wednesday, or Thursday

Avoid Monday (people clearing weekend backlog) and Friday (checked-out mode).

### Timeline (all times US Eastern / ET)

| Time (ET) | Action | Platform |
|-----------|--------|----------|
| 8:00 AM | Submit Show HN post | Hacker News |
| 8:30 AM | Post Twitter thread (attach demo.gif to Tweet 1) | Twitter/X |
| 10:00 AM | Post to r/webdev | Reddit |
| 12:00 PM | Post to r/javascript | Reddit |
| 2:00 PM | Post to r/threejs | Reddit |
| 3:00 PM | Publish Dev.to article | Dev.to |
| 5:00 PM | Cross-post to LinkedIn (professional angle) | LinkedIn |
| Evening | Share in Discord servers | Discord |

### Why This Order

1. **HN first** — HN has the highest ROI per impression and rewards early-morning posts. Technical audience that drives GitHub stars.
2. **Twitter simultaneously** — Visual platform, the GIF will carry. Different audience from HN.
3. **Reddit staggered** — Three separate communities, staggered to avoid Reddit's spam detection. Biggest audience (r/webdev) first.
4. **Dev.to later** — Article takes longer to read; afternoon readers are more likely to engage with long-form content.
5. **LinkedIn last** — Professional audience browses end-of-day.

---

## Platform-Specific Tips

### Hacker News

- **Title format:** "Show HN: Glass Ripple – 11-pass WebGL2 hero effect with 52 AI brand icons"
- Submit as a **URL post** pointing to GitHub (not the demo site — HN prefers source code)
- NO superlatives, NO emojis, NO "amazing" or "stunning"
- Respond to every technical question within 30 minutes — HN rewards engaged OPs
- If someone says "why not just use Three.js EffectComposer?" — be honest: glass-ripple packages the pipeline into a reusable component with a clean API and pre-built icon presets
- If the post doesn't get traction, you can resubmit once after a day or two (HN allows this)
- DO NOT ask anyone to upvote

### Reddit

- **Post type:** Self-post (text), NOT link post — link posts get flagged as self-promotion
- Use the exact titles from `reddit-posts.md`
- Engage with EVERY comment in the first 2 hours — Reddit's algorithm heavily weights early engagement
- Be humble: "I built this thing, would love feedback" — not "check out my amazing library"
- Do NOT cross-reference your posts across subreddits
- Do NOT post to all three at exactly the same time — stagger by 2 hours minimum
- If comments ask for improvements, respond positively and create GitHub issues

### Twitter/X

- **Attach demo.gif to Tweet 1** — visual content gets 2-4x more engagement
- Pin the thread to your profile
- 2-3 hours after posting, quote-tweet Tweet 1 with a different angle (e.g., "the CRT effect is my favorite part")
- Tag relevant accounts in a REPLY (not the main tweet): @threejs_org, @veraboratory
- Use hashtags on the last tweet only (or sparingly) — too many hashtags reduce engagement
- If the thread gets traction, post a follow-up thread diving deeper into one aspect (e.g., "How I built the wave simulation")

### Dev.to

- **Tags:** webgl, javascript, threejs, opensource
- Use the `cover_image` frontmatter pointing to the demo.gif
- Dev.to articles get indexed by Google — good for long-term SEO
- Cross-post to Hashnode and Medium if you have accounts there
- Engage with comments — Dev.to sends notification emails to commenters

### LinkedIn

- Write a 3-4 paragraph post (not the full article)
- Focus on the "building in public" angle — "I built an open source library..."
- Mention it's MIT licensed and you're looking for contributors
- Tag anyone you know in the AI/frontend space
- LinkedIn algorithm favors posts without external links — put the GitHub URL in the first comment, not the post body

---

## Discord Servers to Share In

Post a brief message with the demo GIF in the relevant channels:

| Server | Channel | Notes |
|--------|---------|-------|
| Three.js Discord | #showcase | Primary audience for WebGL work |
| WebGL/GPU Discord | #projects | Technical audience |
| Reactiflux | #show-off | Large frontend community |
| TypeScript Discord | #showcase | TS-first library angle |
| AI/ML communities | Varies | Focus on the icon presets angle |
| Indie Hackers | Varies | "Building in public" angle |

Keep Discord messages short: 2-3 sentences + demo GIF + GitHub link.

---

## Newsletter Submissions

Submit to these newsletters (they have submission forms or email addresses):

| Newsletter | Audience | Submit URL / Contact |
|------------|----------|---------------------|
| JavaScript Weekly | JS devs | https://cooperpress.com/submit |
| Frontend Focus | Frontend devs | https://cooperpress.com/submit |
| WebGL Weekly | WebGL/3D devs | Check their submission process |
| Bytes.dev | JS devs | https://bytes.dev |
| TLDR Newsletter | Tech general | https://tldr.tech/submit |
| Console.dev | Open source tools | https://console.dev |

Submit 1-2 days before launch day so they can include it in the next issue.

---

## Engagement Playbook (First 48 Hours)

### Hour 0-2: Maximum Engagement Mode
- Monitor all platforms constantly
- Respond to every comment within 15 minutes
- Be authentic, humble, and technically precise
- If someone finds a bug, thank them and create a GitHub issue immediately

### Hour 2-6: Sustained Engagement
- Check every 30 minutes
- Share the best comments/feedback on Twitter (with attribution)
- If HN is on the front page, keep responding — this is your highest-leverage time

### Hour 6-24: Follow-Up
- Post the Discord/community shares
- If Reddit posts are doing well, respond to any new comments
- Like/heart all positive comments

### Hour 24-48: Capitalize
- Write a "thank you" tweet if the launch went well
- If Dev.to article has comments, respond
- Check GitHub issues — first-time contributors may have opened PRs
- Update README if feedback revealed unclear documentation

---

## Metrics to Track

### Before Launch (Baseline)
Record these numbers the night before:
- GitHub stars
- npm weekly downloads
- GitHub repo traffic (enable in repo settings → Insights → Traffic)

### During Launch (Real-Time)
- [ ] HN rank and point count
- [ ] Reddit upvotes and comment count (each subreddit)
- [ ] Twitter impressions and engagement
- [ ] GitHub stars (check hourly)
- [ ] npm downloads (check `npm info glass-ripple` or npmjs.com)

### After Launch (1 Week)
- Total new GitHub stars
- npm weekly download delta
- Number of GitHub issues/PRs opened
- Dev.to article views
- Referral sources in GitHub traffic analytics
- Any forks or derivative projects

### Success Benchmarks
| Metric | Good | Great | Exceptional |
|--------|------|-------|-------------|
| GitHub stars (1 week) | +50 | +200 | +500 |
| npm weekly downloads | +100 | +500 | +2000 |
| HN points | 30+ | 100+ | 300+ |
| Reddit upvotes (total) | 50+ | 200+ | 500+ |

---

## Post-Launch Follow-Up (Week 2+)

- Write a "lessons learned" blog post about building the shader pipeline
- Create a YouTube video walkthrough of the codebase
- Respond to any GitHub issues promptly — first impressions matter for open source
- If you got feedback about missing features, ship them and announce updates
- Submit to "awesome" lists: awesome-threejs, awesome-webgl, awesome-creative-coding
- Consider ProductHunt launch (different audience, more startup-focused)
