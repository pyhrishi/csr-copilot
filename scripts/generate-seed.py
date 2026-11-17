#!/usr/bin/env python3
"""Generate the synthetic seed data for the CSR Copilot prototype.

Everything here is FICTIONAL: the study, drug, sponsor, patients and results.
Percentages are always computed from counts so the data is internally consistent.
Run: python3 scripts/generate-seed.py   (writes data/seed/*.json)
"""
import json, os
from decimal import Decimal, ROUND_HALF_UP

OUT = os.path.join(os.path.dirname(__file__), "..", "data", "seed")
os.makedirs(OUT, exist_ok=True)

def pct(n, d):
    return float(Decimal(n * 100 / d).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))

ARMS = {"velo": {"label": "Velorantib 20 mg", "randomized": 300, "safety": 298},
        "pbo": {"label": "Placebo", "randomized": 300, "safety": 299}}

study = {
    "_synthetic": "FICTIONAL DATA for a product prototype. Not a real study, drug, sponsor or patient.",
    "id": "CRD-301",
    "shortName": "CARDIA-3",
    "title": "A Phase III, randomized, double-blind, placebo-controlled study of velorantib in adults with chronic heart failure with reduced ejection fraction",
    "sponsor": "Meridian Biopharma (fictional design partner)",
    "phase": "III",
    "indication": "Chronic heart failure with reduced ejection fraction (HFrEF)",
    "design": "Randomized 1:1, double-blind, placebo-controlled, 52-week treatment period",
    "arms": [{"id": k, "label": v["label"], "randomized": v["randomized"], "safetyN": v["safety"]} for k, v in ARMS.items()],
    "populations": {"randomized": "All randomized patients (N=600)", "safety": "All patients who received at least one dose (N=597)"},
    "milestones": {"lastPatientLastVisit": "2026-09-18", "databaseLock": "2026-10-30", "toplineResults": "2026-11-27", "csrTargetFinal": "2027-01-22"},
    "template": "Meridian CSR template v3.2 (ICH E3)",
    "therapeuticAreaPack": "Cardiovascular v1",
    "status": "Post-lock: CSR in authoring",
}

def np(arm, n, denom_key="safety"):
    d = ARMS[arm][denom_key]
    return {"n": n, "N": d, "pct": pct(n, d)}

tlfs, facts = [], []

def add_tlf(tid, title, population, rows, columns=("velo", "pbo"), denom="safety", version=1, footnotes=None):
    t = {"id": tid, "title": title, "population": population, "version": version,
         "columns": [ARMS[c]["label"] + f" (N={ARMS[c][denom]})" for c in columns], "rows": []}
    for r_i, (key, label, vals) in enumerate(rows):
        row = {"key": key, "label": label, "cells": []}
        for c_i, c in enumerate(columns):
            v = vals[c]
            fid = f"{tid}.{key}.{c}"
            if isinstance(v, int):
                val = np(c, v, denom)
                display = f"{val['n']} ({val['pct']:.1f}%)"
                kind = "n_pct"
            else:
                val = v
                display = v["display"]
                kind = v.get("kind", "stat")
            row["cells"].append({"factId": fid, "display": display})
            facts.append({"id": fid, "tlf": tid, "tlfVersion": version, "row": key, "rowLabel": label,
                          "column": c, "columnLabel": ARMS[c]["label"], "population": population,
                          "kind": kind, "value": val, "display": display, "cell": {"row": r_i, "col": c_i}})
        t["rows"].append(row)
    if footnotes:
        t["footnotes"] = footnotes
    tlfs.append(t)

