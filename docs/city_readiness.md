# City readiness

Each of the 81 cities is rated for each care need. A rating combines specialised care, general capacity, lodging, transport links and existing health tourism. It is relative to the best city for that need. The method is TOPSIS: for each need, weighted values v = w x are compared with the best and worst value on each indicator, and the score is C = D- / (D+ + D-), rescaled so that the best city has 1.

## Indicators

| Indicator | Source and coverage |
|---|---|
| Specialist physicians, qualified beds, intensive care beds, nurses | Ministry of Health Yearbook 2024, 81 provinces |
| Surgical operations, dentists | Yearbook 2023, 81 provinces |
| Spare bed capacity | Derived from estimated authorised beds and occupancy |
| Medical faculties | Odabaşı 2023, data for 2022, 81 provinces |
| Dialysis capacity | Yearbook 2024, regional devices per million |
| Radiotherapy devices | Becerir 2021: regional counts for 2019 and densities for six cities, shared out within regions by specialists. An estimate |
| Heart surgery centres | Kervan 2011, 46 provinces, about 2009 |
| Licensed hotel beds | Ministry of Culture and Tourism, August 2026, 81 provinces |
| Thermal resources | Press anchors for 5 provinces and the Ministry list for 23 provinces. No entry does not mean no springs |
| Warm sea coast | Geography: warm coast 1, north Aegean 0.6, Marmara 0.3, Black Sea 0.2 |
| International air passengers | DHMİ, January to May 2026 |
| Closeness to neighbouring countries | Computed from travel time |
| Health tourists today | Estimate, see `data/SOURCES.md` |
| Authorised health tourism facilities | Işıkçelik 2026, 41 provinces. The column order in the source is inferred, see `data/raw/specialised/SOURCES.md`. Which provinces can receive patients is set separately, see `docs/course_of_years.md` |

No province list of burn units, rehabilitation hospitals, prosthetic workshops, paediatric centres or specialists by branch was found. Those needs are rated from general indicators.

## Weights

- **Major limb injury and reconstruction.** surgical operations 25%, specialist physicians 20%, qualified beds 15%, spare bed capacity 10%, international air passengers 10%, closeness to neighbouring countries 10%, authorised health tourism facilities 10%.
- **Amputation and prosthetic limb.** specialist physicians 15%, qualified beds 15%, spare bed capacity 15%, closeness to neighbouring countries 15%, nurses per 1,000 residents 10%, licensed hotel beds 10%, international air passengers 10%, authorised health tourism facilities 10%.
- **Spinal cord injury.** nurses per 1,000 residents 15%, qualified beds 15%, specialist physicians 15%, spare bed capacity 10%, licensed hotel beds 10%, international air passengers 10%, closeness to neighbouring countries 10%, authorised health tourism facilities 10%, thermal resources 5%.
- **Traumatic brain injury.** intensive care beds 20%, medical faculties 20%, specialist physicians 15%, closeness to neighbouring countries 15%, qualified beds 10%, international air passengers 10%, authorised health tourism facilities 10%.
- **Major burns.** intensive care beds 25%, surgical operations 15%, specialist physicians 15%, medical faculties 15%, international air passengers 10%, closeness to neighbouring countries 10%, authorised health tourism facilities 10%.
- **Crush injury with kidney failure.** dialysis capacity 40%, intensive care beds 30%, specialist physicians 10%, closeness to neighbouring countries 10%, international air passengers 10%.
- **Face and jaw injury.** specialist physicians 20%, surgical operations 15%, medical faculties 15%, dentists 15%, authorised health tourism facilities 15%, international air passengers 10%, closeness to neighbouring countries 10%.
- **Eye injury and eye disease.** specialist physicians 20%, authorised health tourism facilities 20%, international air passengers 15%, health tourists today 15%, surgical operations 10%, medical faculties 10%, closeness to neighbouring countries 10%.
- **Chest, abdomen and pelvis injury.** specialist physicians 25%, surgical operations 20%, intensive care beds 20%, qualified beds 15%, international air passengers 10%, closeness to neighbouring countries 10%.
- **Critical illness in an epidemic.** intensive care beds 50%, nurses per 1,000 residents 15%, medical faculties 10%, specialist physicians 10%, closeness to neighbouring countries 10%, international air passengers 5%.
- **Nursing and recovery after hospital.** licensed hotel beds 30%, thermal resources 25%, closeness to neighbouring countries 15%, warm sea coast 10%, nurses per 1,000 residents 10%, international air passengers 10%.
- **Cancer treatment.** radiotherapy devices 35%, specialist physicians 15%, medical faculties 15%, authorised health tourism facilities 15%, qualified beds 10%, international air passengers 10%.
- **Long-term dialysis.** dialysis capacity 50%, licensed hotel beds 15%, closeness to neighbouring countries 15%, international air passengers 10%, warm sea coast 10%.
- **Heart disease.** heart surgery centres 35%, intensive care beds 20%, specialist physicians 15%, international air passengers 10%, closeness to neighbouring countries 10%, medical faculties 5%, authorised health tourism facilities 5%.
- **Children with congenital disease.** medical faculties 30%, intensive care beds 20%, specialist physicians 20%, international air passengers 10%, closeness to neighbouring countries 10%, authorised health tourism facilities 10%.
- **Blood disease.** medical faculties 30%, specialist physicians 25%, qualified beds 15%, international air passengers 10%, closeness to neighbouring countries 10%, authorised health tourism facilities 10%.
- **Ordinary treatment no longer available at home.** authorised health tourism facilities 25%, health tourists today 20%, specialist physicians 10%, dentists 10%, surgical operations 10%, licensed hotel beds 10%, international air passengers 10%, closeness to neighbouring countries 5%.

## Ratings and stars

A rating of one, two or three stars has gain g of 0.25, 0.60 or 1. The care places added on line l in city i at horizon H (years) are

    sum over needs of  g x (1 - r + r x C) x (1 - exp(-H / 3)) x conversion(need, l) x reference(l)

with r = 0.7 by default. One reference centre adds 24 intensive care beds, 200 surgical beds, 150 dialysis patients, 500 cancer patients, 150 rehabilitation beds or 300 step-down places. These constants are assumptions and can be changed in the interface. A city with stars becomes visible to national dispatchers.

Capacity without stars grows by the city's qualified bed growth between 2015 and 2023, bounded to between -1% and 6% a year. Hotel beds grow by 2% a year.

## Limits

- The indicators measure capacity and access, not clinical quality or accreditation.
- Several indicators are dated or estimated, as listed above.
- The record of past crises is shown to help readers judge the results. It is not used to allocate patients.

Full references for the indicators are in `../data/SOURCES.md` and in the `SOURCES` files under `../data/raw/`.
