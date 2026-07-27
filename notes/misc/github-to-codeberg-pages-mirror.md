# GitHub → Codeberg Pages Mirror Setup (hadithmv.github.io → hadithmv.codeberg.page)

Full record of everything done to mirror `hadithmv.github.io` to Codeberg and get it live at `https://hadithmv.codeberg.page/`.

---

## Phase 0: Key facts learned along the way

- **Codeberg does NOT support automatic pull mirroring** (Codeberg pulling from GitHub on a schedule). This was disabled site-wide because abandoned mirrors wasted server resources. Confirmed in Codeberg's own FAQ: https://docs.codeberg.org/getting-started/faq/
- The working alternative: **push-based mirroring** — GitHub Actions pushes to Codeberg whenever you push to GitHub. This is "automatic" from the user's perspective but technically lives on the GitHub side.
- **Codeberg Pages root URL rule**: `https://username.codeberg.page/` (no path) only works if the Codeberg repo is literally named `pages`. Any other repo name publishes at `https://username.codeberg.page/repo-name/` instead.
- **Codeberg Pages branch rule**: content is served from a branch called `pages` (not `main`/`master`).
- Codeberg's default storage quota is **750 MiB** per repo for typical use. Going over triggers "Quota exceeded" errors.
- Codeberg/Forgejo git servers **reject pushes that come from a shallow clone** (`fetch-depth: 1` or similar) — you'll get `shallow update not allowed`. Fix is either a full-depth clone or an orphan (parentless) commit.
- Codeberg does **not** allow push-to-create for users by default — the target repo must exist before the first push, or you'll get `Push to create is not enabled for users` (403).

---

## Phase 1: Get a Codeberg access token

1. Log into Codeberg → **Settings → Applications** (`https://codeberg.org/user/settings/applications`)
2. Generate a new token (e.g. name it `github-mirror`)
3. Scopes: `write:repository` (add `write:organization` too if mirroring into an org)
4. Copy the token immediately (shown only once)

## Phase 2: Store the token as a GitHub secret

On the GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**
- Name: `CODEBERG_TOKEN`
- Value: the token from Phase 1

## Phase 3: Create the destination repo on Codeberg manually

Codeberg doesn't allow push-to-create for users, so the repo must exist first:
1. Go to `https://codeberg.org/repo/create`
2. Owner: `hadithmv`
3. Name: **`pages`** (this specific name is required for the root `codeberg.page` URL)
4. Leave everything else empty (no README/.gitignore/license) so the first push lands cleanly

---

## Phase 4: First mirror workflow attempt (using cssnr/mirror-repository-action)

File: `.github/workflows/mirror-to-codeberg.yml`

```yaml
name: Mirror to Codeberg

on:
  push:
    branches:
      - main
  delete:

jobs:
  mirror:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Mirror to Codeberg
        uses: cssnr/mirror-repository-action@v1
        with:
          url: https://codeberg.org/hadithmv/pages.git
          username: hadithmv
          password: ${{ secrets.CODEBERG_TOKEN }}
          create: true
```

**Problems hit with this approach, in order:**

1. **Missing checkout step** (early version) → `fatal: not a git repository` — fixed by adding `actions/checkout@v4` before the mirror step.
2. **Combining `host:` + `repo:` inputs** confused the action's URL building (`GIT_URL: https://pages`) → fixed by switching to a single `url:` input pointing directly at `https://codeberg.org/hadithmv/pages.git`.
3. **504 timeout on first full-history push** → partially transient, retried.
4. **`Quota exceeded` (750 MiB default)** — repo history + tags exceeded quota.
5. Tried `fetch-depth: 1` to shrink the push → caused **`shallow update not allowed`** (Codeberg rejects shallow-clone pushes outright).
6. Deleted the Codeberg repo and recreated it to clear stuck/partial data.
7. Hit **`Push to create is not enabled for users`** (403) → fixed by manually creating the `pages` repo on Codeberg first (Phase 3).
8. Reverted to `fetch-depth: 0` (full clone) → quota problem returned, this time confirmed as **real content size**, not just history bloat.

**Diagnosis commands used:**
```bash
git clone https://github.com/hadithmv/hadithmv.github.io.git
cd hadithmv.github.io
du -sh .git              # → 2.3G
du -sh --exclude=.git .  # → 5.6G  (working tree itself was the problem, not history)
du -sh */ | sort -rh | head -15
```

Output showed:
```
5.1G    app/              ← unrelated project source (Android/Windows apps), not part of the Jekyll site
118M    androidApp-kt/
106M    js/
98M     windowsApp-tauri/
60M     codebase/
35M     notes/
22M     img/
19M     node_modules/
...
```

`app/`, `androidApp-kt/`, `windowsApp-tauri/`, `codebase/`, `node_modules/` were unrelated app-project folders living inside the same GitHub repo as the Jekyll site — none of them needed to be mirrored to Codeberg Pages.

---

## Phase 5: Final working mirror workflow

