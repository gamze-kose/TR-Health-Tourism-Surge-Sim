#!/usr/bin/env python3
"""Adds city potential indicators and service definitions to data/model.json and writes data/cities.json.

The indicators feed the forecast layer (engine.js: scoreServices, applyPlan, commercialForecast).
Nothing written here changes a run with an empty plan.
"""
import csv
import json
import math
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "data", "raw", "cities")
sys.path.insert(0, os.path.join(ROOT, "src"))
from needs_table import BURN_BEDS, LAYERS, NEEDS, NOT_USED, ROUTINE_BASE, SOURCES, SPEC_KEYS, SHARE_BASIS, STAYS  # noqa: E402
NAME_FIX = {"Hakkari": "Hakkâri", "Elazig": "Elazığ"}


def rows(name):
    path = os.path.join(RAW, name)
    if not os.path.exists(path):
        return []
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))


def fix(n):
    return NAME_FIX.get(n, n)


def num(x):
    x = (x or "").replace(",", "").strip()
    return float(x) if x else None


# Sea coasts, used for a transparent climate proxy. Warm coast 1, north Aegean 0.6, Marmara 0.3, Black Sea 0.2.
COAST = {
    "Antalya": ("Mediterranean", 1), "Mersin": ("Mediterranean", 1), "Adana": ("Mediterranean", 1), "Hatay": ("Mediterranean", 1),
    "Muğla": ("Aegean and Mediterranean", 1), "Aydın": ("Aegean", 1), "İzmir": ("Aegean", 1), "Balıkesir": ("Aegean and Marmara", 0.6),
    "Çanakkale": ("Aegean and Marmara", 0.6), "Edirne": ("Aegean", 0.6), "İstanbul": ("Marmara and Black Sea", 0.3), "Tekirdağ": ("Marmara", 0.3),
    "Kocaeli": ("Marmara and Black Sea", 0.3), "Yalova": ("Marmara", 0.3), "Bursa": ("Marmara", 0.3), "Kırklareli": ("Black Sea", 0.2),
    "Sakarya": ("Black Sea", 0.2), "Düzce": ("Black Sea", 0.2), "Zonguldak": ("Black Sea", 0.2), "Bartın": ("Black Sea", 0.2),
    "Kastamonu": ("Black Sea", 0.2), "Sinop": ("Black Sea", 0.2), "Samsun": ("Black Sea", 0.2), "Ordu": ("Black Sea", 0.2),
    "Giresun": ("Black Sea", 0.2), "Trabzon": ("Black Sea", 0.2), "Rize": ("Black Sea", 0.2), "Artvin": ("Black Sea", 0.2),
}

# Filled from data/raw/cities when a province list of specialised units exists.
SPECIAL_INDICATORS = [
    ("s_rt", "Radiotherapy devices (estimate from regional counts)", "health"), ("s_heart", "Heart surgery centres (2009)", "health"),
    ("auth", "Authorised health tourism facilities", "presence"),
]

INDICATORS = [
    ("spec", "Specialist physicians", "health"), ("qual", "Qualified hospital beds", "health"), ("icu", "Intensive care beds", "health"),
    ("surg", "Surgical operations a year", "health"), ("dent", "Dentists", "health"), ("nurse", "Nurses per 1,000 residents", "health"),
    ("idle", "Spare bed capacity", "health"), ("fac", "Medical faculties", "health"), ("dial", "Dialysis capacity", "health"),
    ("grow", "Growth in specialists since 2015", "health"),
    ("hotel", "Licensed hotel beds", "tourism"), ("therm", "Thermal resources", "tourism"), ("unesco", "UNESCO World Heritage sites", "tourism"),
    ("warm", "Warm sea coast", "tourism"),
    ("pax", "International air passengers", "access"), ("near", "Closeness to neighbouring countries", "access"),
    ("share", "Health tourists today", "presence"),
]

