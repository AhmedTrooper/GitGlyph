# ⚡ GitGlyph

> **Edge-cached, dynamic GitHub SVG cards designed for self-hosting on Vercel's Free Tier.**
> Clean URLs, zero query parameter clutter, 5,000 req/hr GitHub GraphQL rate limits, and instant edge delivery.

<div align="center">

### 👉 **[Fork this repository](https://github.com/AhmedTrooper/GitGlyph/fork)** to get started.

</div>

---

## 🛠️ Setup in 3 Steps

> **TL;DR:** Fork → Add env vars on Vercel → Deploy. Total time: ~5 minutes.

### 1. Fork this repository

Click the **[Fork](https://github.com/AhmedTrooper/GitGlyph/fork)** button at the top right of this page. This creates `your-username/GitGlyph` under your account.

### 2. Import to Vercel and **add environment variables FIRST**

> ⚠️ **Important:** Configure the env vars *before* clicking Deploy. The first build without them will produce error cards. Skip ahead to step 2b below.

#### 2a. Import the project
1. Go to [vercel.com/new](https://vercel.com/new).
2. Select your forked `GitGlyph` repository.
3. **Before clicking Deploy**, open the **Environment Variables** section.

#### 2b. Add these environment variables

| Variable | Required | Description |
| :--- | :---: | :--- |
| `GITHUB_TOKEN` | **Yes** | A GitHub Personal Access Token. A **classic PAT with 0 scopes** checked is perfect — it raises your rate limit from 60 to **5,000 requests/hour** and only reads public data. No repo, admin, or user scopes are needed. [Create a token ↗](https://github.com/settings/tokens/new) |
| `GITHUB_USERNAME` | **Yes** | Your GitHub login. Cards auto-query this user so you never need to pass `?username=` in your README URLs. |
| `GITHUB_REPO` | Recommended | One default public repository for `/api/pin`. Either `name` (uses your `GITHUB_USERNAME` as owner) or `owner/name` format. |
| `NEXT_PUBLIC_APP_URL` | Optional | Your Vercel deployment URL. Auto-detected on Vercel; only set this for non-Vercel hosts. |

**Why a 0-scope PAT?** It authenticates the request (5,000 req/hr instead of 60) without granting any access to your repos, profile, or orgs. GitGlyph only reads public data anyway.

### 3. Deploy

Click **Deploy**. Your instance will be live in ~60 seconds at `https://gitglyph-<hash>.vercel.app`.

---

## 🌟 Live Previews & Examples

Drop any of these into your GitHub profile README (replace `https://git-glyph.vercel.app` with your own domain if using a custom deployment):

### 1. GitHub Stats Card
```markdown
![GitHub Stats](https://git-glyph.vercel.app/api/stats?theme=tokyo-night)
```
![GitHub Stats](https://git-glyph.vercel.app/api/stats?theme=tokyo-night)

### 2. Contribution Streak Card
```markdown
![Contribution Streak](https://git-glyph.vercel.app/api/streak?theme=dracula)
```
![Contribution Streak](https://git-glyph.vercel.app/api/streak?theme=dracula)

### 3. Top Languages Card
```markdown
![Top Languages](https://git-glyph.vercel.app/api/languages?theme=nord)
```
![Top Languages](https://git-glyph.vercel.app/api/languages?theme=nord)

### 4. Pinned Repository Card
```markdown
![Pinned Repo](https://git-glyph.vercel.app/api/pin?repo=AhmedTrooper/GitGlyph&theme=catppuccin)
```
![Pinned Repo](https://git-glyph.vercel.app/api/pin?repo=AhmedTrooper/GitGlyph&theme=catppuccin)

---

## 🎨 Customization

Every card accepts the same set of query parameters. Use the [interactive playground](https://git-glyph.vercel.app) for a live customizer.

### Available Themes
- `light` · `dark` · `tokyo-night` · `dracula` · `nord` · `radical` · `catppuccin`

### Query Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `theme` | string | `dark` | Theme name (e.g. `tokyo-night`, `dracula`, `catppuccin`). |
| `layout` | string | `horizontal` | `horizontal` or `vertical` (compact, for Stats and Streak). |
| `hide_border` | bool | `false` | `true` removes the outer border. |
| `repo` | string | `GITHUB_REPO` env | Repository for `/api/pin` (`name` or `owner/name`). |
| `username` | string | `GITHUB_USERNAME` env | Per-request username override. |
| `custom_title` | string | Auto | Custom header text (truncated past 38 chars). |
| `bg_color` | hex | Theme | Background override (hex without `#`). |
| `border_color` | hex | Theme | Border stroke override. |
| `title_color` | hex | Theme | Header text override. |
| `text_color` | hex | Theme | Body text and values override. |
| `width` | int | Responsive | Optional fixed width in px (200–4000). Out-of-range falls back to fluid. |

---

## ⚡ Performance & Vercel Free Limits

- **Sub-300ms Responses**: Each endpoint executes a single, highly optimized GitHub GraphQL query.
- **5-Hour Edge Caching**: Responses ship with `Cache-Control: public, max-age=0, s-maxage=18000, stale-while-revalidate=86400`.
- **Zero Compute Exhaustion**: Repeat README views are served from Vercel's global Edge CDN cache without burning serverless function execution time.
- **5,000 req/hr per PAT**: A single classic PAT supports roughly 1,000 unique README viewers per hour with zero API calls per repeat viewer.

---

## 🛠️ Local Development

```bash
# Clone your fork
git clone https://github.com/your-username/GitGlyph.git
cd GitGlyph

# Install dependencies
bun install

# Copy environment template and fill in your token
cp .env.example .env.local

# Start development server
bun dev
```

Visit `http://localhost:3000` to access the interactive customizer playground and live API docs.

---

## 📄 License

MIT © [AhmedTrooper](https://github.com/AhmedTrooper)
