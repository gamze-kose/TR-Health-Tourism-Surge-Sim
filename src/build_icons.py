#!/usr/bin/env python3
"""Builds data/icons.svg, the inline sprite of Tabler Icons (MIT) used by the interface.

Usage: python3 src/build_icons.py <path to tabler icons/outline>
"""
import os
import re
import sys

NAMES = """heart-rate-monitor bandage droplet ribbon-health wheelchair home-heart bed
scissors dental eye sparkles scale baby-carriage bone heartbeat stretching bath leaf droplet-half old
user man woman walk users-group user-check user-x crutches users
wave-saw-tool flame lock virus home-exclamation world adjustments barrier-block
building-hospital beach building-monument sun plane-departure mountain ripple building road stethoscope microscope pill target-arrow
map-pin flag star plane ambulance clock-hour-4 coin bolt pin x player-play player-pause share copy search info-circle chart-bar route history
chevron-down plus minus trash refresh bookmark device-floppy layout-grid activity shield-plus first-aid-kit alert-triangle check
brain droplets mood-kid baby-bottle lungs ear hand-stop mood-sad
arrow-right arrow-back-up calendar-time door-exit hand-click lock-open language settings
trending-up rocket chart-line restore map-pin-plus bulb""".split()


def main():
    src = sys.argv[1]
    out = ['<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true">']
    out.append("<!-- Tabler Icons, MIT License, Copyright (c) 2020-2024 Pawel Kuna -->")
    for n in NAMES:
        with open(os.path.join(src, n + ".svg"), encoding="utf-8") as f:
            svg = f.read()
        body = re.search(r"<svg[^>]*>(.*)</svg>", svg, re.S).group(1)
        body = re.sub(r'<path stroke="none"[^>]*/>', "", body)
        body = re.sub(r"\s+", " ", body).strip()
        out.append(f'<symbol id="i-{n}" viewBox="0 0 24 24">{body}</symbol>')
    out.append("</svg>")
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    with open(os.path.join(root, "data", "icons.svg"), "w", encoding="utf-8") as f:
        f.write("".join(out))
    print("icons", len(NAMES), "bytes", sum(len(x) for x in out))


if __name__ == "__main__":
    main()
