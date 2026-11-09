#!/usr/bin/env python3
"""Assembles the province table, origin table, parameters and scenarios into data/model.json."""
import csv
import json
import math
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "data", "raw")
sys.path.insert(0, os.path.join(ROOT, "src"))
from parameters import PARAMS, N_HT, REV_PER_PATIENT  # noqa: E402

NAME_FIX = {"Hakkari": "Hakkâri", "Elazig": "Elazığ"}


def read(name):
    with open(os.path.join(RAW, name), encoding="utf-8") as f:
        return {NAME_FIX.get(r["province_tr"], r["province_tr"]): r for r in csv.DictReader(f)}


def num(x):
    x = (x or "").replace(",", "").strip()
    return float(x) if x else 0.0


NUTS1 = {
    "İstanbul": ["İstanbul"],
    "Batı Marmara": ["Tekirdağ", "Edirne", "Kırklareli", "Balıkesir", "Çanakkale"],
    "Ege": ["İzmir", "Aydın", "Denizli", "Muğla", "Manisa", "Afyonkarahisar", "Kütahya", "Uşak"],
    "Doğu Marmara": ["Bursa", "Eskişehir", "Bilecik", "Kocaeli", "Sakarya", "Düzce", "Bolu", "Yalova"],
    "Batı Anadolu": ["Ankara", "Konya", "Karaman"],
    "Akdeniz": ["Antalya", "Isparta", "Burdur", "Adana", "Mersin", "Hatay", "Kahramanmaraş", "Osmaniye"],
    "Orta Anadolu": ["Kırıkkale", "Aksaray", "Niğde", "Nevşehir", "Kırşehir", "Kayseri", "Sivas", "Yozgat"],
    "Batı Karadeniz": ["Zonguldak", "Karabük", "Bartın", "Kastamonu", "Çankırı", "Sinop", "Samsun", "Tokat", "Çorum", "Amasya"],
    "Doğu Karadeniz": ["Trabzon", "Ordu", "Giresun", "Rize", "Artvin", "Gümüşhane"],
    "Kuzeydoğu Anadolu": ["Erzurum", "Erzincan", "Bayburt", "Ağrı", "Kars", "Iğdır", "Ardahan"],
    "Ortadoğu Anadolu": ["Malatya", "Elazığ", "Bingöl", "Tunceli", "Van", "Muş", "Bitlis", "Hakkâri"],
    "Güneydoğu Anadolu": ["Gaziantep", "Adıyaman", "Kilis", "Şanlıurfa", "Diyarbakır", "Mardin", "Batman", "Şırnak", "Siirt"],
}
# Haemodialysis devices per million population by NUTS-1 region, Yearbook 2024, Table 7.6.
DIAL_PM = {
    "Batı Karadeniz": 317.1, "Doğu Karadeniz": 291.0, "Orta Anadolu": 286.3, "Ege": 273.3, "Akdeniz": 240.6,
    "Batı Marmara": 236.1, "Batı Anadolu": 233.2, "Doğu Marmara": 225.3, "Kuzeydoğu Anadolu": 211.7,
    "İstanbul": 190.9, "Ortadoğu Anadolu": 169.5, "Güneydoğu Anadolu": 133.3,
}
PROV_NUTS = {p: k for k, v in NUTS1.items() for p in v}

# Documented thermal bed anchors. Press-reported destination totals, a lower bound for the country.
THERMAL = {"Afyonkarahisar": 17250, "Ankara": 7000, "Yalova": 5000, "Denizli": 4428, "Balıkesir": 2500}

# Airport provinces that the DHMİ table leaves blank or labels by airport name.
AIRPORT_PROV = {"Gazipaşa Alanya": "Antalya", "Kapadokya": "Nevşehir", "Zafer": "Kütahya", "Ordu-Giresun": "Ordu", "Rize-Artvin": "Rize"}

# Reference origins for the batch analyses. They are numbered locations and stand for no country or event.
# Road gates are plate codes of the province on the Turkish side.
GATES = {"O01": [31, 79, 27, 63, 47], "O02": [73], "O03": [4, 65, 30], "O04": [8, 75], "O07": [22, 39], "O08": [22], "O06": [76]}