# 14.1.1 Disposition (randomized population for randomized; safety counts as integers vs randomized denominators)
add_tlf("14.1.1", "Patient disposition", "Randomized", [
    ("randomized", "Randomized", {"velo": 300, "pbo": 300}),
    ("treated", "Received study drug", {"velo": 298, "pbo": 299}),
    ("completed", "Completed treatment period", {"velo": 271, "pbo": 266}),
    ("discontinued", "Discontinued treatment", {"velo": 27, "pbo": 33}),
    ("disc_ae", "  Adverse event", {"velo": 9, "pbo": 11}),
    ("disc_withdrawal", "  Withdrawal by patient", {"velo": 10, "pbo": 12}),
    ("disc_ltfu", "  Lost to follow-up", {"velo": 4, "pbo": 5}),
    ("disc_death", "  Death", {"velo": 1, "pbo": 1}),
    ("disc_other", "  Other", {"velo": 3, "pbo": 4}),
], denom="randomized")

# 14.1.2 Demographics (safety)
add_tlf("14.1.2", "Demographics and baseline characteristics", "Safety", [
    ("age_mean", "Age (years), mean (SD)", {"velo": {"display": "66.4 (9.8)", "mean": 66.4, "sd": 9.8, "kind": "mean_sd"}, "pbo": {"display": "65.9 (10.2)", "mean": 65.9, "sd": 10.2, "kind": "mean_sd"}}),
    ("male", "Male, n (%)", {"velo": 212, "pbo": 209}),
    ("lvef_mean", "LVEF (%), mean (SD)", {"velo": {"display": "29.8 (6.1)", "mean": 29.8, "sd": 6.1, "kind": "mean_sd"}, "pbo": {"display": "30.1 (5.9)", "mean": 30.1, "sd": 5.9, "kind": "mean_sd"}}),
    ("nyha_iii", "NYHA class III, n (%)", {"velo": 101, "pbo": 98}),
])

# 14.3.1.1 Overview of adverse events (safety)
add_tlf("14.3.1.1", "Overview of treatment-emergent adverse events", "Safety", [
    ("any_teae", "Any TEAE", {"velo": 201, "pbo": 188}),
    ("related_teae", "Any drug-related TEAE", {"velo": 64, "pbo": 41}),
    ("sae", "Any serious TEAE", {"velo": 7, "pbo": 5}),
    ("disc_teae", "TEAE leading to discontinuation", {"velo": 9, "pbo": 11}),
    ("death", "TEAE leading to death", {"velo": 1, "pbo": 1}),
])

# 14.3.1.2 Common TEAEs (>=5% in either arm) by preferred term (safety)
add_tlf("14.3.1.2", "TEAEs reported in at least 5% of patients in either group, by preferred term", "Safety", [
    ("hypotension", "Hypotension", {"velo": 27, "pbo": 14}),
    ("dizziness", "Dizziness", {"velo": 22, "pbo": 15}),
    ("hyperkalaemia", "Hyperkalaemia", {"velo": 19, "pbo": 9}),
    ("fatigue", "Fatigue", {"velo": 17, "pbo": 18}),
    ("nasopharyngitis", "Nasopharyngitis", {"velo": 16, "pbo": 17}),
], footnotes=["Patients are counted once per preferred term. MedDRA version 27.1 (fictional dataset)."])

# 14.2.1 Primary efficacy (randomized) - Release 2 content, shown locked in the prototype
add_tlf("14.2.1", "Primary endpoint: time to first heart failure hospitalization or cardiovascular death", "Randomized", [
    ("events", "Patients with an event, n (%)", {"velo": 58, "pbo": 79}),
    ("hr", "Hazard ratio (95% CI)", {"velo": {"display": "0.71 (0.51 to 0.99)", "hr": 0.71, "lcl": 0.51, "ucl": 0.99, "kind": "hr_ci"}, "pbo": {"display": "Reference", "kind": "ref"}}),
    ("p", "p-value (stratified log-rank)", {"velo": {"display": "0.043", "p": 0.043, "alpha": 0.05, "kind": "p_value"}, "pbo": {"display": "—", "kind": "ref"}}),
], denom="randomized", footnotes=["Release 2 content: locked in Release 1 of the prototype."])

