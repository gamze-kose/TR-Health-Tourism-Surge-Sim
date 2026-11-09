#!/usr/bin/env python3
"""Writes docs/parameters.md and docs/needs_table.md from the model definitions."""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "src"))
from needs_table import LAYERS, NEEDS, NOT_USED, SOURCES, SHARE_BASIS, STAYS  # noqa: E402
from parameters import PARAMS  # noqa: E402

LINE = {"ICU": "Intensive care", "TRAUMA": "Surgery and trauma", "DIAL": "Dialysis", "ONCO": "Cancer care", "REHAB": "Rehabilitation", "STEP": "Step-down recovery"}
TYPE = {"disaster": "Sudden disaster", "conflict": "Armed conflict", "epidemic": "Epidemic"}
KIND = {"yes": "Can travel", "later": "After stabilising", "partly": "Partly", "no": "Stays at home"}


def clean(x):
    return str(x).replace("|", "/")


def params():
    names = {"data": "Official data", "lit": "Published estimate", "derived": "Derived from sourced figures", "assumption": "Assumption", "setting": "Setting"}
    out = ["# Model parameters", "",
           "Every value used by the model, with its range and basis. Ranges feed a Beta-PERT distribution in the Monte Carlo analysis. Parameters marked as assumptions have no published estimate that could be located and are explored in the sensitivity analysis. Parameters of the needs lens have no range, so that core results stay as published.", "",
           "| Parameter | Key | Value | Range | Type | Basis |", "|---|---|---|---|---|---|"]
    for k, v in PARAMS.items():
        rng = f"{v['low']} to {v['high']}" if "low" in v else ""
        out.append(f"| {clean(v.get('label', k))} | `{k}` | {v['base']} | {rng} | {names.get(v['kind'], v['kind'])} | {clean(v.get('source', ''))} |")
    with open(os.path.join(ROOT, "docs", "parameters.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(out) + "\n")


def pct(v):
    return f"{v * 100:.1f}".rstrip("0").rstrip(".")


def needs():
    used = []

    def cite(ids):
        for i in ids:
            if i not in used:
                used.append(i)
        return ", ".join(f"[{used.index(i) + 1}]" for i in ids)

    out = ["# Care needs created by crises", "",
           "The table states what the literature reports for each need, whether it can move abroad, and what share of each care line it takes in the model. Numbers in brackets refer to the list at the end. Statements marked as the authors' judgement have no source and are open to expert review.", ""]
    for layer, name in LAYERS.items():
        out += [f"## {name}", ""]
        for n in [x for x in NEEDS if x["layer"] == layer]:
            out.append(f"### {n['label']}")
            out.append("")
            if n.get("why"):
                out += [n["why"], ""]
            for e in n.get("evidence", []):
                out.append(f"- {e['t']} {cite(e['s'])}")
            if n.get("evidence"):
                out.append("")
            t = n.get("travel", {})
            jd = f" Authors' judgement: {t['judge']}" if t.get("judge") else ""
            out.append(" ".join(f"**Moving abroad.** {KIND.get(t.get('kind'), '')}. {t.get('when', '')} {cite(t.get('s', []))}{jd}".split()))
            out.append("")
            if n.get("care"):
                out += [f"**Care needed.** {n['care']}", ""]
            if n.get("bridge"):
                out += [f"**Health tourism capacity that can help.** {n['bridge']}", ""]
            rows = [f"{TYPE[k]}: " + ", ".join(f"{LINE[c]} {pct(v)}%" for c, v in s.items()) for k, s in n["shares"].items()]
            if rows:
                out += ["**Share of direct referrals in the model.** " + "; ".join(rows) + ".", ""]
    out += ["## Needs that stay at home", ""]
    for s in STAYS:
        jd = f" Authors' judgement: {s['judge']}" if s.get("judge") else ""
        out.append(" ".join(f"- **{s['label']}.** {s['why']} {cite(s.get('s', []))}{jd}".split()))
    out += ["", NOT_USED, "", "## How the shares were set", "",
            "Numbers are percentages of a care line's direct referrals.", ""]
    for b in SHARE_BASIS:
        bits = " ".join(x for x in [b["data"], cite(b["s"]) if b["s"] else "", b["assumed"]] if x)
        out.append(f"- **{b['crisis']}, {b['line']}.** {bits}")
    out += ["", "## Points to check before citing", "",
            "- Every statement here was read through automated fetching and should be compared with the original.",
            "- Yağcı 2023 is a conference abstract. Its author list could not be read in full.",
            "- The author list of Idrees 2025 could not be read in full on the page opened.",
            "- Mendeş 2025 is an early online article without volume or pages.",
            "- The WHO summary sheets on medical evacuations print no publisher or date. In the December 2025 sheet, the pairing of countries with counts is unclear, so the figure for Türkiye is not used.",
            "- The Stimson and The Conversation pieces are commentaries. Their pages show no date.",
            "", "## References", ""]
    for i, k in enumerate(used):
        q = SOURCES.get(k)
        out.append(f"[{i + 1}] {q['c']} {q['u']}" if q else f"[{i + 1}] {k}")
    with open(os.path.join(ROOT, "docs", "needs_table.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(out) + "\n")


def readiness():
    labels = {"spec": "Specialist physicians", "qual": "Qualified beds", "icu": "Intensive care beds", "surg": "Surgical operations", "dent": "Dentists", "nurse": "Nurses per 1,000 residents",
              "idle": "Spare bed capacity", "fac": "Medical faculties", "dial": "Dialysis capacity", "hotel": "Licensed hotel beds", "therm": "Thermal resources", "warm": "Warm sea coast",
              "pax": "International air passengers", "near": "Closeness to neighbouring countries", "share": "Health tourists today", "auth": "Authorised health tourism facilities",
              "s_rt": "Radiotherapy devices", "s_heart": "Heart surgery centres"}
    out = ["# City readiness", "",
           "Each of the 81 cities is rated for each care need. A rating combines specialised care, general capacity, lodging, transport links and existing health tourism. It is relative to the best city for that need. The method is TOPSIS: for each need, weighted values v = w x are compared with the best and worst value on each indicator, and the score is C = D- / (D+ + D-), rescaled so that the best city has 1.", "",
           "## Indicators", "",
           "| Indicator | Source and coverage |", "|---|---|",
           "| Specialist physicians, qualified beds, intensive care beds, nurses | Ministry of Health Yearbook 2024, 81 provinces |",
           "| Surgical operations, dentists | Yearbook 2023, 81 provinces |",
           "| Spare bed capacity | Derived from estimated authorised beds and occupancy |",
           "| Medical faculties | Odabaşı 2023, data for 2022, 81 provinces |",
           "| Dialysis capacity | Yearbook 2024, regional devices per million |",
           "| Radiotherapy devices | Becerir 2021: regional counts for 2019 and densities for six cities, shared out within regions by specialists. An estimate |",
           "| Heart surgery centres | Kervan 2011, 46 provinces, about 2009 |",
           "| Licensed hotel beds | Ministry of Culture and Tourism, August 2026, 81 provinces |",
           "| Thermal resources | Press anchors for 5 provinces and the Ministry list for 23 provinces. No entry does not mean no springs |",
           "| Warm sea coast | Geography: warm coast 1, north Aegean 0.6, Marmara 0.3, Black Sea 0.2 |",
           "| International air passengers | DHMİ, January to May 2026 |",
           "| Closeness to neighbouring countries | Computed from travel time |",
           "| Health tourists today | Estimate, see `data/SOURCES.md` |",
           "| Authorised health tourism facilities | Işıkçelik 2026, 41 provinces. The column order in the source is inferred, see `data/raw/specialised/SOURCES.md`. Which provinces can receive patients is set separately, see `docs/course_of_years.md` |", "",
           "No province list of burn units, rehabilitation hospitals, prosthetic workshops, paediatric centres or specialists by branch was found. Those needs are rated from general indicators.", "",
           "## Weights", ""]
    for n in NEEDS:
        tot = sum(n["weights"].values())
        out.append(f"- **{n['label']}.** " + ", ".join(f"{labels.get(k, k).lower()} {round(v / tot * 100)}%" for k, v in sorted(n["weights"].items(), key=lambda x: -x[1])) + ".")
    out += ["", "## Ratings and stars", "",
            "A rating of one, two or three stars has gain g of 0.25, 0.60 or 1. The care places added on line l in city i at horizon H (years) are", "",
            "    sum over needs of  g x (1 - r + r x C) x (1 - exp(-H / 3)) x conversion(need, l) x reference(l)", "",
            "with r = 0.7 by default. One reference centre adds 24 intensive care beds, 200 surgical beds, 150 dialysis patients, 500 cancer patients, 150 rehabilitation beds or 300 step-down places. These constants are assumptions and can be changed in the interface. A city with stars becomes visible to national dispatchers.", "",
            "Capacity without stars grows by the city's qualified bed growth between 2015 and 2023, bounded to between -1% and 6% a year. Hotel beds grow by 2% a year.", "",
            "## Limits", "",
            "- The indicators measure capacity and access, not clinical quality or accreditation.",
            "- Several indicators are dated or estimated, as listed above.",
            "- The record of past crises is shown to help readers judge the results. It is not used to allocate patients.", "",
            "Full references for the indicators are in `../data/SOURCES.md` and in the `SOURCES` files under `../data/raw/`."]
    with open(os.path.join(ROOT, "docs", "city_readiness.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(out) + "\n")


if __name__ == "__main__":
    params()
    needs()
    readiness()
    print("docs written")
