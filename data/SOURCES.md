# Data sources

## Province tables (81 provinces)

| File | Content | Year | Source |
|---|---|---|---|
| `raw/A1_beds_icu_by_province_2024.csv` | Hospitals, beds, qualified beds, ICU beds | 2024 | Ministry of Health, Health Statistics Yearbook 2024, Table 7.20, as transcribed in Kaya, E., Türkiye Sağlık İstatistikleri Arşivi, CC BY 4.0, https://saglikistatistikleri.com |
| `raw/A1_hospital_services_occupancy_by_province_2024.csv` | Inpatients, surgeries, occupancy, length of stay | 2024 | Same, Table 8.26 |
| `raw/A4_health_workforce_by_province_2024.csv` | Specialists, physicians, nurses | 2024 | Same, Table 10.12 |
| `raw/A7_accommodation_licensed_by_province_2026_08.csv` | Beds in tourism-licensed facilities | August 2026, provisional | Ministry of Culture and Tourism, reproduced by Alomaliye |
| `raw/A8_airports_passengers_2026_jan_may.csv` | International passengers by airport | January to May 2026 | DHMİ |

The Yearbook values come from a secondary transcription, and should be checked against the official Yearbook before citation. Province sums match the printed national totals.

## National anchors

| Value | Year | Source |
|---|---|---|
| Beds, ICU and occupancy by sector; 16 rehabilitation hospitals with 2,597 beds; haemodialysis devices by NUTS-1 region | 2024 | Health Statistics Yearbook 2024, Tables 7.1, 7.3, 7.5, 7.6, 8.25, via the same archive |
| 654 authorised hospitals, 189 medical centres | July 2024 | Ministry of Health list, via USTE, Verilerle Sağlık Turizmi |
| 1,398,580 health tourists, USD 3.022 billion | 2025 | USHAŞ, as reported in the press |

## Fields estimated for this study

Province-level data were not available for the items below. Each is an explicit estimate that should be replaced when official province tables can be used.

- **Health tourist share by province.** İstanbul 60%, from more than 1 million services reported for 2024; Antalya 12%, from about 160,000 to 170,000 patients in 2025; İzmir 3%, from about 38,200 patients in 2023. The remaining 25% is spread over the other receiving provinces in proportion to their authorised facilities.
- **Receiving provinces and authorised beds.** 60 provinces hold at least one authorised hospital (Yorulmaz and Aksoy 2024, by region). 44 are named in published sources and 16 are inferred. See [`../docs/course_of_years.md`](../docs/course_of_years.md). The 654 hospitals times the private sector mean of 98 beds are shared by certified share times beds in the province.
- **Rehabilitation beds and oncology places by province.** National totals allocated by specialist physicians.
- **Thermal beds.** Documented destination totals only (Afyonkarahisar, Ankara, Yalova, Denizli, Balıkesir), which is a lower bound.
- **Land border gates.** Mapped to provinces by geography. Verify against the Ministry of Trade list.

## City panels and city readiness

Files are in `raw/cities/`.

| File | Content | Coverage | Source |
|---|---|---|---|
| `province_history.csv` | Beds, occupancy, surgeries, workforce | 81 provinces; 2015, 2017 (beds only), 2019, 2021, 2023 | Ministry of Health yearbooks, as transcribed in Kaya, E., Türkiye Sağlık İstatistikleri Arşivi, CC BY 4.0. Table numbers and checks are in `README_history.md` |
| `medical_faculties_by_province.csv` | Medical faculties | 81 provinces, 2022 | Odabaşı 2023 |
| `unesco_by_province.csv` | World Heritage properties | 22 properties | UNESCO World Heritage Centre, Ministry of Culture and Tourism, press. Gordion's province was added by hand (Polatlı, Ankara) |
| `thermal_by_province.csv` | Ministry thermal tourism centres | 23 provinces, 2021, derived by counting a list | MEVKA 2021 |
| `visitors_by_province.csv` | Foreign visitors by province of entry | Top 5, 2025 | Ministry of Culture and Tourism, via Alomaliye |
| `accommodation_by_province.csv` | Guest nights | Top 5 lists and Tokat, 2019 | TUROB; Orta Karadeniz Development Agency |
| `climate_by_province.csv` | January mean temperature | 4 provinces | Turkish State Meteorological Service |
| `service_leaders.csv` | Cities named as leaders in one kind of care | Thermal care is shown in city panels. Dental and hair transplant rows stay in the raw file and are not used | See `SOURCES_attraction.md` |
| `forward_signals.csv` | Hospitals, zones and feasibility studies | 11 entries; those not opened are not shown | See `SOURCES_attraction.md` |
| `precedents.csv` | Roles of provinces in past disasters and epidemics | 86 entries, 73 provinces. Records of armed conflicts were removed | See `SOURCES_precedents.md`, which lists pages that could not be opened |

