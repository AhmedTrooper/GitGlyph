# ⚡ GitGlyph

> **Edge-cached, dynamic GitHub SVG cards designed for self-hosting on Vercel's Free Tier.**
> Clean URLs, zero query parameter clutter, 5,000 req/hr GitHub GraphQL rate limits, and instant edge delivery.

---

## 🌟 Live Previews & Examples

All cards can be embedded in any GitHub profile README or repository Markdown with clean URLs:

### 1. Public GitHub Stats Card
```markdown
![Public Stats Card](https://git-glyph.vercel.app/api/stats?theme=tokyo-night)
```
![Public Stats Card](https://git-glyph.vercel.app/api/stats?theme=tokyo-night)

### 2. Public Contribution Streak Card
```markdown
![Public Contribution Streak](https://git-glyph.vercel.app/api/streak?theme=tokyo-night)
```
![Public Contribution Streak](https://git-glyph.vercel.app/api/streak?theme=tokyo-night)

### 3. Top Languages Card
```markdown
![Top Languages Card](https://git-glyph.vercel.app/api/languages?theme=tokyo-night)
```
![Top Languages Card](https://git-glyph.vercel.app/api/languages?theme=tokyo-night)

### 4. Pinned Repository Card
```markdown
![Pinned Repository Card](https://git-glyph.vercel.app/api/pin?theme=tokyo-night)
```
![Pinned Repository Card](https://git-glyph.vercel.app/api/pin?theme=tokyo-night)

---

## 🚀 Quick Start: Self-Hosting in 2 Minutes

GitGlyph is built to be self-hosted. By running your own instance, your personal access token is never shared, your rate limits are completely yours (5,000 req/hr), and you never have to clutter your embed URLs with `?username=your_name`.

### Step 1: Fork this Repository
Click the **Fork** button at the top right of this page.

### Step 2: Deploy to Vercel
1. Go to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import your forked `GitGlyph` repository.
3. Configure the Environment Variables before deploying (see below).

### Step 3: Configure Environment Variables

| Variable | Required | Description |
| :--- | :---: | :--- |
| `GITHUB_TOKEN` | **Yes** | Personal Access Token (PAT Classic) with **0 scopes** checked. Provides 5,000 req/hr rate limits. [Create Token ↗](https://github.com/settings/tokens) |
| `GITHUB_USERNAME` | **Yes** | Your GitHub username. Cards automatically query this user without URL parameters. |
| `GITHUB_REPO` | Optional | Default public repository name (e.g. `GitGlyph` or `owner/repo`) for `/api/pin`. |
| `NEXT_PUBLIC_APP_URL`| Optional | Your deployed domain (e.g. `https://git-glyph.vercel.app`). Auto-detected on Vercel. |

---

## 🎨 Themes & Customization

All cards support themes, compact vertical layouts, and border toggles:

### Available Themes
- `light` (GitHub Light)
- `dark` (GitHub Dark - Default)
- `tokyo-night`
- `dracula`
- `nord`
- `radical`
- `catppuccin`

### Query Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `theme` | `string` | `dark` | Visual theme name (e.g. `tokyo-night`, `dracula`, `catppuccin`). |
| `layout` | `string` | `horizontal` | `horizontal` or `vertical` (compact vertical orientation for Stats and Streak). |
| `hide_border` | `boolean` | `false` | `true` removes the card's outer border. |
| `repo` | `string` | `GITHUB_REPO` env | Repository to showcase on `/api/pin` (overrides default env variable). |
| `username` | `string` | `GITHUB_USERNAME` env | Optional username override. |
| `custom_title`| `string` | Auto-generated | Custom header text for the card. |
| `bg_color` | `hex` | Theme default | Custom hex color code (without `#`) for background override. |

---

## ⚡ Performance & Vercel Free Limits

- **Sub-300ms Responses**: Each endpoint executes a single, highly optimized GitHub GraphQL query.
- **5-Hour Edge Caching**: Responses are served with `Cache-Control: public, max-age=0, s-maxage=18000, stale-while-revalidate=86400`.
- **Zero Compute Exhaustion**: Repeated README views are served directly from Vercel's global Edge CDN cache without consuming serverless function execution time.

---

## 🛠️ Local Development

```bash
# Clone the repository
git clone https://github.com/AhmedTrooper/GitGlyph.git
cd GitGlyph

# Install dependencies
bun install

# Copy environment template and fill in your token
cp .env.example .env.local

# Start development server
bun dev
```

Visit `http://localhost:3000` to access the interactive customizer playground and live docs.

---

## 📄 License

MIT © [AhmedTrooper](https://github.com/AhmedTrooper)
