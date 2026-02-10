---
name: commit
description: Create a git commit following Conventional Commits conventions
argument-hint: "[optional message context]"
disable-model-invocation: true
allowed-tools: Bash(git *), Read, Grep, Glob
---

# Conventional Commit

Create a git commit following the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Steps

1. **Inspect current changes** — run these commands in parallel:
   - `git status` to see staged and unstaged files (never use `-uall`)
   - `git diff --cached` to see staged changes; if nothing is staged, also run `git diff` for unstaged changes
   - `git log --oneline -10` to see recent commit style

2. **Stage files** if nothing is staged yet — prefer `git add <specific files>` over `git add .`. Never stage files that contain secrets (`.env`, credentials, tokens).

3. **Determine the commit type** from the changes:

   | Type       | When to use                                          |
   |------------|------------------------------------------------------|
   | `feat`     | A new feature for the user                           |
   | `fix`      | A bug fix                                            |
   | `docs`     | Documentation only changes                           |
   | `style`    | Formatting, missing semicolons, etc. (not CSS)       |
   | `refactor` | Code change that neither fixes a bug nor adds feature|
   | `perf`     | Performance improvement                              |
   | `test`     | Adding or updating tests                             |
   | `build`    | Build system or external dependencies                |
   | `ci`       | CI configuration and scripts                         |
   | `chore`    | Other changes that don't modify src or test files    |

4. **Determine the scope** (optional) — a noun describing the section of the codebase affected (e.g., `auth`, `chat`, `api`, `router`, `ui`).

5. **Check for breaking changes** — if there are breaking changes, add `!` after the type/scope and include a `BREAKING CHANGE:` footer.

6. **Write the commit message** using this format:

   ```
   <type>[optional scope][!]: <short summary>

   [optional body — explain WHY, not WHAT]

   [optional footer(s)]
   Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
   ```

   Rules for the summary line:
   - Use imperative mood ("add" not "added", "fix" not "fixes")
   - Do not capitalize the first letter after the colon
   - No period at the end
   - Max 72 characters

7. **Create the commit** using a HEREDOC for proper formatting:

   ```bash
   git commit -m "$(cat <<'EOF'
   <type>(scope): summary here

   Optional body here.

   Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
   EOF
   )"
   ```

8. **Verify** — run `git status` after committing to confirm success.

## User context

If the user provided additional context: $ARGUMENTS

Use this context to inform the commit type, scope, and message — but always verify against the actual changes.
