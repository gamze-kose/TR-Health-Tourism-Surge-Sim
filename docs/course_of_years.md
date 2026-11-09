# Cities that can receive patients, and the course of the years

This note describes two parts of the model: which Turkish cities can receive international patients, and how the state of the system changes from 2027 to 2047. The code is in `src/build_model.py` and in `yearModel` in `src/engine.js`. The numbers below are also listed in [`parameters.md`](parameters.md).

## Which cities can receive patients

Under Article 5(1) of the 2025 regulation on international health tourism, a health facility must hold an authorisation certificate to work in this field [1]. A city without an authorised hospital is therefore treated as closed to international patients.

The Ministry of Health publishes lists of authorised facilities, but they decline automated reading and were not opened. The rule below uses published sources instead.

1. Yorulmaz and Aksoy report 650 authorised hospitals in December 2024, by region, and the number of provinces with at least one in each region: 60 of 81 [2]. The printed table repeats a column heading, so the column of provinces was read from its totals.
2. In each region, provinces named in a published source come first. Işıkçelik gives 41 provinces [3], Çubuk adds Erzurum and Van [4], and Taşar and Buluk Eşitti add Çanakkale [5]. These sources can include facilities other than hospitals.
3. Any remaining places in a region go to the provinces with the most specialist physicians. These 16 provinces are inferred, not observed, and the city panels say so.

| Region | Authorised hospitals | Provinces with at least one | Named | Inferred | No authorised hospital in the model |
|---|---|---|---|---|---|
| Mediterranean | 67 | 7 of 8 | 6 | Osmaniye | Burdur |
| Central Anatolia | 110 | 8 of 13 | 7 | Aksaray | Kırşehir, Niğde, Yozgat, Karaman, Kırıkkale |
| Marmara | 261 | 10 of 11 | 9 | Kırklareli | Bilecik |
| Aegean | 101 | 8 of 8 | 6 | Kütahya, Uşak | None |
| Eastern Anatolia | 21 | 7 of 14 | 5 | Ağrı, Kars | Bingöl, Bitlis, Erzincan, Muş, Tunceli, Ardahan, Iğdır |
| Southeastern Anatolia | 36 | 6 of 9 | 5 | Adıyaman | Siirt, Şırnak, Kilis |
| Black Sea | 54 | 14 of 18 | 6 | Amasya, Bolu, Çorum, Giresun, Kastamonu, Sinop, Tokat, Karabük | Artvin, Gümüşhane, Bayburt, Bartın |

Işıkçelik left out provinces with incomplete data, so a province outside that list may still hold a certificate. The inferred set should be replaced by the Ministry's list when it can be read. Only `data/raw/specialised/authorised_*.csv` needs to change.

**Hospitals by province.** Authorised hospitals in a region are shared among its receiving provinces by the geometric mean of their hospitals and their authorised facilities of all kinds. Where a count was published it is used directly: Antalya has 32 [6] and Çanakkale has five [5]. As a check, the rule gave Antalya 34 before its published count was added, and Erzurum 3.8 against three hospitals with the certificate in December 2018 [7].

**Capacity.** The certified share of a province is its authorised hospitals divided by all its hospitals. The 64,092 authorised beds and the authorised intensive care beds are shared by certified share times the beds in the province. Dialysis, radiotherapy, rehabilitation, thermal and hotel capacity remain as before, but a province without a unit can use none of it.

**Effect on the earlier results.** The reference runs changed little, because small provinces received few patients: share admitted 96% after an earthquake (unchanged), 72% in armed conflict (was 73%), 20% with restricted exit (unchanged). Patients concentrate: 10 to 17 cities take 80% of them, and the 16 inferred provinces take 1% to 4%.

## The state of the system in a calendar year

The province tables end in 2024. For a year Y, with h = Y - 2024:

    damped years       d(h) = phi x (1 - phi^h) / (1 - phi)
    beds in province p      = beds_2024 x (1 + g_beds,p) ^ d(h)

**Trends.** g is a log-linear fit to the province values for 2015 to 2024, limited to between -1% and +4% a year, fitted separately for beds, intensive care beds and specialists. Damping follows Gardner and McKenzie [8], who showed that damped trends forecast better at long lead times. The value phi = 0.9 lies inside the usual range of 0.80 to 0.98 [9]. With this value, 23 years of growth count as about 8.2 years at the past rate. Hospital beds reach about 338,000 in 2047, or 3.6 per 1,000 people.

