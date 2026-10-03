# Retro Arcade Soccer — GitHub Pages & Unity Guide

## 1. Hosting on GitHub Pages (Instant Web Build)

This project is configured for **one-click automatic deployment to GitHub Pages**:

1. **Push this repository to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy Retro Arcade Soccer with 100 unlicensed players"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - In your GitHub repo, go to **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.

3. **Automatic Deployment**:
   - The included workflow `.github/workflows/deploy.yml` automatically triggers on every push to `main`.
   - It runs `npm ci` and `npm run build` (with `base: './'` in `vite.config.ts`), publishing the static production bundle to `https://<your-username>.github.io/<your-repo>/`.

---

## 2. Building in Unity & Exporting to GitHub Pages

The `/unity/` folder contains C# scripts and architecture for building the game in Unity:

### Unity C# Scripts Included:
- `OfficialPlayerDatabase.cs`: Complete 100-player roster from the official PDF (Volumes I–IV) with full stats (PAC, SHO, PAS, DRI, DEF, PHY, OVR).
- `RetroSoccerBall.cs`: 16-bit arcade ball physics with spin curl, rolling friction, and bounce restitution.
- `RetroMatchManager.cs`: Scorekeeping, team assignments, and match timer.

### Exporting Unity WebGL to GitHub Pages:
1. Open the project in **Unity 2022.3 LTS**, **Unity 2023**, or **Unity 6**.
2. Open **File** → **Build Settings**.
3. Select **WebGL** as the platform and click **Switch Platform**.
4. In **Player Settings** → **Publishing Settings**:
   - Set **Compression Format** to **Gzip** or **Disabled** (if GitHub Pages does not decompress Brotli).
   - Enable **Decompression Fallback** (recommended for GitHub Pages).
5. Click **Build** and choose output folder (e.g., `dist` or `public/unity`).
6. Push to GitHub to host directly via GitHub Pages!
