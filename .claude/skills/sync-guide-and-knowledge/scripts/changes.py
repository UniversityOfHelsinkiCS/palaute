#!/usr/bin/env python3
"""Lists the commits since the last sync that may change what the user guide or the knowledge base should say.

Usage, from the repository root: changes.py
Exits with 2 if the PO has Finnish guide edits that clean-po-edits hasn't mirrored yet.
"""
import re
import subprocess
import sys
from pathlib import Path

WATERMARK = Path(__file__).parent.parent / 'last_synced'
GUIDE = 'src/client/pages/UserGuide/content'
MIRRORED = '^docs: apply PO changes to English user guide$'

IGNORED = [re.compile(pattern) for pattern in (
    r'^[^/]+$',
    r'^\.',
    r'^(documentation|scripts|tools|e2e)/',
    r'(^|/)tsconfig\.json$',
    r'\.(test|spec)\.tsx?$',
    r'^src/server/test/',
    r'^src/client/pages/UserGuide/',
    r'^src/client/pages/Admin/',
    r'^src/server/routes/admin/',
    r'(?i)help_?chatbot',
)]


def git(*args):
    return subprocess.run(['git', *args], capture_output=True, text=True, check=True).stdout


def relevant(path):
    return not any(pattern.search(path) for pattern in IGNORED)


def unmirrored_po_edits():
    marker = git('log', '-1', '--format=%H', f'--grep={MIRRORED}').strip()
    commits = git('log', '--no-merges', '--format=%h', f'{marker}..HEAD' if marker else 'HEAD', '--', f'{GUIDE}/fi').split()
    return [c for c in commits if not git('show', '--format=', '--name-only', c, '--', f'{GUIDE}/en').strip()]


base = WATERMARK.read_text().strip()
head = git('rev-parse', 'HEAD').strip()

pending = unmirrored_po_edits()
if pending:
    print('Finnish guide edits not yet mirrored into English (run clean-po-edits first):')
    print(git('log', '--no-walk', '--format=  %h %an %s', *pending), end='')
    sys.exit(2)

print(f'Range: {base[:8]}..{head[:8]}  (record {head} in last_synced when done)\n')
shown = 0
for line in git('log', '--reverse', '--no-merges', '--format=%h%x09%ad%x09%an%x09%s', '--date=short', f'{base}..{head}').splitlines():
    sha, date, author, subject = line.split('\t', 3)
    files = [f for f in git('show', '--format=', '--name-only', sha).split('\n') if f and relevant(f)]
    if files:
        shown += 1
        print(f'{sha} {date} {author}: {subject}')
        for f in files:
            print(f'    {f}')
total = len(git('rev-list', '--no-merges', f'{base}..{head}').split())
print(f'\n{shown} of {total} commits touch relevant files.')
