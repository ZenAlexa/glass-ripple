# Social Media Assets Checklist

All visual assets needed for the glass-ripple launch, where to use them, and their status.

---

## Existing Assets

### 1. `demo.gif`
- **Location:** `/demo.gif` (repo root)
- **Specs:** 2.6 MB, 480p, 8 fps
- **Status:** Ready
- **Use on:**
  - Twitter/X — attach to Tweet 1 (primary hook)
  - Reddit — embed in post body (all 3 posts)
  - Discord — post as attachment in showcase channels
  - Dev.to — use as `cover_image` in frontmatter
  - GitHub README — already embedded

### 2. `demo-preview.png`
- **Location:** `/demo-preview.png` (repo root)
- **Specs:** Static screenshot of the effect
- **Status:** Ready
- **Use on:**
  - LinkedIn post (static image works better than GIF on LinkedIn)
  - Newsletter submissions (some newsletters prefer static images)
  - Open Graph meta tag for the demo site (`og:image`)
  - Hacker News (if sharing as URL, the og:image will be used as preview)

### 3. `demo.mp4`
- **Location:** `/demo.mp4` (repo root)
- **Specs:** 1.4 MB, 960p, 24 fps
- **Status:** Ready
- **Use on:**
  - Twitter/X — use as video upload for a follow-up tweet (higher quality than GIF)
  - YouTube Shorts / TikTok (if creating short-form content)

### 4. `showcase.mp4`
- **Location:** `/showcase.mp4` (repo root)
- **Specs:** 2.3 MB, 1280x720, 30 fps, 5 scenes (Remotion)
- **Status:** Ready
- **Use on:**
  - YouTube — full showcase video
  - LinkedIn — native video upload
  - Product Hunt (if launching there)

---

## Assets to Create (Optional, Not Blocking Launch)

### 5. Social Card Image (1200x630)
- **Purpose:** Custom Open Graph image for link previews
- **Specs:** 1200x630px PNG, dark background, glass-ripple effect screenshot with logo text
- **Use on:** og:image meta tag on demo site, Twitter card
- **Priority:** Medium — the demo.gif and demo-preview.png work as fallbacks

### 6. Short Looping Video (15s)
- **Purpose:** Platform-native video for Twitter/Instagram/TikTok
- **Specs:** 15 seconds, 1080x1080 (square) or 1080x1920 (vertical), looping
- **Content:** Mouse moving over the effect, icon switching between Claude/GPT/Gemini
- **Priority:** Low — GIF and existing MP4 cover most use cases

### 7. CodePen Thumbnail
- **Purpose:** When sharing the CodePen link, a nice preview
- **Specs:** CodePen auto-generates this from the pen
- **Use on:** Twitter, Reddit when sharing CodePen link
- **Priority:** Low — handled automatically by CodePen

---

## Asset Usage by Platform

| Platform | Primary Asset | Backup Asset | Format Notes |
|----------|--------------|--------------|--------------|
| Twitter/X | demo.gif | demo.mp4 | GIF auto-plays in feed; MP4 for higher quality follow-up |
| Reddit | demo.gif | demo-preview.png | Embedded in markdown via raw GitHub URL |
| Hacker News | (none — text only) | demo-preview.png as og:image | HN is text-focused; og:image shows in link preview |
| Dev.to | demo.gif as cover | demo-preview.png | cover_image frontmatter in article |
| LinkedIn | demo-preview.png | showcase.mp4 | LinkedIn compresses GIFs heavily; use static or native video |
| Discord | demo.gif | demo.mp4 | Direct upload, auto-plays |
| Newsletters | demo-preview.png | demo.gif | Some email clients don't support GIF; static is safer |
| YouTube | showcase.mp4 | demo.mp4 | Full showcase for main video |

---

## Raw GitHub URLs for Embedding

Use these raw URLs to embed assets in Reddit posts, Dev.to articles, etc.:

```
https://raw.githubusercontent.com/ZenAlexa/glass-ripple/main/demo.gif
https://raw.githubusercontent.com/ZenAlexa/glass-ripple/main/demo-preview.png
```

Note: GitHub raw URLs have bandwidth limits. For high-traffic scenarios (if a post goes viral), consider uploading to Imgur or a CDN as backup.