Replaced the `cssnr/mirror-repository-action` approach entirely with plain `git` commands that:
1. Check out the repo normally
2. Delete the large unrelated folders (in the runner's temp workspace only — never touches the real GitHub repo)
3. Create a **fresh orphan commit** (no parent history at all — this is what finally avoided both the quota problem and the shallow-push rejection)
4. Force-push that orphan branch to Codeberg's `pages` repo as `main`

Final file: **`.github/workflows/mirror-to-codeberg.yml`**

```yaml
name: Mirror to Codeberg

on:
  push:
    branches:
      - main
  delete:

jobs:
  mirror:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Remove large unrelated folders
        run: |
          rm -rf app androidApp-kt windowsApp-tauri codebase node_modules

      - name: Create orphan commit and push to Codeberg
        run: |
          git config user.name "GitHub Action"
          git config user.email "action@github.com"
          git checkout --orphan codeberg-mirror
          git add -A
          git commit -m "Mirror: exclude app/ and build folders"
          git push --force https://hadithmv:${{ secrets.CODEBERG_TOKEN }}@codeberg.org/hadithmv/pages.git codeberg-mirror:main
```

**This is the version that succeeded.** ✅

---

## Phase 6: Codeberg Pages side (Jekyll build)

Because the site uses Jekyll (a build step, not plain static HTML), the plan discussed for actually building and serving the site was **Forgejo Actions on the Codeberg side**, deploying via `git-pages/action@v2`.

1. Enable Actions on the Codeberg `pages` repo: `https://codeberg.org/hadithmv/pages/settings/units` → enable **Actions**
2. Add a workflow file that lives in the GitHub repo (so it rides along with the mirror) at:

**`.forgejo/workflows/pages.yml`**

```yaml
name: Build and Deploy Jekyll

on:
  push:
    branches:
      - main

jobs:
  build-deploy:
    runs-on: docker
    container:
      image: ruby:3.2

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install dependencies
        run: |
          gem install bundler
          bundle install

      - name: Build Jekyll site
        run: bundle exec jekyll build --destination _site

      - name: Deploy to Codeberg Pages
        uses: https://codeberg.org/git-pages/action@v2
        with:
          site: 'https://hadithmv.codeberg.page/'
          token: ${{ forge.token }}
          source: _site/
```

Notes:
- `token: ${{ forge.token }}` is auto-populated by Forgejo Actions, no manual secret needed for this step.
- `site:` is the bare root URL because the Codeberg repo is named `pages`.
- Checked `_config.yml` for a `baseurl` setting that could break asset paths — confirmed there wasn't one, so no fix needed there.

**Status:** the mirror pipeline (Phase 5) is confirmed working end-to-end. The Forgejo Actions Jekyll build/deploy step (Phase 6) was the documented plan but hasn't been separately re-confirmed working after the final Phase 5 fix — worth checking `https://codeberg.org/hadithmv/pages/actions` after the next push to confirm this stage runs and deploys cleanly too.

---

## Full picture: what lives where

**GitHub repo (`hadithmv/hadithmv.github.io`):**
```
.github/workflows/mirror-to-codeberg.yml   ← runs on GitHub, mirrors filtered content to Codeberg
.forgejo/workflows/pages.yml               ← inert on GitHub, rides along in the mirror to Codeberg
_config.yml                                ← Jekyll config (no baseurl set — correct for root-domain deploy)
app/, androidApp-kt/, windowsApp-tauri/,
codebase/, node_modules/                   ← excluded from the Codeberg mirror (unrelated project folders)
(Jekyll source files: _layouts, _includes, assets, etc.)
```

**Codeberg repo (`hadithmv/pages`):**
```
main branch ← receives the orphan-commit push from GitHub Actions (filtered content, no history)
             ← Forgejo Actions builds Jekyll from this and deploys the _site/ output to Codeberg Pages
```

**Live URL:** `https://hadithmv.codeberg.page/`

---

## Quick troubleshooting reference (for next time)

| Symptom | Cause | Fix |
|---|---|---|
| `fatal: not a git repository` | Missing `actions/checkout` step | Add checkout as first step |
| `GIT_URL: https://pages` (malformed) | Mixed `host:`/`repo:` inputs on mirror action | Use single `url:` input instead |
| `504` timeout mid-push | Large payload / server load | Retry; consider trimming repo size |
| `Quota exceeded` | Repo over 750 MiB | Find and exclude large folders (`du -sh */`), or request quota increase |
| `shallow update not allowed` | Pushing from a shallow clone (`fetch-depth: 1`) | Use full clone (`fetch-depth: 0`) or an orphan commit instead |
| `Push to create is not enabled for users` (403) | Target repo doesn't exist yet on Codeberg | Manually create the repo on Codeberg first |
| Root `codeberg.page` URL 404s, but `/reponame/` works | Codeberg repo isn't named `pages` | Rename repo to `pages` |
| CSS/JS 404 only under a nested path | Absolute asset paths (`/css/...`) break when site isn't served from domain root | Fix by getting to the root `pages` repo name, not a path-prefixed one |
