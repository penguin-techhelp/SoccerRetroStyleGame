# Retro Striker '94 — 16-Bit Arcade Soccer

A complete 16-bit arcade soccer game running **100% client-side** in modern browsers with HTML5 Canvas, Web Audio chiptune synthesis, and React.

## 🚀 100% Static & Hostable on GitHub Pages (Zero Backend Required)

This application has **no backend, no database, and no server runtime requirements**. Everything — physics simulation, AI opponents, chiptune sound synthesis, tournament brackets, penalty shootouts, commentary toasts, live stats HUD, and the 100-player official database — executes entirely in the user's web browser.

### Automatic One-Click Deployment to GitHub Pages

The repository is pre-configured with a GitHub Actions workflow in `.github/workflows/deploy.yml`:

1. **Push this repo to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy Retro Striker '94 to GitHub Pages"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - In your GitHub repository, navigate to **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.

3. **Enjoy your live site**:
   - GitHub Actions will automatically install dependencies, build the static assets, and publish your game to:
     `https://<your-username>.github.io/<your-repo-name>/`

---

## 💻 Chromebook & Windows Laptop Optimizations (16:9 Widescreen)

- **Native 16:9 Aspect Ratio**:
  - The game is framed for standard 16:9 widescreen laptop displays (1366×768, 1920×1080, 2560×1440).
  - Press **`[F]`** anytime to toggle edge-to-edge 16:9 fullscreen.
  - Dedicated **16:9 FIT vs. STRETCH** toggle in the match scoreboard bar.
- **No-Numpad 2-Player Laptop Controls**:
  - **Player 1 (Left Side)**: `W, A, S, D` (Move), `J / Z` (Pass), `K / X` (Shoot), `L / C` (Slide), `Space / Shift` (Sprint).
  - **Player 2 (Right Side)**: `Arrow Keys` (Move), `N / Comma` (Pass), `M / Period` (Shoot), `B / Slash` (Slide), `Right Shift / Enter` (Sprint).
  - Plug-and-play Xbox, PlayStation, and generic USB/Bluetooth gamepads are auto-detected.
- **Chromebook Eco Performance Engine**:
  - Pre-cached offscreen crowd bitmaps eliminate hundreds of thousands of trigonometric calculations per second.
  - Prevents GPU texture reallocation by throttling canvas buffer updates to actual viewport resizes.
  - Low-power Chromebooks (e.g. Intel Celeron, MediaTek) run at a smooth, locked 60 FPS without battery drain.

- **Relative Asset Paths (`base: './'`)**: In `vite.config.ts`, ensuring assets load perfectly on any GitHub Pages subfolder (e.g. `/<repo-name>/`).
- **`.nojekyll`**: Included in `public/` and `dist/` to prevent GitHub Pages' default Jekyll processor from ignoring assets.
- **`404.html` SPA Fallback**: Included in `public/` and `dist/` for smooth single-page application routing without 404 errors.
- **Self-Contained Web Audio**: Real-time chiptune music and authentic 90s sound effects synthesized natively via the browser's Web Audio API oscillators and filters (no external media servers required).

---

### Local Development & Manual Build

```bash
# Install dependencies
npm install

# Start local development server (http://localhost:3000)
npm run dev

# Create static production bundle (outputs to /dist)
npm run build

# Preview production build locally
npm run preview
```