**Population and ageing.** The national population and the share aged 65 or over follow the main scenario of TÜİK [10, 11, 12]. The population in 2040 is interpolated. Province projections end in 2030, so every province follows the national change.

**Domestic demand.**

    D(Y) = [N(Y) / N(2024)] x [(1 - a(Y)) + r a(Y)] / [(1 - a(2024)) + r a(2024)] x (1 - l) ^ h

N is the population, a is the share aged 65 or over, r = 6 is hospital days per person at 65 or over compared with younger people, and l = 0.005 is the yearly fall in hospital days for a given age. No Turkish value of r was found. Irish data imply about 9: people aged 65 or over were one in seven of the population and used over 60% of inpatient days in 2023 [13]. Shorter stays offset part of the effect of ageing [14]. D is 1.31 in 2047 with these values.

Occupancy in year Y is the 2024 occupancy times D, divided by the growth of beds, up to 95%. Fewer free beds remain when demand grows faster than beds.

**Paying patients.** 1,398,580 in 2025, growing at 3.6% a year before damping, the rate from 2022 to 2025.

**Known additions.** A rehabilitation hospital of 705 beds opened in İstanbul on 17 May 2025 [15] and is counted in every later year.

## Development paths

| Setting | Current course | Planned expansion | Ambitious programme |
|---|---|---|---|
| New provinces with a unit each year, from 2028 | 0 | 1 | 2 |
| Certified share of hospitals in 2040, where lower today | No change | 40% | 60% |
| Radiotherapy devices in 2040, compared with 262 | Follows specialists | 332, the lower estimate of need [16] | 411, the upper estimate of need [16] |
| Rehabilitation beds in 2040 | Follows specialists | +50% | +100% |
| Response moved towards a prepared national plan by 2040 | None | Half way | All the way |

Programmes run in a straight line from 2027 to 2040. A prepared national plan means the values of the Coordinated setting in the simulator, with 100 ambulance seats per border gate a day, the upper end of that parameter's range. A value the user has set by hand is left as it is. The targets are the authors' judgement, except radiotherapy.

**New units.** Provinces without a unit open in order of mean readiness for the 17 needs (see [`city_readiness.md`](city_readiness.md)). A province must have at least 148 specialists, the number in Çankırı, the smallest province named as holding a certificate. Six provinces fall below this and never open on their own, so the model never reaches all 81. A new unit starts with one hospital and reaches full use in 3 years.

## Changing a city by hand

Before a run, the user can choose any city and change seven numbers: beds and intensive care beds in authorised hospitals, dialysis places, radiotherapy places, rehabilitation beds, thermal beds and hotel beds. A change is stored as a difference from the default value, so it carries across years. The user can also open a unit in a city without one or close one that exists. If nothing is changed, the default values are used. After a run, the page reports results with the default values and with the changes.

An added bed does not become a place for a crisis patient. Places are worked out from the same formula as the simulation: the free share of the beds, up to safe occupancy, times the share that can be activated.

## What the page reports

For the chosen crisis, the model runs six years (2027, 2031, 2035, 2039, 2043, 2047) on each path. It then removes one limit at a time in 2029, 2035 and 2043 to find the main limit of each period, and switches on one part of a programme at a time for 2047. `analysis/run_outlook.js` does the same for the reference scenarios, with Monte Carlo runs at 2027, 2037 and 2047 over all model parameters and over phi, r, l and the growth of paying patients.

## Limits

Country profiles and the size of a crisis stay fixed over the years. The crisis is not forecast. Trends, ageing effects and programme targets are stated assumptions, so the course of the years compares possibilities and does not predict them.

## References

[1] Uluslararası Sağlık Turizmi ve Turistin Sağlığı Hakkında Yönetmelik. Resmî Gazete, 26 Nisan 2025, Sayı 32882. Madde 5(1). Text: https://www.alomaliye.com/2025/04/26/uluslararasi-saglik-turizmi-ve-turistin-sagligi-hakkinda-yonetmelik/