# Version 2 of 14.3.1.2 after a data correction (for the TLF change-impact demo, journey J6)
tlfs_v2_facts_before = len(facts)
add_tlf("14.3.1.2", "TEAEs reported in at least 5% of patients in either group, by preferred term", "Safety", [
    ("hypotension", "Hypotension", {"velo": 27, "pbo": 14}),
    ("dizziness", "Dizziness", {"velo": 23, "pbo": 15}),
    ("hyperkalaemia", "Hyperkalaemia", {"velo": 19, "pbo": 9}),
    ("fatigue", "Fatigue", {"velo": 17, "pbo": 18}),
    ("nasopharyngitis", "Nasopharyngitis", {"velo": 16, "pbo": 17}),
], version=2, footnotes=["v2: one dizziness event re-coded after a data query (fictional)."])
v2_tlf = tlfs.pop()
v2_facts = facts[tlfs_v2_facts_before:]
del facts[tlfs_v2_facts_before:]

# Patients with serious TEAEs: 7 velorantib + 5 placebo = 12, matching 14.3.1.1 "sae" row
patients = [
    {"id": "CRD301-1042", "arm": "velo", "age": 71, "sex": "M", "site": "Site 104", "event": "Hypotension", "seriousness": "Hospitalization", "onsetDay": 18, "resolvedDay": 22, "outcome": "Recovered", "related": "Related", "action": "Dose interrupted", "severity": "Severe",
     "timeline": [[1, "First dose of study drug"], [18, "Dizziness and systolic BP 82 mmHg at home; admitted to hospital"], [19, "Study drug interrupted; IV fluids given"], [22, "BP stable; discharged"], [29, "Study drug restarted at same dose without recurrence"]]},
    {"id": "CRD301-1107", "arm": "velo", "age": 68, "sex": "F", "site": "Site 110", "event": "Hyperkalaemia", "seriousness": "Hospitalization", "onsetDay": 63, "resolvedDay": 67, "outcome": "Recovered", "related": "Related", "action": "Drug withdrawn", "severity": "Severe",
     "timeline": [[1, "First dose of study drug"], [63, "Serum potassium 6.4 mmol/L at scheduled visit; admitted"], [63, "Study drug permanently discontinued"], [67, "Potassium 4.9 mmol/L; discharged"]]},
    {"id": "CRD301-1213", "arm": "velo", "age": 59, "sex": "M", "site": "Site 121", "event": "Pneumonia", "seriousness": "Hospitalization", "onsetDay": 140, "resolvedDay": 151, "outcome": "Recovered", "related": "Not related", "action": "Dose not changed", "severity": "Moderate",
     "timeline": [[1, "First dose of study drug"], [140, "Fever and cough; community-acquired pneumonia diagnosed; admitted"], [151, "Antibiotics completed; discharged"]]},
    {"id": "CRD301-1288", "arm": "velo", "age": 74, "sex": "M", "site": "Site 128", "event": "Sudden cardiac death", "seriousness": "Death", "onsetDay": 211, "resolvedDay": None, "outcome": "Fatal", "related": "Not related", "action": "Not applicable", "severity": "Severe",
     "timeline": [[1, "First dose of study drug"], [204, "Routine visit; no new symptoms reported"], [211, "Found unresponsive at home; pronounced dead by emergency services"]]},
    {"id": "CRD301-1350", "arm": "velo", "age": 66, "sex": "F", "site": "Site 135", "event": "Syncope", "seriousness": "Hospitalization", "onsetDay": 97, "resolvedDay": 98, "outcome": "Recovered", "related": "Possibly related", "action": "Dose interrupted", "severity": "Moderate",
     "timeline": [[1, "First dose of study drug"], [97, "Brief loss of consciousness after standing; admitted for observation"], [98, "ECG and telemetry unremarkable; discharged"], [105, "Study drug restarted"]]},
    {"id": "CRD301-1402", "arm": "velo", "age": 62, "sex": "M", "site": "Site 140", "event": "Atrial fibrillation", "seriousness": "Hospitalization", "onsetDay": 176, "resolvedDay": None, "outcome": "Not recovered", "related": "Not related", "action": "Dose not changed", "severity": "Moderate", "dataIssue": "Resolution date missing in source data; query open",
     "timeline": [[1, "First dose of study drug"], [176, "Palpitations; new-onset atrial fibrillation; admitted and rate control started"], [179, "Discharged on anticoagulation"]]},
    {"id": "CRD301-1466", "arm": "velo", "age": 70, "sex": "F", "site": "Site 146", "event": "Acute kidney injury", "seriousness": "Hospitalization", "onsetDay": 82, "resolvedDay": 90, "outcome": "Recovered", "related": "Possibly related", "action": "Drug withdrawn", "severity": "Severe",
     "timeline": [[1, "First dose of study drug"], [82, "Creatinine rise to 2.4 mg/dL during intercurrent gastroenteritis; admitted"], [82, "Study drug permanently discontinued"], [90, "Creatinine 1.3 mg/dL; discharged"]]},
    {"id": "CRD301-2015", "arm": "pbo", "age": 69, "sex": "M", "site": "Site 201", "event": "Cardiac failure", "seriousness": "Death", "onsetDay": 144, "resolvedDay": None, "outcome": "Fatal", "related": "Not related", "action": "Not applicable", "severity": "Severe",
     "timeline": [[1, "First dose of study drug"], [131, "Worsening dyspnoea and oedema; admitted"], [144, "Died in hospital of progressive heart failure"]]},
    {"id": "CRD301-2077", "arm": "pbo", "age": 63, "sex": "F", "site": "Site 207", "event": "Cardiac failure", "seriousness": "Hospitalization", "onsetDay": 58, "resolvedDay": 66, "outcome": "Recovered", "related": "Not related", "action": "Dose not changed", "severity": "Severe",
     "timeline": [[1, "First dose of study drug"], [58, "Decompensated heart failure; admitted for IV diuretics"], [66, "Discharged"]]},
    {"id": "CRD301-2133", "arm": "pbo", "age": 72, "sex": "M", "site": "Site 213", "event": "Fall", "seriousness": "Hospitalization", "onsetDay": 120, "resolvedDay": 127, "outcome": "Recovered", "related": "Not related", "action": "Dose not changed", "severity": "Moderate",
     "timeline": [[1, "First dose of study drug"], [120, "Fall at home with wrist fracture; admitted for surgery"], [127, "Discharged"]]},
    {"id": "CRD301-2190", "arm": "pbo", "age": 57, "sex": "F", "site": "Site 219", "event": "Chest pain", "seriousness": "Hospitalization", "onsetDay": 33, "resolvedDay": 34, "outcome": "Recovered", "related": "Not related", "action": "Dose not changed", "severity": "Moderate", "dataIssue": "Onset date conflicts between AE page and hospitalization record",
     "timeline": [[1, "First dose of study drug"], [33, "Non-cardiac chest pain; admitted for observation; troponin negative"], [34, "Discharged"]]},
    {"id": "CRD301-2251", "arm": "pbo", "age": 65, "sex": "M", "site": "Site 225", "event": "Hypotension", "seriousness": "Hospitalization", "onsetDay": 45, "resolvedDay": 47, "outcome": "Recovered", "related": "Possibly related", "action": "Dose interrupted", "severity": "Moderate",
     "timeline": [[1, "First dose of study drug"], [45, "Light-headedness and BP 85/50 mmHg; admitted"], [47, "Discharged; study drug restarted day 50"]]},
]
for p in patients:
    p["armLabel"] = ARMS[p["arm"]]["label"]
    p["narrativeType"] = "Death" if p["seriousness"] == "Death" else "SAE"
    p["status"] = "exception" if p.get("dataIssue") else "ready"
