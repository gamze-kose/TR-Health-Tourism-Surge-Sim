"""Model parameters with ranges and their basis.

kind: data (official statistics), lit (published estimate), derived (arithmetic on sourced figures),
assumption (no published estimate found; explored in the sensitivity analysis), setting (policy lever or scenario choice).
Ranges feed a Beta-PERT distribution in the Monte Carlo analysis.
"""

N_HT = 1398580  # International health tourists, 2025, USHAŞ as reported by Sabah and Akdeniz Gerçek.
INCOME_HT = 3022452000  # USD, 2025, USHAŞ as reported by Akdeniz Gerçek.
REV_PER_PATIENT = INCOME_HT / N_HT


def p(base, low=None, high=None, label=None, source=None, kind="assumption"):
    if source and (source.startswith("Policy lever") or source.startswith("Scenario setting")):
        kind = "setting"
    d = {"base": base, "kind": kind}
    if low is not None:
        d["low"] = low
        d["high"] = high
    if label:
        d["label"] = label
    if source:
        d["source"] = source
    return d


PARAMS = {
    # Capacity inputs used when the province table is built.
    "authBedsNational": p(64092, label="Beds in authorised hospitals, national", source="654 authorised hospitals (Ministry list, 24 Jul 2024, via USTE) times 98 beds, the private-sector mean (Yearbook 2024, Table 7.5)", kind="derived"),
    "authIcuShare": p(0.30, label="Authorised share of adult ICU beds", source="Private share of adult ICU beds, 9,695 of 32,760 (Yearbook 2024, Table 7.3)", kind="derived"),
    "patientsPerDevice": p(5, label="Patients per haemodialysis device", source="2.5 shifts a day, six days a week, three sessions per patient; three-shift practice in Kaya 2024", kind="derived"),
    "oncPatientsNational": p(9170, label="Patients on radiotherapy at one time, national", source="262 megavoltage devices (Becerir 2021) times 35 patients per device per day (assumption)", kind="derived"),
    "htInpatientShare": p(0.25, label="Health tourists treated as inpatients", source="No published share found; assumption"),
    "htLosDays": p(3.0, label="Inpatient stay of health tourists, days", source="Private-sector mean is 2.7 days (Yearbook 2024, Table 8.25)", kind="derived"),
    "htIcuShare": p(0.05, label="ICU share of health tourism inpatient days", source="Assumption"),

    # Activation of the reserve.
    "kappa": p(0.30, 0.15, 0.60, "Idle authorised beds activated", "No published estimate for Türkiye. Upper end informed by Lombardy, 67% ICU expansion in 18 days (Grasselli 2020)"),
    "rho": p(0.25, 0.05, 0.60, "Paying patient capacity released", "Policy lever"),
    "capTrauma": p(0.50, 0.25, 0.75, "Activated beds suited to complex trauma", "Assumption"),
    "theta": p(0.20, 0.10, 0.35, "Released beds set aside for rehabilitation", "Assumption"),
    "convRehab": p(0.60, 0.30, 0.90, "Effective yield of converted rehabilitation beds", "Assumption"),
    "kappaRehab": p(0.15, 0.05, 0.30, "Rehabilitation hospital beds made available", "Assumption; 2,597 beds in 16 hospitals (Yearbook 2024, Table 7.1)"),
    "occSafe": p(0.85, label="Safe bed occupancy ceiling", source="Risk rises above about 85% (Bagust 1999)", kind="lit"),
    "occSafeIcu": p(0.85, label="Safe ICU occupancy ceiling", source="Bagust 1999, applied to ICU", kind="lit"),
    "occIcu": p(0.70, 0.60, 0.85, "ICU occupancy before the crisis", "Assumption; Lombardy usual winter 85 to 90% (Grasselli 2020) marks the upper end"),
    "dialIdle": p(0.34, 0.18, 0.45, "Haemodialysis capacity that is idle", "63,564 in-centre patients (71% of 89,527; Sensoy 2025, Aylı 2026) against about 96,500 places (Yearbook 2024, Table 7.6)", "derived"),
    "oncIdle": p(0.10, 0.03, 0.20, "Oncology capacity that is idle", "Assumption; 262 devices against an estimated need of 332 to 411 (Becerir 2021) implies little slack"),
    "stepThermal": p(0.08, 0.02, 0.20, "Thermal beds used for step-down care", "Assumption"),
    "stepHotel": p(0.006, 0.001, 0.020, "Hotel beds used for step-down care", "Assumption; 100,000 earthquake survivors were in hotels within a week in 2023, about 8% of licensed beds (TÜROFED via DHA 2023)"),
    "rampDays": p(7, 2, 18, "Days to activate hospital capacity (time constant)", "Lombardy: 130 ICU beds in 48 h, 482 in 18 days (Grasselli 2020)", "lit"),
    "rampDaysStep": p(14, 7, 30, "Days to activate step-down capacity (time constant)", "Assumption"),
    "seasonAmpComm": p(0.05, 0.0, 0.15, "Seasonal swing in paying patient demand", "First half of the year: 51% in 2023 (USTE)", "derived"),
    "seasonPeakComm": p(120, label="Peak day for paying demand", source="Assumption"),
    "hotelOccMean": p(0.495, 0.45, 0.55, "Mean hotel occupancy", "49.54% in 2025 (Ministry statistics via HorecaTrend 2026)", "data"),
    "hotelOccAmp": p(0.222, 0.18, 0.26, "Seasonal swing in hotel occupancy", "26.79% in March to 71.15% in August 2025 (HorecaTrend 2026)", "derived"),
    "thermalOccMean": p(0.50, 0.35, 0.65, "Mean thermal hotel occupancy", "Assumption"),
    "thermalOccAmp": p(0.15, 0.05, 0.25, "Seasonal swing in thermal occupancy", "Assumption"),
    "damageRecoveryDays": p(120, 60, 240, "Recovery time of damaged hospitals (time constant)", "Assumption"),

    # Workforce and coordination.
    "ptTotal": p(45000, label="Physiotherapists working in Türkiye", source="Table 4 total (Özgöbek 2026)", kind="lit"),
    "ptMobil": p(0.05, 0.02, 0.12, "Rehabilitation staff mobilised", "Assumption"),
    "ptPatientsPerStaff": p(12, 6, 20, "Patients per rehabilitation professional", "WHO minimum is one per 20 beds (WHO 2021)", "lit"),
    "eta": p(0.50, 0.0, 1.0, "National matching of patients to beds", "Policy lever"),
    "htRef": p(0.02, label="Tourist share at which a province is fully visible", source="Assumption"),
    "accessRate": p(0.05, 0.01, 0.20, "Referrals cleared to travel per day", "Assumption; a published clearance rate anchors the restricted case (WHO via QNA 2026)"),
    "fastTrack": p(1.0, label="Fast-track designation multiplier", source="Policy lever; Article 2 of the 2025 regulation"),
    "landSlotsPerGate": p(40, 10, 100, "Ambulance seats per border gate per day", "Assumption; 230 wounded moved in one sea trip (MFA 2011)"),
    "airSlots": p(60, 15, 245, "Air medical seats per day", "One A400M load of 61 patients a day (AA 2023); upper end is the domestic surge of 1,715 air transfers in a week (Yılmaz 2023)"),
    "coordCases": p(300, 100, 700, "New cases coordinators can take per day", "654 authorised hospitals with half a new case per unit per day", "derived"),
    "tauHours": p(8, 4, 16, "Travel-time decay of placement choice, hours", "Assumption"),
    "capExp": p(1.0, label="Capacity exponent in placement choice", source="Assumption"),
    "startDoy": p(60, label="Start day of the year", source="Scenario setting"),

    # Crisis demand.
    "severityMult": p(1.0, 0.6, 1.6, "Crisis severity", "Scenario setting"),
    "exportDisaster": p(0.05, 0.01, 0.20, "Severe disaster cases needing care abroad", "Assumption; 1,715 of 80,278 injured moved by air within Türkiye in 2023 (2.1%), Yılmaz 2023"),
    "domesticOnReserve": p(0.24, 0.10, 0.50, "Domestic casualties falling on the authorised reserve", "Authorised share of all beds, 64,092 of 268,359", "derived"),
    "exportRehabBoost": p(2.0, 1.0, 4.0, "Extra share of rehabilitation cases going abroad", "Haiti 2010: 25 to 30 of about 150 spinal cord injury survivors evacuated abroad (Gosney 2013)", "derived"),
    "exportConflict": p(0.15, 0.08, 0.25, "Severe conflict cases needing care abroad", "Over 16,500 patients needing care abroad, of 172,000 injured, in a documented conflict (WHO via Dawn 2025; WHO EMRO 2026)", "derived"),
    "chronicLoss": p(0.30, 0.10, 0.60, "Chronic patients losing care in conflict", "Assumption"),
    "epiTransfer": p(0.005, 0.001, 0.02, "Critical epidemic cases moved across borders", "Germany received 220 patients from three countries in 2020 (EC 2020)", "derived"),
    "epiStepTransfer": p(0.05, 0.01, 0.15, "Post-ICU patients moved for rehabilitation", "Assumption"),
    "epiRehabNeed": p(0.40, 0.20, 0.60, "Critical survivors needing rehabilitation", "Assumption"),
    "epiChronicLoss": p(0.05, 0.01, 0.15, "Chronic patients needing care abroad in epidemics", "Assumption"),
    "dzIcu": p(0.029, 0.015, 0.05, "Disaster injured needing ICU", "Kahramanmaraş emergency cohort, 2.9% (Buyurgan 2023)", "lit"),
    "dzSurg": p(0.263, 0.18, 0.35, "Disaster injured needing ward care", "Kahramanmaraş emergency cohort, 26.3% (Buyurgan 2023)", "lit"),
    "dzCrush": p(0.016, 0.008, 0.03, "Disaster injured needing dialysis", "Kahramanmaraş emergency cohort, 1.6% (Buyurgan 2023)", "lit"),
    "dzRehab": p(0.095, 0.05, 0.15, "Disaster injured needing inpatient rehabilitation", "850 amputations (Yılmaz 2023), amputees 11.2% of rehabilitation cohort (Yağcı 2023), 80,278 injured", "derived"),
    "dzStep": p(0.05, 0.02, 0.12, "Disaster injured needing step-down care", "Assumption"),
    "cfIcu": p(0.03, 0.015, 0.06, "Conflict injured needing ICU", "Set to the earthquake value; no conflict estimate found"),
    "cfSurg": p(0.26, 0.15, 0.40, "Conflict injured needing surgery", "Set to the earthquake value; no conflict estimate found"),
    "cfRehab": p(0.25, 0.20, 0.30, "Conflict injured with life-changing injuries", "43,000 of 172,000 (WHO EMRO 2026)", "derived"),
    "cfStep": p(0.05, 0.02, 0.10, "Conflict injured needing step-down care", "Assumption"),

    # Clinical pathway.
    "losIcu": p(8, 4, 13, "ICU stay, days", "COVID-19 median 7 to 8, IQR 4 to 13 (Rees 2020)", "lit"),
    "losTrauma": p(14, 7, 21, "Trauma and reconstructive stay, days", "Assumption"),
    "losDial": p(90, 30, 180, "Hosted dialysis stay, days", "Assumption"),
    "losOnco": p(90, 42, 180, "Hosted oncology stay, days", "Assumption"),
    "losRehab": p(42, 21, 72, "Inpatient rehabilitation stay, days", "Traumatic spinal cord injury median 42 (Kao 2022); earthquake nerve injury median 49, IQR 35 to 72 (Bilir 2025)", "lit"),
    "losStep": p(30, 14, 60, "Step-down stay, days", "Assumption"),
    "icuToTrauma": p(0.70, 0.5, 0.9, "ICU survivors moving to ward care", "Assumption"),
    "traumaToRehab": p(0.35, 0.2, 0.5, "Ward patients moving to rehabilitation", "Assumption"),
    "rehabToStep": p(0.40, 0.2, 0.6, "Rehabilitation patients moving to step-down", "Assumption"),
    "mortIcu": p(0.20, 0.10, 0.35, "ICU mortality", "Assumption"),
    "mortTrauma": p(0.02, 0.005, 0.05, "Ward mortality", "Assumption"),
    "mortDial": p(0.05, 0.02, 0.10, "Mortality during hosted dialysis", "Assumption"),
    "mortOnco": p(0.05, 0.02, 0.10, "Mortality during hosted oncology care", "Assumption"),
    "waitHazIcu": p(0.03, 0.01, 0.08, "Daily loss while waiting, ICU", "Assumption"),
    "waitHazTrauma": p(0.0014, 0.0005, 0.004, "Daily loss while waiting, ward", "Ten times the rate on a documented waiting list"),
    "waitHazDial": p(0.01, 0.003, 0.03, "Daily loss while waiting, dialysis", "Assumption"),
    "waitHazOnco": p(0.00014, 0.00005, 0.0005, "Daily loss while waiting, oncology", "1,092 known deaths among about 15,500 waiting over about 515 days (WHO via Dawn 2025)", "derived"),
    "waitHazRehab": p(0.00014, 0.00005, 0.0005, "Daily loss while waiting, rehabilitation", "Same rate on a documented waiting list", "derived"),
    "waitHazStep": p(0.00014, 0.00005, 0.0005, "Daily loss while waiting, step-down", "Same rate on a documented waiting list", "derived"),
    "slotIcu": p(4, 2, 6, "Transport seats used by an ICU patient", "Assumption"),
    "slotTrauma": p(2, 1, 3, "Transport seats used by a stretcher patient", "Assumption"),
    "slotStep": p(0.5, 0.25, 1, "Transport seats used by a walking patient", "Assumption"),

    # Money, USD.
    "costIcu": p(450, 146, 900, "ICU cost per day", "Lower bound is variable cost only, Ankara 2024 (Baş 2026); base is an assumption"),
    "costTrauma": p(220, 86, 505, "Ward cost per day", "WHO-CHOICE, Turkey, secondary hospital, 2010 I$ 219.99, UI 86 to 506, used unconverted", "lit"),
    "costDial": p(60, 30, 100, "Hosted dialysis cost per patient day", "Session USD 41 to 50 (Turgut 2024), three a week, plus lodging (assumption)", "derived"),
    "costOnco": p(120, 60, 300, "Hosted oncology cost per patient day", "Assumption"),
    "costRehab": p(150, 80, 300, "Inpatient rehabilitation cost per day", "Assumption"),
    "costStep": p(60, 30, 120, "Step-down cost per day", "Assumption"),
    "costTransfer": p(3000, 1000, 15000, "Transfer cost per patient", "Assumption"),
    "commRevPerBedDay": p(round(REV_PER_PATIENT / 3.0), 300, 1200, "Paying patient revenue per bed day", "USD 3.02 bn over 1,398,580 patients in 2025, per 3-day stay", "derived"),
    "incomeHt": p(INCOME_HT, label="Health tourism income, USD", source="USHAŞ 2025 as reported in the press", kind="data"),
    "funding": p(0.30, 0.0, 0.8, "Costs covered by external payers", "Policy lever; receiving states paid part of EU MEDEVAC costs (WHO EURO 2026)"),

    # Needs lens. No ranges, so that Monte Carlo draws and every core result stay as published.
    "extendedNeeds": p(0, label="Include heart, congenital and blood disease referrals (1 yes, 0 no)", source="Setting. Off in the core run", kind="setting"),
    "xHeart": p(round(247 / 759, 3), label="Heart disease referrals per cancer referral", source="WHO medical evacuation data to 1 December 2025: 247 and 759 patients", kind="derived"),
    "xCongenital": p(round(272 / 759, 3), label="Congenital disease referrals per cancer referral", source="WHO medical evacuation data to 1 December 2025: 272 and 759 patients", kind="derived"),
    "xBlood": p(round(11 / 37, 3), label="Blood disease referrals per cancer referral", source="Patient permit applications in one setting, October 2022 (WHO): haematology 11%, oncology 37%", kind="derived"),
    "xEye": p(round(269 / 759, 3), label="Eye disease referrals per cancer referral", source="WHO medical evacuation data to 1 December 2025: 269 and 759 patients", kind="derived"),
    "specIdle": p(0.25, label="Share of specialised units free for referred patients", source="Assumption"),
    "companionsPerPatient": p(round(12074 / 10620, 2), label="Companions per patient", source="WHO medical evacuation data to 1 December 2025: 12,074 companions and 10,620 patients", kind="derived"),
    "companionNightUsd": p(40, label="Lodging cost per companion night, USD", source="Assumption"),
    "routineDelay": p(180, label="Days of conflict before routine care travel rises", source="Assumption"),
    "routineUplift": p(0.5, label="Rise in routine care travel in a long conflict", source="Assumption"),
    "payOrigin": p(0.30, label="Costs paid by the patient's own government", source="Assumption. In one documented crisis, the government paid for patients abroad"),
    "payFamily": p(0.10, label="Costs paid by patients and families", source="Assumption. A commentary reports that many families sell belongings or borrow money to pay"),
    "unpaidShare": p(0.20, label="Share of billed care that is never paid", source="Assumption. A commentary reports that receiving countries threatened to stop serving patients over unpaid bills"),

    # Building a hypothetical crisis from a chosen country. No ranges, so that the reference analyses stay as published.
    "quakeInjuredLimited": p(20000, label="Injured in a limited earthquake", source="Assumption: a quarter of the major level"),
    "quakeInjuredMajor": p(80278, label="Injured in a major earthquake", source="80,278 injured reported after a very large earthquake (Yılmaz 2023)", kind="lit"),
    "quakeInjuredExtreme": p(300000, label="Injured in an extreme earthquake", source="300,000 injured reported after one of the largest earthquakes reviewed (Gosney 2013)", kind="lit"),
    "quakeInjuredCap": p(0.03, label="Largest share of a population injured by an earthquake", source="About 3%: 300,000 injured in a population of about 10 million (Gosney 2013)", kind="derived"),
    "conflictInjuredLimited": p(45, label="Injured a day in a limited conflict", source="Assumption: a quarter of the major level"),
    "conflictInjuredMajor": p(180, label="Injured a day in a major conflict", source="172,000 injured in about 31 months in a documented conflict (WHO EMRO 2026)", kind="derived"),
    "conflictInjuredExtreme": p(360, label="Injured a day in an extreme conflict", source="Assumption: twice the major level"),
    "conflictInjuredCap": p(0.03, label="Largest share of a population injured a year in conflict", source="About 3% a year: 172,000 injured in about 31 months in a population of about 2.2 million (WHO EMRO 2026)", kind="derived"),
    "conflictAffectedLimited": p(500000, label="People cut off from care in a limited conflict", source="Assumption"),
    "conflictAffectedMajor": p(2100000, label="People cut off from care in a major conflict", source="Assumption, the population of the documented conflict used for the injury rate"),
    "conflictAffectedExtreme": p(5000000, label="People cut off from care in an extreme conflict", source="Assumption"),
    "dialysisPerMillion": p(524, label="Dialysis patients per million people", source="About 1,100 patients in a population of about 2.1 million (Ankah 2025)", kind="derived"),
    "cancerPerMillion": p(5238, label="Cancer patients in treatment per million people", source="About 11,000 patients in a population of about 2.1 million (WHO)", kind="derived"),
    "epiCriticalLimited": p(175, label="Critical cases per million people, limited epidemic", source="Assumption: half of the major level"),
    "epiCriticalMajor": p(351, label="Critical cases per million people, major epidemic", source="Assumption: 60,000 critical cases across about 171 million people", kind="assumption"),
    "epiCriticalExtreme": p(702, label="Critical cases per million people, extreme epidemic", source="Assumption: twice the major level"),
    "epiDialysisPerMillion": p(70, label="Dialysis patients affected per million people in an epidemic", source="Assumption: 12,000 across about 171 million people"),
    "exitOpen": p(1.0, label="Exit clearance factor, open route", source="Scenario setting"),
    "exitLimited": p(0.5, label="Exit clearance factor, limited route", source="Scenario setting"),
    "exitRestricted": p(0.02, label="Exit clearance factor, restricted route", source="Scenario setting, set to match a published clearance rate"),
    "refBeds": p(2.81, label="Hospital beds per 1,000 people at the reference level", source="Türkiye (OECD, World Bank and national records, via Our World in Data)", kind="data"),
    "gapExponent": p(0.5, label="How strongly fewer hospital beds raise the need for care abroad", source="Assumption"),
    "gapMin": p(0.5, label="Lowest factor for need of care abroad", source="Assumption"),
    "gapMax": p(2.0, label="Highest factor for need of care abroad", source="Assumption"),
    "refDiabetes": p(10.59, label="Diabetes prevalence at the anchor for dialysis, %", source="International Diabetes Federation, via Our World in Data", kind="data"),
    "refAge65": p(3.04, label="People aged 65 or over at the anchor for cancer, %", source="United Nations, via Our World in Data", kind="data"),
    "ageExponent": p(0.5, label="How strongly an older population raises cancer treatment need", source="Assumption"),
    "routinePerMillion": p(500, label="Routine care patients a year per million people, close to Türkiye", source="Assumption. No national count by nationality was found"),
    "rotationHours": p(20, label="Hours of aircraft time available per medical flight day", source="Assumption"),

    # The course of the years, 2027 to 2047.
    "phiTrend": p(0.90, label="Damping of past trends per year", source="Damped trend forecasting (Gardner and McKenzie 1985); usual range 0.80 to 0.98 (Hyndman and Athanasopoulos 2021). The midpoint is rounded", kind="lit"),
    "ageBedRatio": p(6, label="Hospital days per person, aged 65 or over compared with younger people", source="Assumption. No Turkish figure was found. About 9 in Ireland in 2023, derived from one in seven people and over 60% of inpatient days (Brick 2025)"),
    "stayDecline": p(0.005, label="Yearly fall in hospital days for a given age", source="Assumption. Shorter stays offset part of the effect of ageing (Van den Heede 2019, Belgium)"),
    "occCeiling": p(0.95, label="Highest bed occupancy allowed in projections", source="Assumption"),
    "payingGrowth": p(0.036, label="Yearly growth of paying health tourists, before damping", source="1,258,382 in 2022 to 1,398,580 in 2025 (TÜİK and USHAŞ figures)", kind="derived"),
    "hotelTrend": p(0.02, label="Yearly growth of hotel beds, before damping", source="Assumption"),
    "outlookEnd": p(2047, label="Last year of the outlook", source="Scenario setting"),
    "programmeStart": p(2027, label="First year of a development programme", source="Scenario setting"),
    "programmeEnd": p(2040, label="Year a development programme reaches its targets", source="Scenario setting"),
    "unitStartYear": p(2028, label="First year a new international patient unit can open", source="Scenario setting"),
    "unitMinSpecialists": p(148, label="Fewest specialists for a province to open a unit", source="The smallest province named as holding a certificate, Çankırı, 148 specialists (Yearbook 2024, Table 10.12; Işıkçelik 2026)", kind="derived"),
    "unitRampYears": p(3, label="Years a new unit needs to reach full use", source="Authors' judgement"),
    "unitsPlanned": p(1, label="New provinces with a unit each year, planned expansion", source="Authors' judgement"),
    "unitsAmbitious": p(2, label="New provinces with a unit each year, ambitious programme", source="Authors' judgement"),
    "certPlanned": p(0.40, label="Share of hospitals holding the certificate by the target year, planned expansion", source="Authors' judgement. The national share was 42% in December 2024 (650 of 1,562 hospitals)"),
    "certAmbitious": p(0.60, label="Share of hospitals holding the certificate by the target year, ambitious programme", source="Authors' judgement"),
    "rtDevicesBase": p(262, label="Radiotherapy devices today", source="262 megavoltage devices (Becerir 2021)", kind="lit"),
    "rtPlanned": p(332, label="Radiotherapy devices by the target year, planned expansion", source="Lower estimate of need, 332 (Becerir 2021)", kind="lit"),
    "rtAmbitious": p(411, label="Radiotherapy devices by the target year, ambitious programme", source="Upper estimate of need, 411 (Becerir 2021)", kind="lit"),
    "responsePlanned": p(0.5, label="How far planned expansion moves the response towards a prepared national plan", source="Authors' judgement"),
    "responseAmbitious": p(1.0, label="How far the ambitious programme moves the response towards a prepared national plan", source="Authors' judgement"),
    "rehabPlanned": p(0.5, label="Rise in rehabilitation beds by the target year, planned expansion", source="Authors' judgement"),
    "rehabAmbitious": p(1.0, label="Rise in rehabilitation beds by the target year, ambitious programme", source="Authors' judgement"),
}
