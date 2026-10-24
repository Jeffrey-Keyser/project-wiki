#!/usr/bin/env bash
# Production installs a Forge-built artifact; no build or inference runs here.
set -euo pipefail
revision="${1:?Expected git revision}"
[[ "$revision" =~ ^[0-9a-f]{40}$ ]] || exit 2
root_dir="$(cd "$(dirname "$0")/.." && pwd)"
cache_dir="$HOME/.cache/project-wiki/artifacts/$revision"
mkdir -p "$HOME/.local/state/project-wiki"
exec 9>"$HOME/.local/state/project-wiki/publish.lock"
flock 9
cd "$root_dir"
git fetch --quiet origin main
if [[ "$(git rev-parse origin/main)" != "$revision" ]]; then
  printf '{"status":"stale-main"}\n'
  exit 0
fi
[[ -z "$(git status --porcelain --untracked-files=no)" ]] || { printf 'Tracked production files are dirty\n' >&2; exit 3; }
python3 - "$cache_dir" "$revision" <<'PY'
import hashlib,json,pathlib,sys,tarfile
directory=pathlib.Path(sys.argv[1]);revision=sys.argv[2]
manifest=json.loads((directory/'manifest.json').read_text())
assert manifest['revision']==revision
assert hashlib.sha256((directory/'site.tar.gz').read_bytes()).hexdigest()==manifest['archiveSha256']
with tarfile.open(directory/'site.tar.gz') as archive:
    for item in archive:
        parts=pathlib.PurePosixPath(item.name).parts
        assert parts and parts[0]=='dist' and '..' not in parts and not item.name.startswith('/')
        assert item.isfile() or item.isdir(), 'Links and devices are forbidden'
PY
if [[ -f .wiki-artifact-state.json ]] && python3 - "$revision" <<'PY'
import json,sys
try: assert json.load(open('.wiki-artifact-state.json'))['revision']==sys.argv[1]
except Exception: sys.exit(1)
PY
then
  printf '{"status":"already-published"}\n'
  exit 0
fi
stage_dir="$(mktemp -d "$root_dir/.wiki-artifact-XXXXXX")"
trap 'rm -rf "$stage_dir"' EXIT
tar -xzf "$cache_dir/site.tar.gz" -C "$stage_dir"
[[ -s "$stage_dir/dist/index.html" && -s "$stage_dir/dist/ecosystem/overview/index.html" ]]
git merge --ff-only "$revision" >/dev/null
# Linux renameat2 exchanges two directory names atomically: requests see a
# complete old or new tree, without a missing-dist interval.
exchange_dist() {
  python3 - "$stage_dir/dist" "$root_dir/dist" <<'PY'
import ctypes,os,sys
source,target=sys.argv[1:]
if not os.path.exists(target): os.rename(source,target)
else:
    libc=ctypes.CDLL(None,use_errno=True)
    if libc.renameat2(-100,os.fsencode(source),-100,os.fsencode(target),2)!=0:
        raise OSError(ctypes.get_errno(),'Atomic directory exchange failed')
PY
}
exchange_dist
if ! systemctl --user restart project-wiki.service; then
  exchange_dist
  systemctl --user restart project-wiki.service || true
  exit 5
fi
cp "$cache_dir/manifest.json" .wiki-artifact-state.json
printf '{"status":"published"}\n'