assert sum(1 for p in patients if p["arm"] == "velo") == 7 and sum(1 for p in patients if p["arm"] == "pbo") == 5
assert sum(1 for p in patients if p["outcome"] == "Fatal" and p["arm"] == "velo") == 1
assert sum(1 for p in patients if p["outcome"] == "Fatal" and p["arm"] == "pbo") == 1

# Section templates: sentences with typed placeholders. {F:<factId>} = a TLF fact; {P:<field>} = a patient field.
# The language model (or the simulated generator) only ever produces text like this; code fills the numbers.
sections = [
    {"id": "10.1", "title": "Disposition of patients", "release": "R1", "autonomy": "L2", "tlfs": ["14.1.1"], "sentences": [
        {"id": "10.1-s1", "text": "Of the patients randomized, {F:14.1.1.randomized.velo|n} were assigned to velorantib and {F:14.1.1.randomized.pbo|n} to placebo.", "cites": ["14.1.1.randomized.velo", "14.1.1.randomized.pbo"]},
        {"id": "10.1-s2", "text": "The treatment period was completed by {F:14.1.1.completed.velo} patients in the velorantib group and {F:14.1.1.completed.pbo} patients in the placebo group.", "cites": ["14.1.1.completed.velo", "14.1.1.completed.pbo"]},
        {"id": "10.1-s3", "text": "The most common reason for discontinuation was withdrawal by the patient ({F:14.1.1.disc_withdrawal.velo} and {F:14.1.1.disc_withdrawal.pbo}, respectively), followed by adverse events ({F:14.1.1.disc_ae.velo} and {F:14.1.1.disc_ae.pbo}).", "cites": ["14.1.1.disc_withdrawal.velo", "14.1.1.disc_withdrawal.pbo", "14.1.1.disc_ae.velo", "14.1.1.disc_ae.pbo"]}]},
    {"id": "12.2", "title": "Adverse events", "release": "R1", "autonomy": "L2", "tlfs": ["14.3.1.1", "14.3.1.2"], "sentences": [
        {"id": "12.2-s1", "text": "Treatment-emergent adverse events (TEAEs) were reported for {F:14.3.1.1.any_teae.velo} patients in the velorantib group and {F:14.3.1.1.any_teae.pbo} patients in the placebo group.", "cites": ["14.3.1.1.any_teae.velo", "14.3.1.1.any_teae.pbo"]},
        {"id": "12.2-s2", "text": "TEAEs considered related to study drug by the investigator occurred in {F:14.3.1.1.related_teae.velo} and {F:14.3.1.1.related_teae.pbo} patients, respectively.", "cites": ["14.3.1.1.related_teae.velo", "14.3.1.1.related_teae.pbo"]},
        {"id": "12.2-s3", "text": "The most frequently reported TEAE was hypotension, which was significantly more common with velorantib ({F:14.3.1.2.hypotension.velo}) than with placebo ({F:14.3.1.2.hypotension.pbo}).", "cites": ["14.3.1.2.hypotension.velo", "14.3.1.2.hypotension.pbo"], "seededIssue": "STAT-001: 'significantly' used without a statistical test for this comparison"},
        {"id": "12.2-s4", "text": "Dizziness was reported in {F:14.3.1.2.dizziness.velo} and {F:14.3.1.2.dizziness.pbo} patients, and hyperkalaemia in {F:14.3.1.2.hyperkalaemia.velo} and {F:14.3.1.2.hyperkalaemia.pbo} patients, in the velorantib and placebo groups, respectively.", "cites": ["14.3.1.2.dizziness.velo", "14.3.1.2.dizziness.pbo", "14.3.1.2.hyperkalaemia.velo", "14.3.1.2.hyperkalaemia.pbo"]},
        {"id": "12.2-s5", "text": "TEAEs leading to discontinuation of study drug occurred in {F:14.3.1.1.disc_teae.velo} patients receiving velorantib and {F:14.3.1.1.disc_teae.pbo} patients receiving placebo.", "cites": ["14.3.1.1.disc_teae.velo", "14.3.1.1.disc_teae.pbo"]}]},
    {"id": "12.3", "title": "Deaths and other serious adverse events", "release": "R1", "autonomy": "L2", "tlfs": ["14.3.1.1"], "sentences": [
        {"id": "12.3-s1", "text": "Serious TEAEs were reported for {F:14.3.1.1.sae.velo} patients in the velorantib group and {F:14.3.1.1.sae.pbo} patients in the placebo group.", "cites": ["14.3.1.1.sae.velo", "14.3.1.1.sae.pbo"]},
        {"id": "12.3-s2", "text": "Deaths were reported for {F:14.3.1.1.death.velo} patients in the velorantib group and {F:14.3.1.1.death.pbo} patients in the placebo group; investigator causality for each death is given in the patient narratives (Section 14.3.3).", "cites": ["14.3.1.1.death.velo", "14.3.1.1.death.pbo"]},
        {"id": "12.3-s3", "text": "Narratives for all patients with serious TEAEs are provided in Section 14.3.3.", "cites": []}]},
    {"id": "11.4", "title": "Efficacy results", "release": "R2", "autonomy": "locked", "tlfs": ["14.2.1"], "sentences": []},
    {"id": "13", "title": "Discussion and overall conclusions", "release": "human", "autonomy": "L0", "tlfs": [], "sentences": []},
]

