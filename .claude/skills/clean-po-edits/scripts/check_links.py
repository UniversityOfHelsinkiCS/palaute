#!/usr/bin/env python3
"""Lists user guide links whose text still quotes a page or section title that has been renamed since <base>.

Usage, from the repository root: check_links.py <base commit>
"""
import re
import subprocess
import sys
from pathlib import Path

CONTENT = 'src/client/pages/UserGuide/content'
LINK = re.compile(r'\[([^\]]+)\]\(((?:/guide|#)[^)\s]*)\)')
TITLE = re.compile(r'^#{1,6} (.*?)(?: \{#[\w-]+\})?\s*$', re.M)


def titles_in(texts):
    return {title.strip() for text in texts for title in TITLE.findall(text)}


def files_at(base, language):
    names = subprocess.run(
        ['git', 'ls-tree', '-r', '--name-only', base, f'{CONTENT}/{language}'],
        capture_output=True, text=True, check=True,
    ).stdout.split()
    return [
        subprocess.run(['git', 'show', f'{base}:{name}'], capture_output=True, text=True, check=True).stdout
        for name in names if name.endswith('.md')
    ]


if len(sys.argv) != 2:
    sys.exit(__doc__)
base = sys.argv[1]
stale = 0
for language in ('fi', 'en'):
    paths = sorted(Path(CONTENT, language).rglob('*.md'))
    current = titles_in(path.read_text() for path in paths)
    renamed = titles_in(files_at(base, language)) - current
    for path in paths:
        for number, line in enumerate(path.read_text().split('\n'), 1):
            for label, _ in LINK.findall(line):
                if label in renamed:
                    print(f'{path}:{number}  [{label}] is a renamed title')
                    stale += 1
sys.exit(1 if stale else 0)
