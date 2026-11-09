# Model parameters

Every value used by the model, with its range and basis. Ranges feed a Beta-PERT distribution in the Monte Carlo analysis. Parameters marked as assumptions have no published estimate that could be located and are explored in the sensitivity analysis. Parameters of the needs lens have no range, so that core results stay as published.

| Parameter | Key | Value | Range | Type | Basis |
|---|---|---|---|---|---|
| Beds in authorised hospitals, national | `authBedsNational` | 64092 |  | Derived from sourced figures | 654 authorised hospitals (Ministry list, 24 Jul 2024, via USTE) times 98 beds, the private-sector mean (Yearbook 2024, Table 7.5) |
| Authorised share of adult ICU beds | `authIcuShare` | 0.3 |  | Derived from sourced figures | Private share of adult ICU beds, 9,695 of 32,760 (Yearbook 2024, Table 7.3) |
| Patients per haemodialysis device | `patientsPerDevice` | 5 |  | Derived from sourced figures | 2.5 shifts a day, six days a week, three sessions per patient; three-shift practice in Kaya 2024 |
| Patients on radiotherapy at one time, national | `oncPatientsNational` | 9170 |  | Derived from sourced figures | 262 megavoltage devices (Becerir 2021) times 35 patients per device per day (assumption) |
| Health tourists treated as inpatients | `htInpatientShare` | 0.25 |  | Assumption | No published share found; assumption |
| Inpatient stay of health tourists, days | `htLosDays` | 3.0 |  | Derived from sourced figures | Private-sector mean is 2.7 days (Yearbook 2024, Table 8.25) |
| ICU share of health tourism inpatient days | `htIcuShare` | 0.05 |  | Assumption | Assumption |
| Idle authorised beds activated | `kappa` | 0.3 | 0.15 to 0.6 | Assumption | No published estimate for Türkiye. Upper end informed by Lombardy, 67% ICU expansion in 18 days (Grasselli 2020) |
| Paying patient capacity released | `rho` | 0.25 | 0.05 to 0.6 | Setting | Policy lever |
| Activated beds suited to complex trauma | `capTrauma` | 0.5 | 0.25 to 0.75 | Assumption | Assumption |
| Released beds set aside for rehabilitation | `theta` | 0.2 | 0.1 to 0.35 | Assumption | Assumption |
| Effective yield of converted rehabilitation beds | `convRehab` | 0.6 | 0.3 to 0.9 | Assumption | Assumption |
| Rehabilitation hospital beds made available | `kappaRehab` | 0.15 | 0.05 to 0.3 | Assumption | Assumption; 2,597 beds in 16 hospitals (Yearbook 2024, Table 7.1) |
| Safe bed occupancy ceiling | `occSafe` | 0.85 |  | Published estimate | Risk rises above about 85% (Bagust 1999) |
| Safe ICU occupancy ceiling | `occSafeIcu` | 0.85 |  | Published estimate | Bagust 1999, applied to ICU |
| ICU occupancy before the crisis | `occIcu` | 0.7 | 0.6 to 0.85 | Assumption | Assumption; Lombardy usual winter 85 to 90% (Grasselli 2020) marks the upper end |
| Haemodialysis capacity that is idle | `dialIdle` | 0.34 | 0.18 to 0.45 | Derived from sourced figures | 63,564 in-centre patients (71% of 89,527; Sensoy 2025, Aylı 2026) against about 96,500 places (Yearbook 2024, Table 7.6) |
| Oncology capacity that is idle | `oncIdle` | 0.1 | 0.03 to 0.2 | Assumption | Assumption; 262 devices against an estimated need of 332 to 411 (Becerir 2021) implies little slack |
| Thermal beds used for step-down care | `stepThermal` | 0.08 | 0.02 to 0.2 | Assumption | Assumption |
| Hotel beds used for step-down care | `stepHotel` | 0.006 | 0.001 to 0.02 | Assumption | Assumption; 100,000 earthquake survivors were in hotels within a week in 2023, about 8% of licensed beds (TÜROFED via DHA 2023) |
| Days to activate hospital capacity (time constant) | `rampDays` | 7 | 2 to 18 | Published estimate | Lombardy: 130 ICU beds in 48 h, 482 in 18 days (Grasselli 2020) |
| Days to activate step-down capacity (time constant) | `rampDaysStep` | 14 | 7 to 30 | Assumption | Assumption |
| Seasonal swing in paying patient demand | `seasonAmpComm` | 0.05 | 0.0 to 0.15 | Derived from sourced figures | First half of the year: 51% in 2023 (USTE) |
| Peak day for paying demand | `seasonPeakComm` | 120 |  | Assumption | Assumption |
| Mean hotel occupancy | `hotelOccMean` | 0.495 | 0.45 to 0.55 | Official data | 49.54% in 2025 (Ministry statistics via HorecaTrend 2026) |
| Seasonal swing in hotel occupancy | `hotelOccAmp` | 0.222 | 0.18 to 0.26 | Derived from sourced figures | 26.79% in March to 71.15% in August 2025 (HorecaTrend 2026) |
| Mean thermal hotel occupancy | `thermalOccMean` | 0.5 | 0.35 to 0.65 | Assumption | Assumption |
| Seasonal swing in thermal occupancy | `thermalOccAmp` | 0.15 | 0.05 to 0.25 | Assumption | Assumption |
| Recovery time of damaged hospitals (time constant) | `damageRecoveryDays` | 120 | 60 to 240 | Assumption | Assumption |
| Physiotherapists working in Türkiye | `ptTotal` | 45000 |  | Published estimate | Table 4 total (Özgöbek 2026) |
| Rehabilitation staff mobilised | `ptMobil` | 0.05 | 0.02 to 0.12 | Assumption | Assumption |
| Patients per rehabilitation professional | `ptPatientsPerStaff` | 12 | 6 to 20 | Published estimate | WHO minimum is one per 20 beds (WHO 2021) |
| National matching of patients to beds | `eta` | 0.5 | 0.0 to 1.0 | Setting | Policy lever |
| Tourist share at which a province is fully visible | `htRef` | 0.02 |  | Assumption | Assumption |
| Referrals cleared to travel per day | `accessRate` | 0.05 | 0.01 to 0.2 | Assumption | Assumption; a published clearance rate anchors the restricted case (WHO via QNA 2026) |
| Fast-track designation multiplier | `fastTrack` | 1.0 |  | Setting | Policy lever; Article 2 of the 2025 regulation |
| Ambulance seats per border gate per day | `landSlotsPerGate` | 40 | 10 to 100 | Assumption | Assumption; 230 wounded moved in one sea trip (MFA 2011) |
| Air medical seats per day | `airSlots` | 60 | 15 to 245 | Assumption | One A400M load of 61 patients a day (AA 2023); upper end is the domestic surge of 1,715 air transfers in a week (Yılmaz 2023) |
| New cases coordinators can take per day | `coordCases` | 300 | 100 to 700 | Derived from sourced figures | 654 authorised hospitals with half a new case per unit per day |
| Travel-time decay of placement choice, hours | `tauHours` | 8 | 4 to 16 | Assumption | Assumption |
| Capacity exponent in placement choice | `capExp` | 1.0 |  | Assumption | Assumption |
| Start day of the year | `startDoy` | 60 |  | Setting | Scenario setting |
| Crisis severity | `severityMult` | 1.0 | 0.6 to 1.6 | Setting | Scenario setting |
| Severe disaster cases needing care abroad | `exportDisaster` | 0.05 | 0.01 to 0.2 | Assumption | Assumption; 1,715 of 80,278 injured moved by air within Türkiye in 2023 (2.1%), Yılmaz 2023 |
| Domestic casualties falling on the authorised reserve | `domesticOnReserve` | 0.24 | 0.1 to 0.5 | Derived from sourced figures | Authorised share of all beds, 64,092 of 268,359 |
| Extra share of rehabilitation cases going abroad | `exportRehabBoost` | 2.0 | 1.0 to 4.0 | Derived from sourced figures | Haiti 2010: 25 to 30 of about 150 spinal cord injury survivors evacuated abroad (Gosney 2013) |
| Severe conflict cases needing care abroad | `exportConflict` | 0.15 | 0.08 to 0.25 | Derived from sourced figures | Over 16,500 patients needing care abroad, of 172,000 injured, in a documented conflict (WHO via Dawn 2025; WHO EMRO 2026) |
| Chronic patients losing care in conflict | `chronicLoss` | 0.3 | 0.1 to 0.6 | Assumption | Assumption |
| Critical epidemic cases moved across borders | `epiTransfer` | 0.005 | 0.001 to 0.02 | Derived from sourced figures | Germany received 220 patients from three countries in 2020 (EC 2020) |
| Post-ICU patients moved for rehabilitation | `epiStepTransfer` | 0.05 | 0.01 to 0.15 | Assumption | Assumption |
| Critical survivors needing rehabilitation | `epiRehabNeed` | 0.4 | 0.2 to 0.6 | Assumption | Assumption |
| Chronic patients needing care abroad in epidemics | `epiChronicLoss` | 0.05 | 0.01 to 0.15 | Assumption | Assumption |
| Disaster injured needing ICU | `dzIcu` | 0.029 | 0.015 to 0.05 | Published estimate | Kahramanmaraş emergency cohort, 2.9% (Buyurgan 2023) |
| Disaster injured needing ward care | `dzSurg` | 0.263 | 0.18 to 0.35 | Published estimate | Kahramanmaraş emergency cohort, 26.3% (Buyurgan 2023) |
| Disaster injured needing dialysis | `dzCrush` | 0.016 | 0.008 to 0.03 | Published estimate | Kahramanmaraş emergency cohort, 1.6% (Buyurgan 2023) |
| Disaster injured needing inpatient rehabilitation | `dzRehab` | 0.095 | 0.05 to 0.15 | Derived from sourced figures | 850 amputations (Yılmaz 2023), amputees 11.2% of rehabilitation cohort (Yağcı 2023), 80,278 injured |
| Disaster injured needing step-down care | `dzStep` | 0.05 | 0.02 to 0.12 | Assumption | Assumption |
| Conflict injured needing ICU | `cfIcu` | 0.03 | 0.015 to 0.06 | Assumption | Set to the earthquake value; no conflict estimate found |
| Conflict injured needing surgery | `cfSurg` | 0.26 | 0.15 to 0.4 | Assumption | Set to the earthquake value; no conflict estimate found |
| Conflict injured with life-changing injuries | `cfRehab` | 0.25 | 0.2 to 0.3 | Derived from sourced figures | 43,000 of 172,000 (WHO EMRO 2026) |
| Conflict injured needing step-down care | `cfStep` | 0.05 | 0.02 to 0.1 | Assumption | Assumption |
| ICU stay, days | `losIcu` | 8 | 4 to 13 | Published estimate | COVID-19 median 7 to 8, IQR 4 to 13 (Rees 2020) |
| Trauma and reconstructive stay, days | `losTrauma` | 14 | 7 to 21 | Assumption | Assumption |
| Hosted dialysis stay, days | `losDial` | 90 | 30 to 180 | Assumption | Assumption |
| Hosted oncology stay, days | `losOnco` | 90 | 42 to 180 | Assumption | Assumption |
| Inpatient rehabilitation stay, days | `losRehab` | 42 | 21 to 72 | Published estimate | Traumatic spinal cord injury median 42 (Kao 2022); earthquake nerve injury median 49, IQR 35 to 72 (Bilir 2025) |
| Step-down stay, days | `losStep` | 30 | 14 to 60 | Assumption | Assumption |
| ICU survivors moving to ward care | `icuToTrauma` | 0.7 | 0.5 to 0.9 | Assumption | Assumption |
| Ward patients moving to rehabilitation | `traumaToRehab` | 0.35 | 0.2 to 0.5 | Assumption | Assumption |
| Rehabilitation patients moving to step-down | `rehabToStep` | 0.4 | 0.2 to 0.6 | Assumption | Assumption |
| ICU mortality | `mortIcu` | 0.2 | 0.1 to 0.35 | Assumption | Assumption |
| Ward mortality | `mortTrauma` | 0.02 | 0.005 to 0.05 | Assumption | Assumption |
| Mortality during hosted dialysis | `mortDial` | 0.05 | 0.02 to 0.1 | Assumption | Assumption |
| Mortality during hosted oncology care | `mortOnco` | 0.05 | 0.02 to 0.1 | Assumption | Assumption |
| Daily loss while waiting, ICU | `waitHazIcu` | 0.03 | 0.01 to 0.08 | Assumption | Assumption |
| Daily loss while waiting, ward | `waitHazTrauma` | 0.0014 | 0.0005 to 0.004 | Assumption | Ten times the rate on a documented waiting list |
| Daily loss while waiting, dialysis | `waitHazDial` | 0.01 | 0.003 to 0.03 | Assumption | Assumption |
| Daily loss while waiting, oncology | `waitHazOnco` | 0.00014 | 5e-05 to 0.0005 | Derived from sourced figures | 1,092 known deaths among about 15,500 waiting over about 515 days (WHO via Dawn 2025) |
| Daily loss while waiting, rehabilitation | `waitHazRehab` | 0.00014 | 5e-05 to 0.0005 | Derived from sourced figures | Same rate on a documented waiting list |
| Daily loss while waiting, step-down | `waitHazStep` | 0.00014 | 5e-05 to 0.0005 | Derived from sourced figures | Same rate on a documented waiting list |
| Transport seats used by an ICU patient | `slotIcu` | 4 | 2 to 6 | Assumption | Assumption |
| Transport seats used by a stretcher patient | `slotTrauma` | 2 | 1 to 3 | Assumption | Assumption |
| Transport seats used by a walking patient | `slotStep` | 0.5 | 0.25 to 1 | Assumption | Assumption |
| ICU cost per day | `costIcu` | 450 | 146 to 900 | Assumption | Lower bound is variable cost only, Ankara 2024 (Baş 2026); base is an assumption |
| Ward cost per day | `costTrauma` | 220 | 86 to 505 | Published estimate | WHO-CHOICE, Turkey, secondary hospital, 2010 I$ 219.99, UI 86 to 506, used unconverted |
| Hosted dialysis cost per patient day | `costDial` | 60 | 30 to 100 | Derived from sourced figures | Session USD 41 to 50 (Turgut 2024), three a week, plus lodging (assumption) |
| Hosted oncology cost per patient day | `costOnco` | 120 | 60 to 300 | Assumption | Assumption |
| Inpatient rehabilitation cost per day | `costRehab` | 150 | 80 to 300 | Assumption | Assumption |
| Step-down cost per day | `costStep` | 60 | 30 to 120 | Assumption | Assumption |
| Transfer cost per patient | `costTransfer` | 3000 | 1000 to 15000 | Assumption | Assumption |
| Paying patient revenue per bed day | `commRevPerBedDay` | 720 | 300 to 1200 | Derived from sourced figures | USD 3.02 bn over 1,398,580 patients in 2025, per 3-day stay |
| Health tourism income, USD | `incomeHt` | 3022452000 |  | Official data | USHAŞ 2025 as reported in the press |
| Costs covered by external payers | `funding` | 0.3 | 0.0 to 0.8 | Setting | Policy lever; receiving states paid part of EU MEDEVAC costs (WHO EURO 2026) |
| Include heart, congenital and blood disease referrals (1 yes, 0 no) | `extendedNeeds` | 0 |  | Setting | Setting. Off in the core run |
| Heart disease referrals per cancer referral | `xHeart` | 0.325 |  | Derived from sourced figures | WHO medical evacuation data to 1 December 2025: 247 and 759 patients |
| Congenital disease referrals per cancer referral | `xCongenital` | 0.358 |  | Derived from sourced figures | WHO medical evacuation data to 1 December 2025: 272 and 759 patients |
| Blood disease referrals per cancer referral | `xBlood` | 0.297 |  | Derived from sourced figures | Patient permit applications in one setting, October 2022 (WHO): haematology 11%, oncology 37% |
| Eye disease referrals per cancer referral | `xEye` | 0.354 |  | Derived from sourced figures | WHO medical evacuation data to 1 December 2025: 269 and 759 patients |
| Share of specialised units free for referred patients | `specIdle` | 0.25 |  | Assumption | Assumption |
| Companions per patient | `companionsPerPatient` | 1.14 |  | Derived from sourced figures | WHO medical evacuation data to 1 December 2025: 12,074 companions and 10,620 patients |
| Lodging cost per companion night, USD | `companionNightUsd` | 40 |  | Assumption | Assumption |
| Days of conflict before routine care travel rises | `routineDelay` | 180 |  | Assumption | Assumption |
| Rise in routine care travel in a long conflict | `routineUplift` | 0.5 |  | Assumption | Assumption |
| Costs paid by the patient's own government | `payOrigin` | 0.3 |  | Assumption | Assumption. In one documented crisis, the government paid for patients abroad |
| Costs paid by patients and families | `payFamily` | 0.1 |  | Assumption | Assumption. A commentary reports that many families sell belongings or borrow money to pay |
| Share of billed care that is never paid | `unpaidShare` | 0.2 |  | Assumption | Assumption. A commentary reports that receiving countries threatened to stop serving patients over unpaid bills |
| Injured in a limited earthquake | `quakeInjuredLimited` | 20000 |  | Assumption | Assumption: a quarter of the major level |
| Injured in a major earthquake | `quakeInjuredMajor` | 80278 |  | Published estimate | 80,278 injured reported after a very large earthquake (Yılmaz 2023) |
| Injured in an extreme earthquake | `quakeInjuredExtreme` | 300000 |  | Published estimate | 300,000 injured reported after one of the largest earthquakes reviewed (Gosney 2013) |
| Largest share of a population injured by an earthquake | `quakeInjuredCap` | 0.03 |  | Derived from sourced figures | About 3%: 300,000 injured in a population of about 10 million (Gosney 2013) |
| Injured a day in a limited conflict | `conflictInjuredLimited` | 45 |  | Assumption | Assumption: a quarter of the major level |
| Injured a day in a major conflict | `conflictInjuredMajor` | 180 |  | Derived from sourced figures | 172,000 injured in about 31 months in a documented conflict (WHO EMRO 2026) |
| Injured a day in an extreme conflict | `conflictInjuredExtreme` | 360 |  | Assumption | Assumption: twice the major level |
| Largest share of a population injured a year in conflict | `conflictInjuredCap` | 0.03 |  | Derived from sourced figures | About 3% a year: 172,000 injured in about 31 months in a population of about 2.2 million (WHO EMRO 2026) |
| People cut off from care in a limited conflict | `conflictAffectedLimited` | 500000 |  | Assumption | Assumption |
| People cut off from care in a major conflict | `conflictAffectedMajor` | 2100000 |  | Assumption | Assumption, the population of the documented conflict used for the injury rate |
| People cut off from care in an extreme conflict | `conflictAffectedExtreme` | 5000000 |  | Assumption | Assumption |
| Dialysis patients per million people | `dialysisPerMillion` | 524 |  | Derived from sourced figures | About 1,100 patients in a population of about 2.1 million (Ankah 2025) |
| Cancer patients in treatment per million people | `cancerPerMillion` | 5238 |  | Derived from sourced figures | About 11,000 patients in a population of about 2.1 million (WHO) |
| Critical cases per million people, limited epidemic | `epiCriticalLimited` | 175 |  | Assumption | Assumption: half of the major level |
| Critical cases per million people, major epidemic | `epiCriticalMajor` | 351 |  | Assumption | Assumption: 60,000 critical cases across about 171 million people |
| Critical cases per million people, extreme epidemic | `epiCriticalExtreme` | 702 |  | Assumption | Assumption: twice the major level |
| Dialysis patients affected per million people in an epidemic | `epiDialysisPerMillion` | 70 |  | Assumption | Assumption: 12,000 across about 171 million people |
| Exit clearance factor, open route | `exitOpen` | 1.0 |  | Setting | Scenario setting |
| Exit clearance factor, limited route | `exitLimited` | 0.5 |  | Setting | Scenario setting |
| Exit clearance factor, restricted route | `exitRestricted` | 0.02 |  | Setting | Scenario setting, set to match a published clearance rate |
| Hospital beds per 1,000 people at the reference level | `refBeds` | 2.81 |  | Official data | Türkiye (OECD, World Bank and national records, via Our World in Data) |
| How strongly fewer hospital beds raise the need for care abroad | `gapExponent` | 0.5 |  | Assumption | Assumption |
| Lowest factor for need of care abroad | `gapMin` | 0.5 |  | Assumption | Assumption |
| Highest factor for need of care abroad | `gapMax` | 2.0 |  | Assumption | Assumption |
| Diabetes prevalence at the anchor for dialysis, % | `refDiabetes` | 10.59 |  | Official data | International Diabetes Federation, via Our World in Data |
| People aged 65 or over at the anchor for cancer, % | `refAge65` | 3.04 |  | Official data | United Nations, via Our World in Data |
| How strongly an older population raises cancer treatment need | `ageExponent` | 0.5 |  | Assumption | Assumption |
| Routine care patients a year per million people, close to Türkiye | `routinePerMillion` | 500 |  | Assumption | Assumption. No national count by nationality was found |
| Hours of aircraft time available per medical flight day | `rotationHours` | 20 |  | Assumption | Assumption |
| Damping of past trends per year | `phiTrend` | 0.9 |  | Published estimate | Damped trend forecasting (Gardner and McKenzie 1985); usual range 0.80 to 0.98 (Hyndman and Athanasopoulos 2021). The midpoint is rounded |
| Hospital days per person, aged 65 or over compared with younger people | `ageBedRatio` | 6 |  | Assumption | Assumption. No Turkish figure was found. About 9 in Ireland in 2023, derived from one in seven people and over 60% of inpatient days (Brick 2025) |
| Yearly fall in hospital days for a given age | `stayDecline` | 0.005 |  | Assumption | Assumption. Shorter stays offset part of the effect of ageing (Van den Heede 2019, Belgium) |
| Highest bed occupancy allowed in projections | `occCeiling` | 0.95 |  | Assumption | Assumption |
| Yearly growth of paying health tourists, before damping | `payingGrowth` | 0.036 |  | Derived from sourced figures | 1,258,382 in 2022 to 1,398,580 in 2025 (TÜİK and USHAŞ figures) |
| Yearly growth of hotel beds, before damping | `hotelTrend` | 0.02 |  | Assumption | Assumption |
| Last year of the outlook | `outlookEnd` | 2047 |  | Setting | Scenario setting |
| First year of a development programme | `programmeStart` | 2027 |  | Setting | Scenario setting |
| Year a development programme reaches its targets | `programmeEnd` | 2040 |  | Setting | Scenario setting |
| First year a new international patient unit can open | `unitStartYear` | 2028 |  | Setting | Scenario setting |
| Fewest specialists for a province to open a unit | `unitMinSpecialists` | 148 |  | Derived from sourced figures | The smallest province named as holding a certificate, Çankırı, 148 specialists (Yearbook 2024, Table 10.12; Işıkçelik 2026) |
| Years a new unit needs to reach full use | `unitRampYears` | 3 |  | Assumption | Authors' judgement |
| New provinces with a unit each year, planned expansion | `unitsPlanned` | 1 |  | Assumption | Authors' judgement |
| New provinces with a unit each year, ambitious programme | `unitsAmbitious` | 2 |  | Assumption | Authors' judgement |
| Share of hospitals holding the certificate by the target year, planned expansion | `certPlanned` | 0.4 |  | Assumption | Authors' judgement. The national share was 42% in December 2024 (650 of 1,562 hospitals) |
| Share of hospitals holding the certificate by the target year, ambitious programme | `certAmbitious` | 0.6 |  | Assumption | Authors' judgement |
| Radiotherapy devices today | `rtDevicesBase` | 262 |  | Published estimate | 262 megavoltage devices (Becerir 2021) |
| Radiotherapy devices by the target year, planned expansion | `rtPlanned` | 332 |  | Published estimate | Lower estimate of need, 332 (Becerir 2021) |
| Radiotherapy devices by the target year, ambitious programme | `rtAmbitious` | 411 |  | Published estimate | Upper estimate of need, 411 (Becerir 2021) |
| How far planned expansion moves the response towards a prepared national plan | `responsePlanned` | 0.5 |  | Assumption | Authors' judgement |
| How far the ambitious programme moves the response towards a prepared national plan | `responseAmbitious` | 1.0 |  | Assumption | Authors' judgement |
| Rise in rehabilitation beds by the target year, planned expansion | `rehabPlanned` | 0.5 |  | Assumption | Authors' judgement |
| Rise in rehabilitation beds by the target year, ambitious programme | `rehabAmbitious` | 1.0 |  | Assumption | Authors' judgement |