[2] Yorulmaz, M., & Aksoy, M. R. (2024). Türkiye'de Sağlık Turizmi Açısından Yetkilendirilmiş Hastaneler ve Sağlık Turizmi Acentelerinin Bölgelere Göre Değerlendirilmesi. International Artuklu Congress on Medicine, Nursing, Midwifery, and Health Sciences, Congress Proceedings Book, 1029-1037. https://doi.org/10.30546/19023.978-9952-8541-5-2.2024.4098

[3] Işıkçelik, F. (2026). Türkiye'de Seçilmiş İllerin Sağlık Turizmi Kapasitesinin Çok Kriterli Karar Verme Yöntemleriyle Karşılaştırmalı Analizi. Üçüncü Sektör Sosyal Ekonomi Dergisi, 61(1), 62-79. https://doi.org/10.63556/tisej.2026.1710

[4] Çubuk, M. (2022). Türkiye'de Büyükşehirlerin Sağlık Turizmi Potansiyellerinin CRITIC ve WASPAS Yöntemleri ile Karşılaştırılması. Bingöl Üniversitesi İktisadi ve İdari Bilimler Fakültesi Dergisi, 6(2), 147-174. https://doi.org/10.33399/biibfad.1139104

[5] Taşar, M. T., & Buluk Eşitti, B. (2024). Sağlık Turizmi Yetki Belgesi Bulunan Sağlık Tesislerinin Web Sitelerinin İncelenmesi: Çanakkale Örneği. Turizm ve Araştırma Dergisi, 13(2), 151-179. https://doi.org/10.7460/turar.1520705

[6] Hasdemir, A. (27 September 2026). Antalya sağlık turizminde hangi alanlarda öne çıkıyor? Antalya Kent Haber. https://antalyakenthaber.com/antalya-saglik-turizminde-hangi-alanlarda-one-cikiyor-45591

[7] Çavuş, A., & Gönenbaba, İ. (2020). Erzurum'daki Hastanelerin Sağlık Turizmi Açısından Değerlendirilmesi. Atatürk Üniversitesi Sosyal Bilimler Enstitüsü Dergisi, 24(4), 1681-1693.

[8] Gardner, E. S., Jr., & McKenzie, E. (1985). Forecasting trends in time series. Management Science, 31(10), 1237-1246. https://doi.org/10.1287/mnsc.31.10.1237

[9] Hyndman, R. J., & Athanasopoulos, G. (2021). Forecasting: Principles and Practice (3rd ed.). OTexts. https://otexts.com/fpp3/holt.html

[10] TÜİK. Nüfus Projeksiyonları, 2023-2100. Bulletin 53699, 30 July 2024. Read through press reports, listed in `data/raw/outlook/SOURCES.md`.

[11] TÜİK. İstatistiklerle Yaşlılar, 2024. Read through press reports, listed in `data/raw/outlook/SOURCES.md`.

[12] TÜİK. İstatistiklerle Yaşlılar, 2025. Read through press reports, listed in `data/raw/outlook/SOURCES.md`.

[13] Brick, A., Kakoulidou, T., & Humes, H. (2025). Projections of national demand and bed capacity requirements for public acute hospitals in Ireland, 2023-2040: Based on the Hippocrates model. ESRI Research Series 213. The Economic and Social Research Institute. https://doi.org/10.26504/rs213

[14] Van den Heede, K., Bouckaert, N., & Van de Voorde, C. (2019). The impact of an ageing population on the required hospital capacity: results from forecast analysis on administrative data. European Geriatric Medicine, 10, 697-705. https://doi.org/10.1007/s41999-019-00219-8

[15] Avrupa'nın en büyük fizik tedavi hastanesi açıldı. TRT Haber, 17 May 2025. https://www.trthaber.com/haber/gundem/avrupanin-en-buyuk-fizik-tedavi-hastanesi-acildi-907553.html

[16] Becerir, H. B., Gürdallı, S., Yapıcı, B., Alkaya, F., Çakır, A., Yaray, K., & Gürsoy, T. O. (2021). Radiotherapy Equipment and Workforce in Turkey. Turkish Journal of Oncology, 36(4), 512-518. https://doi.org/10.5505/tjo.2021.2896