# Places added on an emergency line by one fully developed centre at the top level, before conversion and readiness. Assumptions.
REF_ADD = {"ICU": 24, "TRAUMA": 200, "DIAL": 150, "ONCO": 500, "REHAB": 150, "STEP": 300}
SERVICE_NAME = {"hair transplant": "hair", "dental": "dental", "thermal and balneotherapy": "thermal"}


def haversine(a, b, c, d):
    r = math.pi / 180
    x = math.sin((c - a) * r / 2) ** 2 + math.cos(a * r) * math.cos(c * r) * math.sin((d - b) * r / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(x))


def lognorm(values):
    m = max(values) or 1
    return [math.log1p(v) / math.log1p(m) for v in values]


def parse_sources(fname):
    """Reads source_id, citation and URL from the markdown tables of a sources file."""
    out = {}
    path = os.path.join(RAW, fname)
    if not os.path.exists(path):
        return out
    with open(path, encoding="utf-8") as f:
        for line in f:
            if not line.startswith("| "):
                continue
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if len(cells) >= 3 and cells[2].startswith("http") and re.match(r"^[A-Z0-9_]+$", cells[0]):
                out[cells[0]] = {"c": cells[1], "u": cells[2]}
    return out


def yearly_slope(history, key, latest):
    """Yearly growth from a log-linear fit over 2015 to 2024, limited to between -1% and +4%."""
    pts = [(y, num(r[key])) for y, r in history.items() if num(r[key])] + [(2024, latest)]
    pts = [(y, v) for y, v in pts if v and v > 0]
    if len(pts) < 3:
        return 0.01
    my = sum(y for y, _ in pts) / len(pts)
    ml = sum(math.log(v) for _, v in pts) / len(pts)
    slope = sum((y - my) * (math.log(v) - ml) for y, v in pts) / sum((y - my) ** 2 for y, _ in pts)
    return round(max(-0.01, min(0.04, math.exp(slope) - 1)), 4)