narrative_template = {
    "type": "SAE",
    "structure": ["identification", "event", "course", "action", "outcome", "causality"],
    "sentences": {
        "identification": "Patient {P:id}, a {P:age}-year-old {P:sexWord} randomized to {P:armLabel}, experienced a serious adverse event of {P:eventLower}.",
        "event": "The event began on Day {P:onsetDay} and met the seriousness criterion of {P:seriousnessLower}; its severity was {P:severityLower}.",
        "course": "{P:timelineSummary}",
        "action": "Action taken with study drug: {P:actionLower}.",
        "outcome": "The outcome was reported as {P:outcomeLower}{P:resolvedClause}.",
        "causality": "The investigator assessed the event as {P:relatedLower} to study drug."},
}

stat_rules = [
    {"id": "STAT-001", "severity": "critical", "pattern": "\\bsignificant(ly)?\\b", "requires": "a p-value fact below its alpha in the same sentence", "message": "'Significant' implies a statistical test. Cite a p-value below alpha, or say 'more frequent' / 'numerically higher'."},
    {"id": "STAT-002", "severity": "major", "pattern": "\\b(caused|due to)\\b", "requires": "investigator causality wording", "message": "Causal language is not allowed in results sections. Use 'considered related by the investigator'."},
    {"id": "STAT-003", "severity": "major", "pattern": "\\b(trend|trended)\\b", "requires": "pre-specified analysis", "message": "'Trend' is only allowed when a pre-specified trend analysis exists in the SAP."},
    {"id": "NUM-001", "severity": "critical", "pattern": "[0-9]", "requires": "every numeral produced by a slot", "message": "A numeral appears in generated prose outside a slot. The model must never write numbers."},
]

def dump(name, obj):
    with open(os.path.join(OUT, name), "w") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)
        f.write("\n")

dump("study.json", study)
dump("tlfs.json", {"_synthetic": study["_synthetic"], "tlfs": tlfs})
dump("facts.json", {"_synthetic": study["_synthetic"], "facts": facts})
dump("tlf-14.3.1.2-v2.json", {"_synthetic": study["_synthetic"], "tlf": v2_tlf, "facts": v2_facts, "change": "Dizziness, velorantib: 22 -> 23 after a data query (fictional)"})
dump("patients.json", {"_synthetic": study["_synthetic"], "patients": patients})
dump("sections.json", {"_synthetic": study["_synthetic"], "sections": sections, "narrativeTemplate": narrative_template})
dump("rules.json", {"_synthetic": study["_synthetic"], "statisticalLanguageRules": stat_rules})
print(f"tlfs={len(tlfs)} facts={len(facts)} patients={len(patients)} sections={len(sections)}")
