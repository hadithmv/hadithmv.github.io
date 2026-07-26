# GitHub → GitLab Push Mirror with Working GitLab Pages (Jekyll)

Full reference for how `hadithmv.github.io` is mirrored to GitLab and deployed
via GitLab Pages.

- **Source repo (edit here):** `github.com/hadithmv/hadithmv.github.io`
- **Mirror target (do not edit directly):** `gitlab.com/hadithmv/hadithmv.gitlab.io`
- **Live GitLab Pages URL:** `https://hadithmv.gitlab.io`

Flow: push to GitHub `main` → GitHub Action mirrors to GitLab `main` →
GitLab CI/CD runs → Jekyll builds → GitLab Pages publishes.

---

## 1. File: `.github/workflows/mirror-to-gitlab.yml`

Lives in the **GitHub** repo. Triggers on every push and force-pushes the
current `main` to GitLab.

```yaml
name: Mirror to GitLab

on:
  push:
    branches: [main]

jobs:
  mirror:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Push to GitLab
        run: |
          git remote add gitlab https://oauth2:${{ secrets.GITLAB_TOKEN }}@${{ secrets.GITLAB_URL }}
          git push gitlab HEAD:main --force
```

> Earlier version used `git push gitlab --mirror` (mirrors all branches and
> tags). That caused GitLab's Auto DevOps to run bogus pipelines against old
> release tags. Scoped down to just `main` above, which is all this project
> needs. If you ever want tags mirrored too, add: `git push gitlab --tags --force`.

### Required GitHub repo secrets
**Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Value |
|---|---|
| `GITLAB_TOKEN` | GitLab Project Access Token (see §3) |
| `GITLAB_URL` | `gitlab.com/hadithmv/hadithmv.gitlab.io.git` |

---

## 2. File: `.gitlab-ci.yml`

Lives in the **GitHub** repo (root), gets mirrored into GitLab automatically.

⚠️ **Filename must be exactly `.gitlab-ci.yml`** — leading dot required.
A file named `gitlab-ci.yml` (no dot) is silently ignored by GitLab; no
error, no pipeline, nothing.

```yaml
pages:
  stage: deploy
  image: ruby:3.2
  script:
    - gem install bundler
    - bundle install
    - bundle exec jekyll build -d public
  artifacts:
    paths:
      - public
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
```

Notes:
- `ruby:2.7.1` was tried first (GitLab's Auto DevOps default) and failed —
  modern bundler requires Ruby ≥ 3.2. Use `ruby:3.2` explicitly.
- Output directory must be named `public` — that's what GitLab Pages expects
  by default.
- The `pages` job only builds the site and uploads the `public/` artifact.
  GitLab automatically injects a second job, `pages:deploy`, which actually
  publishes that artifact to Pages hosting. You never write `pages:deploy`
  yourself.

---

## 3. GitLab Project Access Token

**GitLab project → Settings → Access Tokens**

| Setting | Value |
|---|---|
| Name | `github-mirror` |
| Role | **Maintainer** |
| Scopes | `api`, `read_api`, `read_repository`, `write_repository` |
| Expiration | set per your policy (was set to ~11 months) |

Used as `oauth2:<token>@gitlab.com/...` in the GitHub Action.

⚠️ Do **not** use a GitLab Deploy Token for this. Deploy tokens cannot be
granted push access to protected branches on GitLab (a current platform
limitation) — the push will always fail with `pre-receive hook declined`
no matter how protected-branch settings are configured.

---

## 4. GitLab protected branch settings

**GitLab project → Settings → Repository → Protected branches → edit `main`**

| Setting | Value |
|---|---|
| Allowed to push and merge | Maintainers |
| Allow force push | **On** |

Required because the mirror push force-updates `main` on every sync.

---

## 5. GitLab CI/CD settings

**GitLab project → Settings → CI/CD → Auto DevOps**
- "Default to Auto DevOps pipeline" → **unchecked/off**

**GitLab project → Settings → General → Visibility, project features, permissions**
- CI/CD → **on**

---

## 6. Verifying it's working

- GitHub: **Actions → Mirror to GitLab** — should show green runs on every push to `main`.
- GitLab: **Build → Pipelines → Branches tab → main** — should show a pipeline with two jobs:
  - `pages` (your build script) — Passed
  - `pages:deploy` (GitLab-managed publish step) — Passed
- GitLab: **Deploy → Pages** — once `pages:deploy` finishes, shows the live URL: `https://hadithmv.gitlab.io`

---

## 7. Troubleshooting quick reference

| Symptom | Cause | Fix |
|---|---|---|
| `remote rejected ... pre-receive hook declined` | `main` is protected against force push | Enable "Allow force push" on protected branch (§4); don't use a deploy token |
| Pages shows "Get started" wizard indefinitely | No `.gitlab-ci.yml` found on `main` | Add the file to GitHub repo, mirror it over |
| Pipeline runs `test` job on `ruby:2.7.1` and fails on bundler | Auto DevOps firing on old mirrored **tags**, not your real config | Check Branches tab not Tags tab; disable Auto DevOps |
| No pipeline appears at all, not even failed | Filename typo — missing leading dot | Confirm exact filename is `.gitlab-ci.yml`; check GitLab's **Pipeline Editor** — it says "Get up and running" if no config is detected |
| `pages` job passes but `pages:deploy` stays "Running" for several minutes | Normal — first-time Pages provisioning | Wait; check back on Deploy → Pages |
