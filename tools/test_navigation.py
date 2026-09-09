#!/usr/bin/env python3
"""Read-only source checks; no browser, network, or checkout writes."""
from collections import Counter, deque
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote
import argparse

BASE = 'https://synthetic.salon/'
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
class Node:
    def __init__(self, tag, attrs, parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs), parent, []
        if parent: parent.children.append(self)
    def walk(self):
        yield self
        for child in self.children: yield from child.walk()
    def has_class(self, name): return name in self.attrs.get('class','').split()
class Document(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.root = Node('document', [])
        self.stack = [self.root]
        self.feed(source)
    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.stack[-1])
        if tag not in VOID: self.stack.append(n)
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID: self.handle_endtag(tag)
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                break

ap = argparse.ArgumentParser(description=__doc__)
ap.add_argument('root', type=Path)
ap.add_argument('--nav-class', required=True, help='Class on the whole common static header/nav')
args = ap.parse_args()
root = args.root.resolve()
paths = sorted(p for p in root.rglob('*.html') if not (
    p.relative_to(root).as_posix().startswith(('seasons/season-01/', 'seasons/season-02/'))
    or p.relative_to(root).as_posix() in ('seasons/season-01-catalog.html','seasons/season-02-catalog.html')
))
docs = {p: Document(p.read_text()).root for p in paths}
errors, checked_links = [], 0

def fail(p, message): errors.append(f'{p.relative_to(root)}: {message}')
def target(source, href):
    u = urlparse(urljoin(BASE + source.relative_to(root).as_posix(), href))
    if u.scheme not in ('http','https') or u.netloc != 'synthetic.salon': return None
    p = root / unquote(u.path).lstrip('/')
    if p.is_dir() or not p.suffix: p = p / 'index.html'
    return p, unquote(u.fragment)

def check_link(source, n, key):
    global checked_links
    pair = target(source, n.attrs[key])
    if pair is None: return
    checked_links += 1
    p, frag = pair
    if not p.exists(): fail(source, f'missing target {key}={n.attrs[key]!r}'); return
    if frag and p.suffix == '.html':
        doc = docs.get(p)
        if doc is None: doc = Document(p.read_text()).root
        if not any(e.attrs.get('id') == frag or e.attrs.get('name') == frag for e in doc.walk()):
            fail(source, f'missing fragment {n.attrs[key]!r}')

for p, doc in docs.items():
    nodes = list(doc.walk())
    navs = [n for n in nodes if n.has_class(args.nav_class)]
    if len(navs) != 1: fail(p, f'expected 1 .{args.nav_class}; found {len(navs)}')
    if len([n for n in nodes if n.tag == 'h1']) != 1: fail(p, 'expected one retained h1')
    ids = Counter(n.attrs['id'] for n in nodes if 'id' in n.attrs)
    for id_, count in ids.items():
        if count > 1: fail(p, f'duplicate id {id_!r}')
    for nav in navs:
        for n in nav.walk():
            if n.tag == 'a' and 'href' in n.attrs: check_link(p, n, 'href')
        if sum(n.attrs.get('aria-current') == 'page' for n in nav.walk()) > 1:
            fail(p, 'multiple aria-current="page" entries in common navigation')
    # New standalone works must have valid static links, assets, and script sources.
    if p.relative_to(root).as_posix() in ('encounter/index.html','still/index.html'):
        for n in nodes:
            for key in ('href','src'):
                if key in n.attrs: check_link(p, n, key)
            for attr in ('aria-controls','aria-labelledby','aria-describedby'):
                if attr in n.attrs:
                    for ref in n.attrs[attr].split():
                        if ref not in ids: fail(p, f'{attr} points to absent {ref!r}')
        if any(n.tag == 'script' and 'gallery-state' in n.attrs.get('src','') for n in nodes):
            fail(p, 'new standalone work includes gallery-state')

# Every public destination must remain reachable through real static anchors.
# Stop traversal at historical seasons so their internals cannot mask current isolation.
seen, queue = set(), deque([root / 'index.html'])
while queue:
    p = queue.popleft()
    if p in seen or p not in docs: continue
    seen.add(p)
    for n in docs[p].walk():
        if n.tag == 'a' and 'href' in n.attrs:
            pair = target(p, n.attrs['href'])
            if pair and pair[0] in docs: queue.append(pair[0])
for p in docs:
    if p not in seen: fail(p, 'unreachable from Entrance through current static links')
for relative in ('encounter/index.html','still/index.html'):
    if root / relative not in docs: errors.append(f'{relative}: required new page missing')

print(f'Checked {len(paths)} active HTML documents, {checked_links} common-nav/new-work local references, and static destination reachability.')
if errors:
    for error in errors: print('FAIL ' + error)
    raise SystemExit(1)
print('PASS source structure, local references, accessible references, and destination reachability. No visual/browser behavior assertions were performed.')