def main():
    path = os.path.join(ROOT, "data", "model.json")
    with open(path, encoding="utf-8") as f:
        model = json.load(f)
    prov = model["provinces"]
    by_name = {p["name"]: p for p in prov}

    hist = {}
    for r in rows("province_history.csv"):
        n = fix(r["province_tr"])
        hist.setdefault(n, {})[int(r["year"])] = r

    fac = {fix(r["province_tr"]): num(r["count"]) or 0 for r in rows("medical_faculties_by_province.csv")}
    thermal_centres = {}
    for r in rows("thermal_by_province.csv"):
        if r["measure"].startswith("ministry_thermal_tourism_centres_listed"):
            thermal_centres[fix(r["province_tr"])] = num(r["value"]) or 0
    unesco = {}
    for r in rows("unesco_by_province.csv"):
        # Gordion lies at Yassıhöyük in Polatlı district, Ankara. The province was added by hand.
        n = fix(r["province_tr"]) or ("Ankara" if r["property"] == "Gordion" else "")
        if n:
            unesco.setdefault(n, []).append(r["property"])
    visitors = {fix(r["province_tr"]): num(r["foreign_visitors"]) for r in rows("visitors_by_province.csv")}
    nights = {fix(r["province_tr"]): (num(r["foreign_nights"]), num(r["domestic_nights"])) for r in rows("accommodation_by_province.csv")}
    jan = {fix(r["province_tr"]): num(r["jan_mean_c"]) for r in rows("climate_by_province.csv")}

    signals = {}
    for r in rows("forward_signals.csv"):
        status = r["status"]
        if "not opened" in status or "headline" in status:
            continue
        signals.setdefault(fix(r["province_tr"]), []).append({"t": r["project"], "s": status, "y": r["year"], "src": r["source_id"]})
    mentions = {}
    for r in rows("service_leaders.csv"):
        # Press mentions of dental care and hair transplants are not crisis care and stay out of the panels.
        if "not opened" in r["evidence"] or r["service"] != "thermal and balneotherapy":
            continue
        mentions.setdefault(fix(r["province_tr"]), []).append({"k": SERVICE_NAME.get(r["service"], ""), "t": r["evidence"], "y": r["year"], "src": r["source_id"]})

    precedents = {}
    for r in rows("precedents.csv"):
        n = fix(r["province_tr"])
        precedents.setdefault(n, []).append({"y": r["year"], "e": r["event"], "r": r["role_short"], "v": num(r["count_value"]), "u": r["count_unit"], "s": r["source_id"]})
    for lst in precedents.values():
        lst.sort(key=lambda x: (x["s"] == "S16", -int(x["y"] or 0)))

    # Specialised capacity. Coverage is uneven: see data/raw/specialised/SOURCES.md.
    SPEC = os.path.join(ROOT, "data", "raw", "specialised")

    def spec_rows(name):
        with open(os.path.join(SPEC, name), encoding="utf-8") as f:
            return list(csv.DictReader(f))

    auth = {}
    for r in spec_rows("authorised_by_province.csv"):
        m = re.search(r"K4=(\d+)", r["note"])
        if m:
            auth[fix(r["province_tr"])] = int(m.group(1))
    heart = {}
    for r in spec_rows("tertiary_centres.csv"):
        m = re.match(r"(\d+) centre", r["facility"])
        if r["type"] == "adult_heart" and m and r["province_tr"] != "TÜRKİYE":
            heart[fix(r["province_tr"])] = int(m.group(1))
    ftr = {}
    for r in spec_rows("rehab_hospitals.csv"):
        if r["type"] == "ftr_specialty_hospital" and r["source_id"] == "S08":
            ftr.setdefault(fix(r["province_tr"]), []).append(re.sub(r"^T\.C\. SB\. SBÜ\. ", "", r["facility"]))
    rt_region, rt_density = {}, {}
    RT_NAME = {"East Anatolia": "Eastern Anatolia", "Southeast Anatolia": "Southeastern Anatolia"}
    for r in spec_rows("radiotherapy.csv"):
        n = r["province_tr"]
        if n.startswith("REGION: "):
            k = n[8:]
            rt_region[RT_NAME.get(k, k)] = num(r["devices"])
        else:
            m = re.search(r"Density only: ([\d.]+)", r["note"])
            if m:
                rt_density[fix(n)] = float(m.group(1))
    rt = {}
    for reg, devices in rt_region.items():
        members = [p for p in prov if p["region"] == reg]
        fixed = 0
        for p in members:
            if p["name"] in rt_density:
                rt[p["name"]] = rt_density[p["name"]] * p["pop"] / 1e6
                fixed += rt[p["name"]]
        others = [p for p in members if p["name"] not in rt_density]
        weight = sum(p["specialists"] for p in others) or 1
        for p in others:
            rt[p["name"]] = max(0, devices - fixed) * p["specialists"] / weight
    icu_total = sum(p["icuBeds"] for p in prov) or 1

    # Indicators.
    spec = [p["specialists"] for p in prov]
    last = lambda n, k: num(hist.get(n, {}).get(2023, {}).get(k)) or 0
    first = lambda n, k: num(hist.get(n, {}).get(2015, {}).get(k)) or 0
    surg = [last(p["name"], "surgeries") for p in prov]
    dent = [last(p["name"], "dentists") for p in prov]
    occ_safe = model["params"]["occSafe"]["base"]
    idle = [p["authBeds"] * max(0, occ_safe - p["occAuth"]) for p in prov]
    nurse_pc = [p["nurses"] / p["pop"] * 1000 if p["pop"] else 0 for p in prov]
    nmin, nmax = min(nurse_pc), max(nurse_pc)
    thermal_beds = [p["thermalBeds"] for p in prov]
    tmax = max(thermal_beds) or 1
    cmax = max(thermal_centres.values() or [1])
    gates = {o["id"]: o["landGates"] for o in model["origins"]}
    neighbours = [o for o in model["origins"] if o["id"] in ("O01", "O02", "O03", "O04", "O05", "O06", "O07", "O08")]
    near = []
    for p in prov:
        s = 0
        for o in neighbours:
            best = haversine(o["lat"], o["lon"], p["lat"], p["lon"]) * 1.3 / 70 + 2
            s += math.exp(-best / 8)
        near.append(s / len(neighbours))
    nearmin, nearmax = min(near), max(near)
    ln = {k: lognorm(v) for k, v in dict(
        spec=spec, qual=[p["qualifiedBeds"] for p in prov], icu=[p["icuBeds"] for p in prov], surg=surg, dent=dent, idle=idle,
        dial=[p["dialSlots"] for p in prov], hotel=[p["hotelBeds"] for p in prov], pax=[p["intlPax"] for p in prov]).items()}
    smax = max(p["htShare"] for p in prov) or 1

    for i, p in enumerate(prov):
        n = p["name"]
        centres = thermal_centres.get(n, 0)
        therm = max(math.sqrt(thermal_beds[i] / tmax), centres / cmax)
        s15, s23 = first(n, "specialists"), last(n, "specialists")
        cagr = (s23 / s15) ** (1 / 8) - 1 if s15 > 0 and s23 > 0 else 0
        b15, b23 = first(n, "qualified_beds"), last(n, "qualified_beds")
        bed_cagr = (b23 / b15) ** (1 / 8) - 1 if b15 > 0 and b23 > 0 else 0.01
        ind = {k: round(v[i], 4) for k, v in ln.items()}
        ind.update(
            nurse=round((nurse_pc[i] - nmin) / (nmax - nmin), 4), fac=round(math.log1p(fac.get(n, 0)) / math.log1p(8), 4) if fac.get(n, 0) < 8 else 1,
            grow=round(max(0, min(1, (cagr + 0.02) / 0.10)), 4), therm=round(therm, 4), unesco=round(min(1, len(unesco.get(n, [])) / 3), 4),
            warm=COAST.get(n, ("", 0))[1], near=round((near[i] - nearmin) / (nearmax - nearmin), 4), share=round(math.sqrt(p["htShare"] / smax), 4),
        )
        ind["auth"] = round(math.log1p(auth.get(n, 0)) / math.log1p(max(auth.values())), 4)
        ind["s_heart"] = round(math.log1p(heart.get(n, 0)) / math.log1p(max(heart.values())), 4)
        ind["s_rt"] = round(math.log1p(rt.get(n, 0)) / math.log1p(max(rt.values())), 4)
        p["spec"] = {"burn": round(BURN_BEDS * p["icuBeds"] / icu_total, 2)}
        p["ind"] = ind
        p["htEligible"] = p["htShare"] > 0
        p["bedTrend"] = round(max(-0.01, min(0.06, bed_cagr)), 4)
        p["trendBeds"] = yearly_slope(hist[n], "beds", p["beds"])
        p["trendIcu"] = yearly_slope(hist[n], "icu_beds", p["icuBeds"])
        p["trendSpec"] = yearly_slope(hist[n], "specialists", p["specialists"])
        p["cagrSpec"] = round(cagr, 4)

    indicators = [{"key": k, "label": l, "group": g} for k, l, g in INDICATORS]
    for key, label, group in SPECIAL_INDICATORS:
        if any(p["ind"].get(key) for p in prov):
            indicators.append({"key": key, "label": label, "group": group})
    known = {x["key"] for x in indicators}
    services = []
    for n in NEEDS:
        w = {k: v for k, v in n["weights"].items() if k in known}
        tot = sum(w.values())
        w = {k: v / tot for k, v in w.items()}
        item = {k: n.get(k) for k in ("key", "label", "short", "icon", "layer", "shares", "conv", "travel", "care", "bridge", "why", "evidence", "spec")}
        item.update(weights=w, group=n["layer"], mix=n.get("mix", 0))
        services.append(item)
    assert abs(sum(s["mix"] for s in services) - 1) < 1e-9
    for t, c in {"disaster": ("ICU", "TRAUMA", "REHAB", "STEP", "DIAL"), "conflict": ("ICU", "TRAUMA", "REHAB", "STEP"), "epidemic": ("ICU", "STEP")}.items():
        for line in c:
            total = sum(n["shares"].get(t, {}).get(line, 0) for n in NEEDS)
            assert abs(total - 1) < 1e-6, (t, line, total)

    model["services"] = services
    model["indicators"] = indicators
    model["groups"] = LAYERS
    model["stays"] = STAYS
    model["notUsed"] = NOT_USED
    model["shareBasis"] = SHARE_BASIS
    model["specKeys"] = SPEC_KEYS
    params = model["params"]
    outlook_dir = os.path.join(ROOT, "data", "raw", "outlook")
    with open(os.path.join(outlook_dir, "population_projection.csv"), encoding="utf-8") as f:
        proj = list(csv.DictReader(f))
    outlook = {"pop": [[int(r["year"]), int(r["population"])] for r in proj if r["population"]], "age65": [[int(r["year"]), float(r["age65_pct"])] for r in proj],
               "payingBaseYear": 2025, "ftrAdded": {"province": 34, "beds": 705, "year": 2025}}
    model["meta"] = {
        "outlook": outlook, "scales": model.get("scales", {}),
        "conversion": {s["key"]: s["conv"] for s in services}, "refAdd": REF_ADD, "nHt": 1398580, "revPerPatient": 3022452000 / 1398580,
        "htIcuShare": params["htIcuShare"]["base"], "routineBase": ROUTINE_BASE,
    }
    with open(path, "w", encoding="utf-8") as f:
        json.dump(model, f, ensure_ascii=False)

    # Everything the city panels show.
    keys = [("hospitals", "hospitals"), ("beds", "beds"), ("qualified", "qualified_beds"), ("icu", "icu_beds"), ("occ", "occupancy_pct"), ("stay", "avg_stay_days"),
            ("inp", "inpatients"), ("surg", "surgeries"), ("spec", "specialists"), ("phys", "physicians"), ("dent", "dentists"), ("nurse", "nurses")]
    cities = {"years": [2015, 2017, 2019, 2021, 2023, 2024], "hist": {}, "info": {}, "precedents": {}, "sources": {}}
    y2024 = {"hospitals": "hospitals", "beds": "beds", "qualified": "qualifiedBeds", "icu": "icuBeds", "spec": "specialists", "phys": "physicians", "nurse": "nurses"}
    for p in prov:
        n, pid = p["name"], str(p["id"])
        h = hist.get(n, {})
        cities["hist"][pid] = {k: [num(h.get(y, {}).get(col)) for y in cities["years"][:-1]] + [p[y2024[k]] if k in y2024 else (round(p["occAll"] * 100, 1) if k == "occ" else None)] for k, col in keys}
        v = visitors.get(n)
        nf, nd = nights.get(n, (None, None))
        cities["info"][pid] = {
            "fac": fac.get(n, 0), "unesco": unesco.get(n, []), "visitors": v, "nightsF": nf, "nightsD": nd, "centres": thermal_centres.get(n, 0),
            "jan": jan.get(n), "coast": COAST.get(n, ("", 0))[0], "signals": signals.get(n, []), "mentions": mentions.get(n, []),
            "auth": auth.get(n), "heart": heart.get(n), "ftr": ftr.get(n, []),
        }
        cities["precedents"][pid] = precedents.get(n, [])
    cities["sources"].update(parse_sources("SOURCES_attraction.md"))
    cities["sources"].update(parse_sources("SOURCES_precedents.md"))
    cities["sources"].update(SOURCES)
    with open(os.path.join(ROOT, "data", "cities.json"), "w", encoding="utf-8") as f:
        json.dump(cities, f, ensure_ascii=False, separators=(",", ":"))
    print("indicators", len(indicators), "services", len(services), "sources", len(cities["sources"]), "panel bytes", os.path.getsize(os.path.join(ROOT, "data", "cities.json")))


if __name__ == "__main__":
    main()