_POINTS = [
    (35.0, 38.5, 1.0), (36.2, 43.9, 1.0), (37.5, 46.0, 1.0), (41.7, 44.8, 1.0), (40.2, 44.5, 1.0), (40.4, 49.9, 1.0), (42.7, 23.3, 1.0), (39.0, 22.0, 1.0),
    (33.9, 35.5, 1.0), (31.4, 34.4, 0.02), (31.9, 35.9, 1.0), (30.0, 31.2, 1.0), (32.9, 13.2, 1.0), (15.6, 32.5, 0.5), (15.4, 44.2, 0.5), (2.05, 45.3, 1.0),
    (34.5, 69.2, 0.5), (33.7, 73.1, 1.0), (50.45, 30.5, 1.0), (43.9, 18.4, 1.0), (42.7, 21.2, 1.0), (41.3, 19.8, 1.0), (42.0, 21.4, 1.0), (51.2, 71.4, 1.0),
    (41.3, 69.2, 1.0), (37.95, 58.4, 1.0), (42.9, 74.6, 1.0),
]
ORIGINS = [(f"O{i + 1:02d}", f"Reference origin {i + 1}", lat, lon, acc) for i, (lat, lon, acc) in enumerate(_POINTS)] + [("TUR", "Türkiye (domestic)", 40.8, 29.0, 1.0)]

QUAKE_INJURED = 80278  # Kahramanmaraş 2023, Yılmaz 2023.
CONFLICT_PER_DAY = 180  # 172,000 injured in about 31 months in a documented conflict, WHO EMRO 2026 (derived).
MARMARA_DAMAGE = {34: 0.35, 41: 0.25, 59: 0.25, 77: 0.25, 54: 0.10, 16: 0.10}

SCENARIOS = [
    {"id": "quake", "name": "Earthquake next door", "camera": "reg", "hubAnalysis": True, "selectable": True,
     "note": "A hypothetical earthquake with 80,278 injured strikes a neighbouring country.",
     "events": [{"type": "disaster", "injured": QUAKE_INJURED, "start": 0, "origins": {"O03": 1}}]},
    {"id": "conflict", "name": "Armed conflict, open corridor", "camera": "reg", "hubAnalysis": True, "selectable": True, "commercialMult": 0.95,
     "note": "A hypothetical year of conflict in a neighbouring country with road access, and an open exit route for referred patients.",
     "events": [{"type": "conflict", "injuredPerDay": CONFLICT_PER_DAY, "duration": 365, "start": 0, "dialysisPatients": 1100, "cancerPatients": 11000, "origins": {"O01": 1}}]},
    {"id": "restricted", "name": "Armed conflict, restricted exit", "camera": "reg", "commercialMult": 0.95,
     "note": "The same hypothetical conflict intensity, with exit permits limited to a published clearance rate.",
     "events": [{"type": "conflict", "injuredPerDay": CONFLICT_PER_DAY, "duration": 365, "start": 0, "dialysisPatients": 1100, "cancerPatients": 11000, "origins": {"O10": 1}}]},
    {"id": "epidemic", "name": "Regional epidemic", "camera": "reg", "commercialMult": 0.581, "commercialRevMult": 0.78,
     "occIcu": 0.88, "kappaMult": 0.6,
     "note": "A hypothetical epidemic wave across neighbouring countries. Türkiye is affected too, cross-border ICU transfer stays rare, and paying patient demand falls as in 2020.",
     "events": [{"type": "epidemic", "critical": 60000, "duration": 150, "start": 0, "dialysisPatients": 12000, "origins": {"O02": 0.35, "O03": 0.4, "O01": 0.1, "O06": 0.05, "O04": 0.05, "O05": 0.05}}]},
    {"id": "marmara", "name": "Marmara earthquake", "camera": "tr",
     "note": "A hypothetical stress test: an earthquake damages hospitals around İstanbul while a foreign conflict is under way. Domestic casualties come first.",
     "commercialMult": 0.75,
     "events": [{"type": "disaster", "injured": QUAKE_INJURED, "start": 0, "origins": {"TUR": 1}, "damage": MARMARA_DAMAGE},
                {"type": "conflict", "injuredPerDay": CONFLICT_PER_DAY, "duration": 365, "start": 0, "dialysisPatients": 1100, "cancerPatients": 11000, "origins": {"O01": 1}}]},
    {"id": "world", "name": "Distant crises", "camera": "world", "commercialMult": 0.98,
     "note": "Hypothetical concurrent crises beyond the neighbourhood, reachable only by air.",
     "events": [{"type": "disaster", "injured": QUAKE_INJURED, "start": 0, "origins": {"O17": 0.5, "O18": 0.5}},
                {"type": "conflict", "injuredPerDay": CONFLICT_PER_DAY, "duration": 365, "start": 0, "dialysisPatients": 1100, "cancerPatients": 11000, "origins": {"O14": 0.6, "O15": 0.2, "O16": 0.2}}]},
]

