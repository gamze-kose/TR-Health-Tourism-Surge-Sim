#!/usr/bin/env python3
"""Builds data/countries.json: the countries that can be chosen, described by one common set of parameters."""
import csv
import json
import math
import os
import statistics as st

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "data", "raw", "countries")

# Not offered as crisis countries, so that no scenario can repeat a recent war, and Türkiye, which is the destination.
NOT_OFFERED = {"PSE", "ISR", "SYR", "UKR", "RUS", "TUR"}
MIN_POPULATION = 100000
# Road border gates with Türkiye, as plate codes of the province on the Turkish side.
GATES = {"IRQ": [73], "IRN": [4, 65, 30], "GEO": [8, 75], "BGR": [22, 39], "GRC": [22], "AZE": [76]}


TR_NAME = {"WSM": "Samoa"}
UP = {"ç": "Ç", "ş": "Ş", "ü": "Ü", "ö": "Ö", "ğ": "Ğ", "i": "İ", "ı": "I"}


def capital_tr(s):
    return UP.get(s[0], s[0].upper()) + s[1:]


def rows(name):
    with open(os.path.join(RAW, name), encoding="utf-8") as f:
        return list(csv.DictReader(f))


def num(x):
    x = (x or "").strip()
    return float(x) if x else None


def project(lat, lon):
    r = math.pi / 180
    lat0, lon0 = 39 * r, 35 * r
    phi, lam = lat * r, lon * r
    c = math.acos(max(-1, min(1, math.sin(lat0) * math.sin(phi) + math.cos(lat0) * math.cos(phi) * math.cos(lam - lon0))))
    k = c / math.sin(c) if c > 1e-9 else 1
    x = k * math.cos(phi) * math.sin(lam - lon0)
    y = k * (math.cos(lat0) * math.sin(phi) - math.sin(lat0) * math.cos(phi) * math.cos(lam - lon0))
    return [round(6371 * x), round(-6371 * y)]


def main():
    ind = {r["iso_code"].replace("OWID_KOS", "UNK"): r for r in rows("country_indicators.csv")}
    out = []
    for g in rows("country_geography.csv"):
        k = g["cca3"]
        if k in NOT_OFFERED or k not in ind or not (g["independent"] == "1" or k == "UNK"):
            continue
        r = ind[k]
        pop = num(r["population"])
        if not pop or pop < MIN_POPULATION or not g["lat"]:
            continue
        out.append({"id": k, "num": g["ccn3"], "name": g["name_en"], "tr": TR_NAME.get(k) or capital_tr(g["name_tr"] or g["name_en"]), "lat": float(g["lat"]), "lon": float(g["lon"]), "sub": g["subregion"], "pop": pop,
                    "beds": num(r["hospital_beds_per_thousand"]), "hdi": num(r["human_development_index"]), "age65": num(r["aged_65_older"]),
                    "diabetes": num(r["diabetes_prevalence"]), "gdp": num(r["gdp_per_capita"])})
    def by_sub(key, c):
        v = [x[key] for x in out if x["sub"] == c["sub"] and x[key] is not None]
        return st.median(v) if v else st.median([x[key] for x in out if x[key] is not None])
    for c in out:
        c["est"] = []
        for key in ("hdi", "age65", "diabetes", "gdp"):
            if c[key] is None:
                c[key] = by_sub(key, c)
                c["est"].append(key)
    pairs = [(c["hdi"], math.log(c["beds"])) for c in out if c["beds"]]
    mx, my = st.mean(p[0] for p in pairs), st.mean(p[1] for p in pairs)
    b = sum((x - mx) * (y - my) for x, y in pairs) / sum((x - mx) ** 2 for x, _ in pairs)
    a = my - b * mx
    for c in out:
        if c["beds"] is None:
            c["beds"] = round(math.exp(a + b * c["hdi"]), 2)
            c["est"].append("beds")
    for c in out:
        c["xy"] = project(c["lat"], c["lon"])
        c["access"] = 1
        c["landGates"] = GATES.get(c["id"], [])
        del c["sub"]
    out.sort(key=lambda c: c["name"])
    with open(os.path.join(ROOT, "data", "countries.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False)
    print("countries", len(out), "beds fitted", sum("beds" in c["est"] for c in out), "fit a b", round(a, 3), round(b, 3))
    print([c["tr"] for c in out][:40])


if __name__ == "__main__":
    main()
