#!/usr/bin/env python3
"""Global sensitivity analysis (Sobol indices) of the model outputs."""
import json
import os
import subprocess
import sys

import numpy as np
from SALib.analyze import sobol as sobol_analyze
from SALib.sample import sobol as sobol_sample

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
N = int(sys.argv[1]) if len(sys.argv) > 1 else 256
NAMES = ["kappa", "rho", "capTrauma", "theta", "convRehab", "kappaRehab", "dialIdle", "oncIdle", "stepThermal", "stepHotel", "rampDays",
         "ptMobil", "eta", "accessRate", "landSlotsPerGate", "airSlots", "coordCases", "severityMult", "exportConflict", "exportDisaster",
         "chronicLoss", "cfRehab", "losRehab", "losOnco", "losTrauma", "traumaToRehab"]
SCN = ["conflict", "quake", "restricted"]
model = json.load(open(os.path.join(ROOT, "data", "model.json"), encoding="utf-8"))
bounds = []
for n in NAMES:
    q = model["params"][n]
    bounds.append([q["low"], q["high"], (q["base"] - q["low"]) / (q["high"] - q["low"])])
problem = {"num_vars": len(NAMES), "names": NAMES, "bounds": bounds, "dists": ["triang"] * len(NAMES)}
X = sobol_sample.sample(problem, N, calc_second_order=False, seed=20261113)
os.makedirs(os.path.join(ROOT, "results"), exist_ok=True)
sf = os.path.join(ROOT, "results", "sobol_samples.json")
of = os.path.join(ROOT, "results", "sobol_outputs.json")
json.dump({"names": NAMES, "X": X.tolist(), "scenarios": SCN}, open(sf, "w"))
subprocess.run(["node", os.path.join(ROOT, "analysis", "sobol_eval.js"), os.path.join(ROOT, "data", "model.json"), sf, of], check=True)
Y = json.load(open(of))
out = {"N": N, "names": NAMES, "scenarios": {}}
for s in SCN:
    out["scenarios"][s] = {}
    for metric in ["admitted", "coverage", "wait", "net", "lost"]:
        Si = sobol_analyze.analyze(problem, np.array(Y[s][metric]), calc_second_order=False, seed=1)
        out["scenarios"][s][metric] = {"S1": [round(float(x), 4) for x in Si["S1"]], "ST": [round(float(x), 4) for x in Si["ST"]], "ST_conf": [round(float(x), 4) for x in Si["ST_conf"]]}
json.dump(out, open(os.path.join(ROOT, "results", "sobol.json"), "w"))
os.remove(sf)
os.remove(of)
print("done")