Items in `SOURCES_attraction.md` and `SOURCES_precedents.md` were read through automated fetching and need checking against the originals before citation.

## Countries

Files are in `raw/countries/`, with their sources in `SOURCES.md` in that folder. `build_countries.py` turns them into `countries.json`, the common parameters of the 178 countries that can be chosen.

## Care needs

Files are in `raw/needs/`. The table built from them, with its full reference list, is in `../docs/needs_table.md`.

| File | Content | Sources |
|---|---|---|
| `evidence_injury.csv` | Injury patterns by type of crisis, in earthquakes and conflict | `SOURCES_injury.md` |
| `los_injury.csv` | Length of stay by injury | `SOURCES_injury.md` |
| `evidence_care.csv` | Treatment cut off by a crisis: cancer, dialysis, heart, congenital and blood disease, and rehabilitation | `SOURCES_care.md` |
| `transfer_rules.csv` | When patients can be moved, by need | `SOURCES_injury.md` and `SOURCES_care.md` |
| `payers_companions.csv` | Who paid, and how many companions travelled | `SOURCES_care.md` |
| `medical_travel.csv` | Patients who travelled abroad, by origin and destination | `SOURCES_care.md` and `SOURCES_added.md` |
| `evidence_other.csv` | Rows for seven further sources, and figures added after a second reading | `SOURCES_added.md` |

The shares of each care line are taken from these files where a source exists. The section "How the shares were set" in `../docs/needs_table.md` lists which shares come from data and which are assumptions or remainders. The routine care baseline and the shares of each payer are assumptions.

## Specialised care

Files are in `raw/specialised/`. `SOURCES.md` in that folder lists the sources, reading notes and gaps.

| File | Content | Coverage |
|---|---|---|
| `burn_units.csv` | Burn centres and beds | National total only (28 centres, 48 units, 840 beds, 2025) and one named facility |
| `radiotherapy.csv` | Radiotherapy centres and devices | Seven regions, 2019, and densities for six cities |
| `rehab_hospitals.csv` | Physical medicine and rehabilitation hospitals | National counts and a few named hospitals |
| `tertiary_centres.csv` | Heart centres, congenital heart centres, stem cell transplant centres | 46 provinces for heart centres, about 2009 (year inferred). Other types national only |
| `specialists_by_branch.csv` | Specialists | All-branch totals by province. Radiation oncology national only |
| `authorised_by_province.csv` | Authorised health tourism facilities | 41 provinces. The column order in the source is inferred, see Note 1 in `raw/specialised/SOURCES.md` |
| `authorised_hospitals_by_region.csv` | Authorised hospitals and provinces with at least one, by region | December 2024, Yorulmaz and Aksoy 2024 |
| `authorised_named_extra.csv` | Provinces and hospital counts added from other sources | Çubuk 2022, Taşar and Buluk Eşitti 2024, Hasdemir 2026 |
| `../outlook/population_projection.csv` | Population and share aged 65 or over | 2023 to 2050, TÜİK, see `raw/outlook/SOURCES.md` |
| `../outlook/health_tourists.csv` | International health tourists | 2019 to 2025 |

All items in `raw/needs/` and `raw/specialised/` were read through automated fetching and need checking against the originals before citation.

## Map

Province and country boundaries come from Natural Earth (public domain), through the `world-atlas` package for countries. Boundaries are shown for orientation only.
