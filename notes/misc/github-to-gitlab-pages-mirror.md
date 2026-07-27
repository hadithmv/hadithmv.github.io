Here's the complete path you took, start to finish:

## 1. Set up the GitLab project

- Created an empty project on GitLab (`hadithmv/hadithmv.gitlab.io`).

## 2. Created a GitLab access token

- Initially considered a Deploy Token, but switched to a **Project Access Token** (scopes: `api`, `read_api`, `read_repository`, `write_repository`; role: **Maintainer**) — necessary because deploy tokens can't push to protected branches on GitLab.

## 3. Stored secrets in GitHub

- In the GitHub repo (`hadithmv/hadithmv.github.io`) → **Settings → Secrets and variables → Actions**, added:
  - `GITLAB_TOKEN` — the project access token
  - `GITLAB_URL` — the GitLab repo URL

## 4. Created the GitHub Action to mirror

- Added `.github/workflows/mirror-to-gitlab.yml` that runs on every push, adds GitLab as a remote, and pushes to it.

## 5. Hit "not allowed to force push to protected branch"

- Root cause: `git push --mirror` requires force-updating refs, but GitLab protects `main` by default from force pushes.
- Fixed by going to **Settings → Repository → Protected branches**, editing `main`, setting **Allowed to push and merge** to Maintainers, and toggling **Allow force push** on.

## 6. Mirror started succeeding — but Pages showed the "Get started" wizard

- Cause: no `.gitlab-ci.yml` existed yet on the GitLab side.
- Added a `.gitlab-ci.yml` with a `pages` job to the **GitHub** repo (source of truth), since GitLab only ever receives what GitHub mirrors over.

## 7. First CI attempt failed on plain static-file assumptions

- Realized the site is built with **Jekyll**, so a simple "copy files" script wasn't enough — needed an actual Ruby/Jekyll build step.
- Updated `.gitlab-ci.yml` to use a `ruby` image, run `bundle install`, then `bundle exec jekyll build -d public`.

## 8. Confusing "failed" pipelines appeared, seemingly unrelated

- These turned out to be pipelines running against old **tags** (`2.01`, `2.05`, etc.) mirrored over by `--mirror`, falling back to GitLab's Auto DevOps (which tried Ruby 2.7.1 and broke on bundler version requirements).
- Confirmed **Auto DevOps** was already disabled in Settings → CI/CD.
- Identified these tag pipelines as noise, unrelated to the real `main` branch deploy.

## 9. No pipeline at all was showing under the Branches tab

- Debugged in order: confirmed `.gitlab-ci.yml` existed on `main`, confirmed CI/CD was enabled in project settings, then checked the **Pipeline Editor**.
- Found the actual bug: the file was named `gitlab-ci.yml` (missing the leading dot) instead of `.gitlab-ci.yml`. GitLab silently ignores misnamed config files rather than erroring.
- Fixed with `git mv gitlab-ci.yml .gitlab-ci.yml`, committed, and pushed.

## 10. Pipeline finally triggered and ran correctly

- GitHub Action mirrored the push → GitLab picked up `.gitlab-ci.yml` on `main` → pipeline ran the `pages` job → `bundle install` succeeded, Jekyll build completed, artifacts (`public/`, 1858 files) uploaded successfully.

## 11. Understood the two-job pipeline structure

- `pages` — your custom job, builds the site and produces the artifact. **Passed**.
- `pages:deploy` — a job GitLab auto-injects whenever a `pages` job exists, responsible for actually publishing the artifact to GitLab's Pages hosting. Took a few minutes longer than usual, consistent with first-time Pages provisioning.

**End state:** GitHub → GitLab push mirror via GitHub Actions, triggering a real GitLab CI/CD pipeline on every push, building your Jekyll site, and publishing it to GitLab Pages at `https://hadithmv.gitlab.io`.

If you want, I can also write this up as a clean `README.md` for the repo so future-you (or anyone else touching this) doesn't have to relive the debugging.

...
...
...

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

| Secret name    | Value                                        |
| -------------- | -------------------------------------------- |
| `GITLAB_TOKEN` | GitLab Project Access Token (see §3)         |
| `GITLAB_URL`   | `gitlab.com/hadithmv/hadithmv.gitlab.io.git` |

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

| Setting    | Value                                                    |
| ---------- | -------------------------------------------------------- |
| Name       | `github-mirror`                                          |
| Role       | **Maintainer**                                           |
| Scopes     | `api`, `read_api`, `read_repository`, `write_repository` |
| Expiration | set per your policy (was set to ~11 months)              |

Used as `oauth2:<token>@gitlab.com/...` in the GitHub Action.

⚠️ Do **not** use a GitLab Deploy Token for this. Deploy tokens cannot be
granted push access to protected branches on GitLab (a current platform
limitation) — the push will always fail with `pre-receive hook declined`
no matter how protected-branch settings are configured.

---

## 4. GitLab protected branch settings

**GitLab project → Settings → Repository → Protected branches → edit `main`**

| Setting                   | Value       |
| ------------------------- | ----------- |
| Allowed to push and merge | Maintainers |
| Allow force push          | **On**      |

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

| Symptom                                                                   | Cause                                                             | Fix                                                                                                                                    |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `remote rejected ... pre-receive hook declined`                           | `main` is protected against force push                            | Enable "Allow force push" on protected branch (§4); don't use a deploy token                                                           |
| Pages shows "Get started" wizard indefinitely                             | No `.gitlab-ci.yml` found on `main`                               | Add the file to GitHub repo, mirror it over                                                                                            |
| Pipeline runs `test` job on `ruby:2.7.1` and fails on bundler             | Auto DevOps firing on old mirrored **tags**, not your real config | Check Branches tab not Tags tab; disable Auto DevOps                                                                                   |
| No pipeline appears at all, not even failed                               | Filename typo — missing leading dot                               | Confirm exact filename is `.gitlab-ci.yml`; check GitLab's **Pipeline Editor** — it says "Get up and running" if no config is detected |
| `pages` job passes but `pages:deploy` stays "Running" for several minutes | Normal — first-time Pages provisioning                            | Wait; check back on Deploy → Pages                                                                                                     |

...
...

ERRORS

If GitLab Pages site is asking you to sign in because the project's Pages access control setting is restricted rather than set to public.

How to Fix It
Go to your project on GitLab.
Open Settings and click on General.Scroll down to the Visibility, project features, permissions section.
Find Pages access control and change it to Everyone or Everyone with access.Save changes and wait about 30 minutes for the update to apply.

Reason: Gitlab recently enabled access control for Pages on GitLab.com
