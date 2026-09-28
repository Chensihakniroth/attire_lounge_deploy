#!/bin/sh
# Staged hunk builder: `git add -p` with an explicit hunk map.
# Each stanza: <hunk-header-regex> <choice>
#   y = stage this hunk, n = skip it, q = stop staging.
#
# Why this exists: routes/api.php carries unrelated in-flight work from another
# feature. `git add routes/api.php` would ship that too; `git add -p` is
# interactive and cannot run unattended. This script stages only the hunks we
# own. Verify with `git diff --cached` before committing.

# Repo root is the parent of tools/, not this script's own directory.
cd "$(dirname "$0")/.." || exit 1

# routes/api.php diffs into exactly 5 hunks, in this order:
#   1  use App\Http\Controllers\GiftItemController;      <- gift work   SKIP
#   2  use App\Http\Controllers\NileSyncController;     <- ours        STAGE
#   3  public gift-items routes                         <- gift work   SKIP
#   4  admin /nile-sync routes                          <- ours        STAGE
#   5  admin Gift Item Catalog CRUD                     <- gift work   SKIP
# Answers: n y n y n
git add -p -- routes/api.php <<'EOF'
n
y
n
y
n
EOF

echo "--- staged files ---"
git diff --cached --name-only
echo "--- confirm no gift work is staged ---"
if git diff --cached -- routes/api.php | grep -q "GiftItemController\|gift-items"; then
    echo "FAIL: gift work is staged in routes/api.php"
    exit 1
fi
echo "OK: routes/api.php staged without gift work"
