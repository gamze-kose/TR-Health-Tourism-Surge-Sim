#!/usr/bin/env python3
"""Writes the headline tables reported in the abstract and the repository."""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R = json.load(open(os.path.join(ROOT, "results", "results.json"), encoding="utf-8"))
SOB = os.path.join(ROOT, "results", "sobol.json")
L = ["ICU", "TRAUMA", "DIAL", "ONCO", "REHAB", "STEP"]


def iv(q, f="{:,.0f}"):
    return f"{f.format(q['p50'])} ({f.format(q['p5'])} to {f.format(q['p95'])})"


out = ["# Headline results", "", f"Monte Carlo runs per scenario: {R['runs']}. Median with 5th and 95th percentiles.", ""]
out += ["| Scenario | Referred | Admitted | Share admitted | Mean wait, days | Lost while waiting | Provinces over 85% |", "|---|---|---|---|---|---|---|"]
for k, v in R["scenarios"].items():
    m = v["monteCarlo"]
    out.append(f"| {v['name']} | {iv(m['arrivalsForeign'])} | {iv(m['admittedForeign'])} | {iv(m['coverage'], '{:.2f}')} | {iv(m['meanWaitDays'], '{:.0f}')} | {iv(m['lost'])} | {iv(m['provincesOverSafe'], '{:.0f}')} |")
out += ["", "## Extra admissions if one limit is removed (reference parameters)", "", "| Scenario | Access | Transport | Coordination | Capacity | Rehabilitation staff |", "|---|---|---|---|---|---|"]
for k, v in R["scenarios"].items():
    r = v["relax"]
    out.append(f"| {v['name']} | " + " | ".join(f"{r[x]['gain']:,.0f}" for x in ["access", "transport", "coord", "capacity", "staff"]) + " |")
out += ["", "## Reference run by service line", "", "| Scenario | " + " | ".join(f"{x} referred/served/peak/capacity" for x in L) + " |", "|---|" + "---|" * len(L)]
for k, v in R["scenarios"].items():
    d = v["deterministic"]
    out.append(f"| {v['name']} | " + " | ".join(f"{d['arrLine'][i]:,.0f}/{d['servedLine'][i]:,.0f}/{d['peakLine'][i]:,.0f}/{d['capEnd'][i]:,.0f}" for i in range(6)) + " |")
out += ["", "## Money, reference run, USD million", "", "| Scenario | Care | Transfer | Paying revenue displaced | Crisis revenue loss | Cost per admitted patient, USD |", "|---|---|---|---|---|---|"]
for k, v in R["scenarios"].items():
    d = v["deterministic"]
    out.append(f"| {v['name']} | {d['costUsd']/1e6:,.1f} | {d['transportCost']/1e6:,.1f} | {d['revLost']/1e6:,.1f} | {v['monteCarlo']['revCrisis']['p50']/1e6:,.0f} | {(d['costUsd']+d['transportCost'])/max(1,d['admittedForeign']):,.0f} |")
out += ["", "## Policy packages (median share admitted, 5th to 95th percentile)", "", "| Scenario | Ad hoc | Reference | Coordinated |", "|---|---|---|---|"]
for k, v in R["packages"].items():
    out.append(f"| {R['scenarios'][k]['name']} | " + " | ".join(iv(v[p]["monteCarlo"]["coverage"], "{:.2f}") for p in ["adhoc", "reference", "coordinated"]) + " |")
out += ["", "## Saturation with access and transport opened (share of line capacity at peak)", ""]
for k, rows in R["saturation"].items():
    out += [f"### {R['scenarios'][k]['name']}", "", "| Severity | Referred | Share admitted | " + " | ".join(L) + " | Provinces over 85% |", "|---|---|---|" + "---|" * 6 + "---|"]
    for r in rows:
        out.append(f"| {r['severity']} | {r['referrals']:,.0f} | {r['coverage']:.2f} | " + " | ".join(f"{u:.2f}" for u in r["util"]) + f" | {r['provincesOverSafe']} |")
    out.append("")
out += ["## Greedy hub selection", ""]
for k, h in R["hubs"].items():
    out.append(f"**{R['scenarios'][k]['name']}** (all provinces admit {h['full']:,.0f}): " + ", ".join(f"{c['province']} {c['admitted']:,.0f}" for c in h["chosen"][:10]))
out += ["", "## Top provinces and regions, reference run", ""]
for k, v in R["scenarios"].items():
    out.append(f"**{v['name']}**: " + ", ".join(f"{p['name']} {p['served']:,.0f}" for p in v["topProvinces"][:8]) + ". Regions: " + ", ".join(f"{a} {b['served']:,.0f}" for a, b in sorted(v["byRegion"].items(), key=lambda x: -x[1]["served"])))
if os.path.exists(SOB):
    S = json.load(open(SOB))
    out += ["", f"## Sobol total-order indices, N = {S['N']}", ""]
    for s, m in S["scenarios"].items():
        for metric in ["coverage", "admitted", "lost"]:
            pairs = sorted(zip(S["names"], m[metric]["ST"], m[metric]["S1"]), key=lambda x: -x[1])[:6]
            out.append(f"**{s}, {metric}**: " + ", ".join(f"{a} ST {b:.2f} (S1 {c:.2f})" for a, b, c in pairs))
open(os.path.join(ROOT, "results", "summary.md"), "w", encoding="utf-8").write("\n".join(out))
print("\n".join(out))
