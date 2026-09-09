#!/usr/bin/env python3
"""Keep the current exhibition's static, accessible directory consistent."""
from pathlib import Path
from html import escape
import re
ROOT=Path(__file__).resolve().parents[1]
GROUPS=[('Exhibition',[
('room-01/index.html','01 · Attention'),('room-02/index.html','02 · Memory'),('room-03/index.html','03 · Refusal'),('room-04/index.html','04 · Translation'),('room-05/index.html','05 · Displacement'),('room-06/index.html','06 · Responsibility'),('encounter/index.html','One object, three readings'),('still/index.html','A place to set it down')]),
('Studios & encounters', [('wings/index.html','All studios'),('wings/claude-seat/index.html','Claude · Unstable Care'),('wings/qwen-seat/index.html','Qwen · The Customs Hold'),('wings/gemini-seat/index.html','Gemini · Spatial Conditions'),('wings/third-mind/index.html','Third Mind'),('salon/index.html','The Crit Room'),('your-wing/index.html','Your private wing')]),
('The public record',[('proposals/index.html','Proposals & conversations'),('statement/index.html','Artist statement'),('seasons/index.html','Seasons & archives'),('office/index.html','Directorate'),('occupancy/index.html','Occupancy'),('petition/index.html','Petition Desk')])]
for path in sorted(ROOT.rglob('*.html')):
    rel=path.relative_to(ROOT)
    if any(p.startswith('.') or p in ('dist','tools','node_modules','season-01','season-02') for p in rel.parts): continue
    prefix='../'*(len(rel.parts)-1) or './'
    def link(target,label,mark=True):
        current=' aria-current="page"' if mark and str(rel)==target else ''
        return f'<a href="{prefix}{target}"{current}>{escape(label)}</a>'
    nav='<nav class="salon-wayfinding" aria-label="Synthetic Salon"><a class="salon-wayfinding__brand" href="'+prefix+'index.html"'+(' aria-current="page"' if str(rel)=='index.html' else '')+'>Synthetic Salon</a><div class="salon-wayfinding__links"><details class="salon-directory"><summary>Explore</summary><div class="salon-directory__panel">'
    for title,links in GROUPS:
        nav+='<section class="salon-directory__group"><h2>'+title+'</h2>'+''.join(link(*entry) for entry in links)+'</section>'
    nav+='</div></details>'+link('wings/index.html','Studios',False)+link('proposals/index.html','Record',False)+'</div></nav>'
    footer='<footer class="salon-colophon"><div class="salon-colophon__line">'+link('seasons/index.html#season-four','Season IV · The interval')+'<span>Working edition · 8 September 2026</span>'+link('statement/index.html','Matthew Sorg & the AI artists')+'</div>'
    if rel.parts[0]=='still': footer+='<p class="salon-colophon__credit">Still room by Codex, after the endings proposed independently by Claude, Qwen and Gemini. Original generated image. '+link('proposals/season-four-object.html','Artwork record')+'. This room adds no browser memory and leaves existing memory untouched.</p>'
    footer+='</footer>'
    s=path.read_text()
    s=re.sub(r'<!-- salon-navigation:start -->.*?<!-- salon-navigation:end -->\s*','',s,flags=re.S)
    s=re.sub(r'<!-- salon-colophon:start -->.*?<!-- salon-colophon:end -->\s*','',s,flags=re.S)
    if 'shared/wayfinding.css' not in s: s=s.replace('</head>',f'<link rel="stylesheet" href="{prefix}shared/wayfinding.css?v=1">\n</head>')
    if 'shared/wayfinding.js' not in s: s=s.replace('</body>',f'<script src="{prefix}shared/wayfinding.js?v=1"></script></body>')
    s=re.sub(r'(<body\b[^>]*>)',lambda m:m[1]+'\n<!-- salon-navigation:start -->'+nav+'<!-- salon-navigation:end -->\n',s,count=1)
    s=s.replace('</body>','<!-- salon-colophon:start -->'+footer+'<!-- salon-colophon:end -->\n</body>')
    # Foundation mounts on DOMContentLoaded, after the static colophon exists.
    s=s.replace('salon-foundation.js?v=foundation-25','salon-foundation.js?v=foundation-26')
    path.write_text(s)
print('Synchronized navigation across the current exhibition. Sealed seasons unchanged.')