LEVERS = [
    {"group": "Capacity", "items": [
        {"key": "rho", "label": "Paying patient capacity released", "min": 0, "max": 1, "step": 0.05, "pct": True},
        {"key": "kappa", "label": "Idle authorised beds activated", "min": 0, "max": 1, "step": 0.05, "pct": True},
        {"key": "stepThermal", "label": "Thermal beds used for step-down care", "min": 0, "max": 0.4, "step": 0.01, "pct": True},
        {"key": "stepHotel", "label": "Hotel beds used for step-down care", "min": 0, "max": 0.05, "step": 0.001, "pct": True, "dp": 1},
        {"key": "ptMobil", "label": "Rehabilitation staff mobilised", "min": 0, "max": 0.3, "step": 0.01, "pct": True},
    ]},
    {"group": "Getting patients here", "items": [
        {"key": "accessRate", "label": "Referrals cleared to travel per day", "min": 0.005, "max": 0.5, "step": 0.005, "pct": True, "dp": 1},
        {"key": "fastTrack", "label": "Fast-track designation multiplier", "min": 1, "max": 4, "step": 0.25, "dp": 2, "hint": "Article 2 of the 2025 regulation lets a presidential decision designate countries in war or disaster."},
        {"key": "airSlots", "label": "Air medical seats per day", "min": 0, "max": 300, "step": 5},
        {"key": "landSlotsPerGate", "label": "Ambulance seats per border gate per day", "min": 0, "max": 150, "step": 5},
        {"key": "coordCases", "label": "New cases coordinators can take per day", "min": 20, "max": 1000, "step": 20},
        {"key": "eta", "label": "National matching of patients to beds", "min": 0, "max": 1, "step": 0.05, "pct": True, "hint": "At 0%, only provinces already known for health tourism are visible to dispatchers."},
    ]},
    {"group": "Crisis and money", "items": [
        {"key": "severityMult", "label": "Crisis severity", "min": 0.3, "max": 2.5, "step": 0.1, "dp": 1},
        {"key": "funding", "label": "Costs covered by external payers", "min": 0, "max": 1, "step": 0.05, "pct": True},
        {"key": "startDoy", "label": "Start day of the year", "min": 0, "max": 364, "step": 5},
    ]},
]

SWEEPS = [
    {"key": "rho", "min": 0, "max": 1}, {"key": "kappa", "min": 0, "max": 1}, {"key": "accessRate", "min": 0.005, "max": 0.5},
    {"key": "airSlots", "min": 0, "max": 300}, {"key": "ptMobil", "min": 0, "max": 0.3}, {"key": "eta", "min": 0, "max": 1},
    {"key": "stepThermal", "min": 0, "max": 0.4}, {"key": "fastTrack", "min": 1, "max": 4},
]


def authorised(provs):
    """Which provinces hold an authorised hospital, and how many.

    Regional totals and the number of provinces with at least one authorised hospital come from Yorulmaz and Aksoy (2024).
    Provinces named in a published source come first in each region. The remaining places go to the provinces with the most specialists.
    """
    spec = os.path.join(RAW, "specialised")
    named, hosp, basis = {}, {}, {}
    with open(os.path.join(spec, "authorised_by_province.csv"), encoding="utf-8") as f:
        for r in csv.DictReader(f):
            n = NAME_FIX.get(r["province_tr"], r["province_tr"])
            named[n] = int(re.search(r"K4=(\d+)", r["note"]).group(1))
            basis[n] = r["source_id"]
    with open(os.path.join(spec, "authorised_named_extra.csv"), encoding="utf-8") as f:
        for r in csv.DictReader(f):
            n = NAME_FIX.get(r["province_tr"], r["province_tr"])
            if r["facilities"] and n not in named:
                named[n] = int(r["facilities"])
                basis[n] = r["source_id"]
            if r["hospitals"]:
                hosp[n] = float(r["hospitals"])
    with open(os.path.join(spec, "authorised_hospitals_by_region.csv"), encoding="utf-8") as f:
        regions = {r["region"]: r for r in csv.DictReader(f)}
    out = {}
    for region, row in regions.items():
        pool = [p for p in provs if p["region"] == region]
        quota, total = int(row["provinces_with_at_least_one"]), float(row["authorised_hospitals"])
        listed = sorted([p for p in pool if p["name"] in named], key=lambda p: -named[p["name"]])
        others = sorted([p for p in pool if p["name"] not in named], key=lambda p: -p["specialists"])
        chosen = (listed + others)[:quota]
        fixed = {p["name"]: hosp[p["name"]] for p in chosen if p["name"] in hosp}
        free = [p for p in chosen if p["name"] not in fixed]
        count = dict(fixed)
        left = total - sum(fixed.values())
        # Shared by the geometric mean of the hospitals in the province and all its authorised facilities, capped at the hospitals there.
        while free:
            w = {p["name"]: math.sqrt(p["hospitals"] * max(1, named.get(p["name"], 1))) for p in free}
            scale = left / sum(w.values())
            over = [p for p in free if w[p["name"]] * scale > p["hospitals"]]
            if not over:
                count.update({p["name"]: w[p["name"]] * scale for p in free})
                break
            for p in over:
                count[p["name"]] = p["hospitals"]
                left -= p["hospitals"]
                free.remove(p)
        for p in pool:
            n = p["name"]
            inside = n in count
            out[n] = {"unit": 1 if inside else 0, "unitBasis": ("named" if n in named else "inferred") if inside else "none",
                      "unitSource": basis.get(n, ""), "authFacilities": named.get(n, 0) if inside else 0, "authHosp": round(count.get(n, 0.0), 2),
                      "certShare": round(min(1.0, count.get(n, 0.0) / p["hospitals"]), 4) if inside and p["hospitals"] else 0.0}
    return out


