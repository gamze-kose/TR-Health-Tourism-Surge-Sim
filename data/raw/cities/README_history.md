# Province history, 2015 to 2023

Source: Kaya, E., Türkiye Sağlık İstatistikleri Arşivi, CC BY 4.0, https://saglikistatistikleri.com, which transcribes the Ministry of Health yearbooks (Sağlık İstatistikleri Yıllığı). See A_sources.md for the DOI note. Rows were transcribed through WebFetch on 9 November 2026. The archive advises checking a value against the yearbook page before publication.

`province_history.csv` is in long format with 405 rows (81 provinces, 5 years). 2024 is not in this file. It already exists in `../A_provinces_raw/` (files A1_* and A4_*), where `beds_total`, `bed_occupancy_rate_pct`, `avg_length_of_stay_days`, `specialist_physicians`, `physicians_total` and `dentists_total` correspond to `beds`, `occupancy_pct`, `avg_stay_days`, `specialists`, `physicians` and `dentists` here.

## Coverage by year (provinces filled out of 81)

| Year | hospitals, beds, qualified_beds, icu_beds | occupancy_pct, avg_stay_days, inpatients, surgeries | specialists, physicians, dentists, nurses |
|---|---|---|---|
| 2023 | 81 | 81 | 81 |
| 2021 | 81 | 81 | 81 |
| 2019 | 81 | 81 | 81 |
| 2017 | 81 | blank | blank |
| 2015 | 81 | 81 | 81 |

## Tables

"Sums matched" means that the 81 province values add up exactly to the printed Türkiye row in every additive column of the table: hospitals, beds, qualified beds, ICU beds and family medicine units for the bed tables; inpatients, inpatient days and surgeries for the service tables; specialists, general practitioners, residents, physicians, dentists, pharmacists, nurses, midwives and other staff for the workforce tables.

| Year | Content | Table | URL | Coverage | Sums matched |
|---|---|---|---|---|---|
| 2023 | Beds | 7.19 | https://saglikistatistikleri.com/tablo.php?yil=2023&no=7.19 | 81 provinces and Türkiye | Yes |
| 2023 | Services | 8.25 | https://saglikistatistikleri.com/tablo.php?yil=2023&no=8.25 | 81 provinces and Türkiye | Yes |
| 2023 | Workforce | 10.13 | https://saglikistatistikleri.com/tablo.php?yil=2023&no=10.13 | 81 provinces and Türkiye | Yes |
| 2021 | Beds | 7.19 | https://saglikistatistikleri.com/tablo.php?yil=2021&no=7.19 | 81 provinces and Türkiye | Yes |
| 2021 | Services | 8.25 | https://saglikistatistikleri.com/tablo.php?yil=2021&no=8.25 | 81 provinces and Türkiye | Yes |
| 2021 | Workforce | 10.11 | https://saglikistatistikleri.com/tablo.php?yil=2021&no=10.11 | 81 provinces and Türkiye | Yes |
| 2019 | Beds | 7.19 | https://saglikistatistikleri.com/tablo.php?yil=2019&no=7.19 | 81 provinces and Türkiye | Yes |
| 2019 | Services | 8.27 | https://saglikistatistikleri.com/tablo.php?yil=2019&no=8.27 | 81 provinces and Türkiye | Yes |
| 2019 | Workforce | 10.10 | https://saglikistatistikleri.com/tablo.php?yil=2019&no=10.10 | 81 provinces and Türkiye | Yes |
| 2017 | Beds | 7.18 | https://saglikistatistikleri.com/tablo.php?yil=2017&no=7.18 | 81 provinces and Türkiye | Yes |
| 2017 | Services | 8.25 | https://saglikistatistikleri.com/tablo.php?yil=2017&no=8.25 | Not used: part with inpatients is damaged on the page | Not checkable |
| 2017 | Workforce | 10.8 | https://saglikistatistikleri.com/tablo.php?yil=2017&no=10.8 | Not used: 78 of 81 rows, with damaged names and digits | Not checkable |
| 2015 | Beds | 7.18 | https://saglikistatistikleri.com/tablo.php?yil=2015&no=7.18 | 81 provinces and Türkiye | Yes |
| 2015 | Services | 8.26 | https://saglikistatistikleri.com/tablo.php?yil=2015&no=8.26 | 81 provinces and Türkiye | Yes |
| 2015 | Workforce | 9.8 | https://saglikistatistikleri.com/tablo.php?yil=2015&no=9.8 | 81 provinces and Türkiye | Yes |

Yearly index pages used to find the table numbers: https://saglikistatistikleri.com/yillik.php?yil=YYYY for each year above.

## Further checks

For every province and every year with workforce data, specialists plus general practitioners plus residents equal total physicians. These checks cover the rate columns, which the sum check does not reach: average stay agrees with inpatient days divided by inpatients within 0.1 day in 2023, 2021, 2019 and 2015, and occupancy agrees with inpatient days divided by (beds x 365) within 3 percentage points in the same years, so the low value printed for Hatay in 2023 (22.4) is not a transcription slip. The province names match the 2024 files exactly, and Hakkari is spelled as the source prints it.

## Gaps and notes

The 2017 services and workforce columns are left blank. On the 2017 table 8.25 page the part with inpatients has scrambled headers and misaligned or missing values, and the page itself notes that some column totals differ from the yearbook total row. On the 2017 table 10.8 page Kayseri, Kırklareli and Kırşehir are absent, several province names are cut off, and digits are lost (for example, Manisa general practitioners appear as 83 where the row total implies a larger number), so a digit that looks intact cannot be trusted. Filling these cells needs the yearbook itself: 2017 PDF pp. 223-224 for services and pp. 268-269 for workforce. The archive's PDF viewer (pdf.php) renders by script and returned no table text through WebFetch; no other route was tried.

The 2019 table 10.10 was requested in three blocks because WebFetch would not return all rows in one answer; the blocks were joined and passed the sum check. In the 2017 and 2015 tables 7.18, the page holds two parts that were merged by row order.

## Files

`raw/bundle_*.tables` and `raw/2023_*.txt`, `raw/2021_*.txt` hold the transcriptions as saved, with `#` metadata lines. `tools/build_history.py` splits the bundles into one `raw/YYYY_table.txt` per table, runs the sum checks, and writes `province_history.csv` and `tools/checks.json`.
