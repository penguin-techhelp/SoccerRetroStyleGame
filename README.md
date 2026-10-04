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

### Key GitHub Pages Features Configured:

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