def main():
    beds = read("A1_beds_icu_by_province_2024.csv")
    occ = read("A1_hospital_services_occupancy_by_province_2024.csv")
    staff = read("A4_health_workforce_by_province_2024.csv")
    hotel = read("A7_accommodation_licensed_by_province_2026_08.csv")
    with open(os.path.join(ROOT, "data", "map.json"), encoding="utf-8") as f:
        geo = json.load(f)

    # International airports: at least 5,000 international passengers in January to May 2026.
    intl = {}
    with open(os.path.join(RAW, "A8_airports_passengers_2026_jan_may.csv"), encoding="utf-8") as f:
        for r in csv.DictReader(f):
            prov = NAME_FIX.get(r["province_tr"], r["province_tr"]) or AIRPORT_PROV.get(r["airport_as_printed"], "")
            pax = num(r["international_passengers"])
            if prov and pax >= 5000:
                intl[prov] = intl.get(prov, 0) + pax
    intl["Mersin"] = intl.get("Adana", 0)  # Çukurova Airport serves Adana and Mersin and sits in Mersin.

    provs = []
    for g in geo["provinces"]:
        n = g["name"]
        b, o, s, h = beds[n], occ[n], staff[n], hotel[n]
        pop = num(b["family_medicine_units"]) * num(b["population_per_family_medicine_unit"])
        provs.append({
            "id": g["id"], "name": n, "region": g["region"], "nuts1": PROV_NUTS[n], "lat": g["lat"], "lon": g["lon"], "x": g["x"], "y": g["y"],
            "pop": pop, "hospitals": num(b["hospitals"]), "beds": num(b["beds_total"]), "qualifiedBeds": num(b["qualified_beds"]),
            "icuBeds": num(b["icu_beds"]), "occAll": num(o["bed_occupancy_rate_pct"]) / 100, "specialists": num(s["specialist_physicians"]),
            "nurses": num(s["nurses"]), "physicians": num(s["physicians_total"]), "hotelBeds": num(h["beds_isletme_belgeli"]),
            "thermalBeds": THERMAL.get(n, 0), "airportIntl": n in intl, "intlPax": intl.get(n, 0),
        })

    # Receiving provinces: those with at least one authorised hospital.
    auth = authorised(provs)
    for p in provs:
        p.update(auth[p["name"]])
    anchors = {"İstanbul": 0.60, "Antalya": 0.12, "İzmir": 0.03}
    remain = 1 - sum(anchors.values())
    rest_sum = sum(max(1, p["authFacilities"]) for p in provs if p["unit"] and p["name"] not in anchors)
    A_NAT = PARAMS["authBedsNational"]["base"]
    private_ratio = 48.9 / 59.8  # Private to all-sector occupancy, Yearbook 2024, Table 8.25.
    adult_share = 32760 / 49010  # Adult share of ICU beds, Yearbook 2024, Table 7.3.
    auth_icu_share = PARAMS["authIcuShare"]["base"]
    ftr_total = 2597  # Physical medicine and rehabilitation hospital beds, Yearbook 2024, Table 7.1.
    spec_all = sum(p["specialists"] for p in provs)
    bed_w = sum(p["certShare"] * p["beds"] for p in provs)
    icu_w = sum(p["certShare"] * p["icuBeds"] for p in provs)
    icu_total = sum(p["icuBeds"] for p in provs) * adult_share * auth_icu_share
    for p in provs:
        n = p["name"]
        p["htShare"] = 0.0 if not p["unit"] else anchors[n] if n in anchors else remain * max(1, p["authFacilities"]) / rest_sum
        p["authBeds"] = A_NAT * p["certShare"] * p["beds"] / bed_w
        p["occAuth"] = p["occAll"] * private_ratio
        p["authIcu"] = icu_total * p["certShare"] * p["icuBeds"] / icu_w
        p["ftrBeds"] = ftr_total * p["specialists"] / spec_all
        p["dialSlots"] = DIAL_PM[p["nuts1"]] * p["pop"] / 1e6 * PARAMS["patientsPerDevice"]["base"]
        p["oncSlots"] = PARAMS["oncPatientsNational"]["base"] * p["specialists"] / spec_all
        ht_inp = N_HT * p["htShare"] * PARAMS["htInpatientShare"]["base"] * PARAMS["htLosDays"]["base"] / 365
        p["commInpBeds"] = ht_inp
        p["commIcu"] = ht_inp * PARAMS["htIcuShare"]["base"]
    scales = {"authBedsPerCertBed": A_NAT / bed_w, "authIcuPerCertBed": icu_total / icu_w}

    origins = []
    for oid, name, lat, lon, access in ORIGINS:
        origins.append({"id": oid, "name": name, "lat": lat, "lon": lon, "access": access, "landGates": GATES.get(oid, [])})

    # Project origin points with the same plane as the map for the interface.
    r = math.pi / 180
    def project(lat, lon):
        lat0, lon0 = 39 * r, 35 * r
        phi, lam = lat * r, lon * r
        c = math.acos(max(-1, min(1, math.sin(lat0) * math.sin(phi) + math.cos(lat0) * math.cos(phi) * math.cos(lam - lon0))))
        k = c / math.sin(c) if c > 1e-9 else 1
        x = k * math.cos(phi) * math.sin(lam - lon0)
        y = k * (math.cos(lat0) * math.sin(phi) - math.sin(lat0) * math.cos(phi) * math.cos(lam - lon0))
        return [round(6371 * x), round(-6371 * y)]
    for o in origins:
        o["xy"] = project(o["lat"], o["lon"])

    params = {k: {x: v[x] for x in v if x not in ("internal",)} for k, v in PARAMS.items()}
    model = {"provinces": provs, "origins": origins, "params": params, "scenarios": SCENARIOS, "sweeps": SWEEPS, "scales": scales}
    os.makedirs(os.path.join(ROOT, "data"), exist_ok=True)
    with open(os.path.join(ROOT, "data", "model.json"), "w", encoding="utf-8") as f:
        json.dump(model, f, ensure_ascii=False)
    with open(os.path.join(ROOT, "data", "marmara.json"), "w", encoding="utf-8") as f:
        json.dump(MARMARA_DAMAGE, f)
    with open(os.path.join(ROOT, "data", "levers.json"), "w", encoding="utf-8") as f:
        json.dump(LEVERS, f, ensure_ascii=False)
    keys = ["id", "name", "region", "nuts1", "pop", "unit", "unitBasis", "authFacilities", "authHosp", "certShare", "hospitals", "beds", "qualifiedBeds", "icuBeds", "occAll", "occAuth", "specialists", "nurses", "physicians",
            "hotelBeds", "thermalBeds", "airportIntl", "intlPax", "htShare", "authBeds", "authIcu", "ftrBeds", "dialSlots", "oncSlots", "commInpBeds", "commIcu"]
    with open(os.path.join(ROOT, "data", "provinces.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(keys)
        for p in provs:
            w.writerow([round(p[k], 4) if isinstance(p[k], float) else p[k] for k in keys])
    print("provinces", len(provs), "beds", int(sum(p["beds"] for p in provs)), "auth", int(sum(p["authBeds"] for p in provs)),
          "icu", int(sum(p["icuBeds"] for p in provs)), "ht share", round(sum(p["htShare"] for p in provs), 3),
          "comm beds", round(sum(p["commInpBeds"] for p in provs)), "dial slots", round(sum(p["dialSlots"] for p in provs)), "airports", len(intl))
    print("top ht", [(p["name"], round(p["htShare"], 3)) for p in sorted(provs, key=lambda p: -p["htShare"])[:8]])
    print("receiving provinces", sum(p["unit"] for p in provs), "named", sum(p["unitBasis"] == "named" for p in provs), "inferred", sum(p["unitBasis"] == "inferred" for p in provs))


if __name__ == "__main__":
    main()
