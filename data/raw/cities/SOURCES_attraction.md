# F_attraction: sources and access notes

Retrieved 9 November 2026. All values were read through WebFetch (a small model reading the page) and were not checked against page images. Province names match the A_provinces_raw files (81 names, "Hakkari" as printed there). All CSV province names were validated against A1_beds_icu_by_province_2024.csv.

Values come from pages opened, except rows marked "not opened" or "headline", which rest on a search result title or URL slug only.

## 1. Status by file

| File | Status | What it covers |
|---|---|---|
| visitors_by_province.csv | PARTIAL | Top 5 provinces, 2025 only. 2019 not found. |
| accommodation_by_province.csv | PARTIAL | Foreign and domestic nights, 2019, for the top-5 lists plus Tokat. No province arrivals or occupancy. Nothing for 2024 or 2025. |
| thermal_by_province.csv | PARTIAL | Ministry thermal tourism centres, 23 provinces plus 2 single-source notes. No beds or springs by province. |
| unesco_by_province.csv | COMPLETE except one field | 22 properties. Gordion province blank. |
| climate_by_province.csv | PARTIAL | 4 provinces. |
| medical_faculties_by_province.csv | COMPLETE for faculties | 81 provinces, data year 2022. University hospitals by province not found. |
| service_leaders.csv | PARTIAL | 3 of 14 services. |
| specialty_distribution.csv | WEAK | One clinician estimate. No official distribution found. |
| forward_signals.csv | PARTIAL | 11 signals, several weak. |

## 2. Caveats to read before using the data

**Visitors are by province of entry, not destination.** The page ranks "sınır kapılarının bağlı olduğu iller" (provinces of the border gates), so a visitor is counted where they entered, not where they stayed. İstanbul (airports) and Edirne (land gates) may therefore overstate attraction; this is an interpretation, not stated by the source. The five rows sum to 44,614,877, which is 84.5% of the 2025 national total of 52,775,055 foreign visitors [ALO_SINIR_2025]. Printed shares: İstanbul 35.95, Antalya 30.33, Edirne 8.55, Muğla 6.62, İzmir 3.08 (%).

**Accommodation.** TUROB2019 publishes top-5 lists only, so Ankara has no foreign nights and Aydın no domestic nights in the CSV. Aydın's domestic nights can be derived from the combined table: 6,091,653 minus 3,715,650 = 2,376,003 (derived; not entered). National 2019 totals: domestic 78,478,855, foreign 132,808,208, combined 211,287,063 nights. Certificate coverage of the province lists is not stated; the page's totals cover Ministry and municipal certified facilities. Each foreign plus domestic pair for Antalya, İstanbul, Muğla and İzmir equals the printed combined figure. The Tokat row takes 6,472 foreign and 487,560 domestic nights from a 2015 to 2019 table citing TÜİK; its 494,032 total equals Tablo 9 plus Tablo 10 for 2019 (355,803 + 138,229), so the row was read as 2019.

**Thermal counts are derived.** MEVKA2021 Table 6 has no numeric column. The counts are the number of centre names listed for each province; they sum to the report's stated 51 centres. The table prints "Elazığ-Tunceli" for Golan, recorded under Elazığ. It prints "Aksaray Narlıgöl Ilısu" under Niğde, kept as printed. Section 2.3 names Ilgın (Konya) as a Ministry-declared centre, but Table 6 omits Konya, so it is a separate measure. Tokat's 3 is a different measure: thermal centres named in the OKA2020 text. A province with no row has no figure in these sources; it does not mean zero.

National thermal figures (not in the CSV): 2020 kaplıca facilities by certificate, 90 facilities and 30,423 beds (operation), 18 and 9,397 (investment), 90 and 18,696 (municipal), total 198 and 58,516 [OKA2020, p. 24, citing yigm.ktb.gov.tr]. 2021 thermal accommodation, 94 operation-certified and 20 investment-certified facilities, 31,530 and 7,760 beds [MEVKA2021, Table 7]. Regional share of kaplıca businesses, year not stated: Aegean 33.5, Central Anatolia 28, Marmara 20, East and Southeast Anatolia 10, Mediterranean 4.5, Black Sea 3.5 (%) [OKA2020, p. 20]. Thermal resources: over 1,000 in one passage, about 1,300 to 1,500 in others, attributed to MTA [OKA2020, pp. 19-21]. Only the first 100,000 of 160,399 characters of OKA2020 were read.

**UNESCO.** Multi-province properties have one row per province. Property names and years are from WHC_LIST, except the two 2014 properties, whose heading came back empty in that extraction; those use the Ministry's Turkish names and years [KTB_DOSIM]. The WHC list's 20 plus these 2 equal the 22 stated by WHC_TR and DS2025. Provinces are from KTB_DOSIM (19 properties, an older snapshot), DS2023 for the wooden mosques and DS2025 for Sardis. The Göreme property is recorded under Nevşehir, as the Ministry page states. **Gordion's province was not stated in any page opened and is left blank; it needs one lookup.**

**Climate.** Values are long-term "Ortalama Sıcaklık" for January from each province's official statistics page. Periods differ: Ankara 1927-2025, Antalya 1930-2025, İzmir 1938-2025, Mersin (page label ICEL) 1929-2025. The same pages link to "İllere Ait Mevsim Normalleri (1991-2020)", which was not opened. Each further province is one fetch using the page's `?m=PROVINCE` parameter (ANTALYA, IZMIR and ICEL all worked).

**Medical faculties.** Table 3, "İllere göre tıp fakülteleri dağılımı ve kuruluş yılları (2022 yılı)". Count = public plus foundation; national check 86 + 32 = 118 across 61 provinces. Foundation faculties: İstanbul 21 (public 6), Ankara 7 (5), İzmir 2 (6), Gaziantep 1 (2), Konya 1 (2). Printed "Urfa" recorded as Şanlıurfa. The table lists 20 provinces as having none, recorded as 0. Whether every listed faculty was admitting students in 2022 was not checked. Data are 2022, and new faculties may have opened since. University hospitals by province were not found.

**Service leaders.** İstanbul's hair transplant claim is from the head of a health tourism association who also runs a clinic, not independent evidence. Thermal rows for Kütahya, Balıkesir and Yozgat are counts of listed centres, which show the most designated centres rather than the most visitors. No province evidence was found for: eye surgery, plastic and aesthetic surgery, bariatric surgery, IVF, orthopaedics, cardiac surgery, oncology, physical rehabilitation, wellness and spa, dialysis tourism, accessible and senior tourism.

**Specialty distribution.** No official national distribution found (USHAŞ, Ministry reports not located). The single row is a clinician's estimate quoted in trade press: aesthetic procedures about 40% of 360,000 to 400,000 patients a year (Demirel, in PARA2024). That patient base does not match national totals in the A and C files, so treat it as anecdotal. The same article says hair transplant is the largest area, without a percentage.

**Forward signals.** No Antalya health valley project was confirmed. Bursa is the only health free zone found; the page is undated and refers to 2023 targets, so it may be old, and no outcome is reported. Pre-feasibility reports show regional interest, not committed investment. Amasya, Karabük and Diyarbakır rows, and the American Hospital row, rest on search result titles or URL slugs; their years come from URL slugs.

## 3. Sources

| source_id | Citation | URL | Access notes |
|---|---|---|---|
| KTB_ALO_2025 | T.C. Kültür ve Turizm Bakanlığı (credited source), reproduced on Alomaliye.com. "2025 Yılında Ülkemize Gelen Yerli/Yabancı ziyaretçi İstatistikleri". 30 January 2026. | https://www.alomaliye.com/2026/01/30/2025-yilinda-ulkemize-gelen-yerli-yabanci-ziyaretci-istatistikleri/ | Opened. Top 5 provinces only, no 2019. A private portal reproducing Ministry figures. |
| ALO_SINIR_2025 | T.C. Kültür ve Turizm Bakanlığı (credited), reproduced on Alomaliye.com. "Sınır İstatistikleri, Giriş-Çıkış Yapan Ziyaretçiler – 2025". 6 March 2026. | https://www.alomaliye.com/2026/03/06/sinir-istatistikleri-giris-cikis-yapan-ziyaretciler-2025/ | Opened. Monthly and nationality tables; no province table visible. Links an xlsx on alomaliye.com, not read. |
| TUROB2019 | "2019 Yılı Konaklama İstatistikleri Yıllık Bülten Özeti". Hosted by TUROB. Table "İllere Göre Geceleme İstatistikleri (2019)". Author and publisher line not shown. | https://www.turob.com/assets/Istatistikler-Dosyalari-image/tr-2020/2019Konaklamaistatistikleriozet.pdf | Opened. Top 5 lists only. |
| OKA2020 | Orta Karadeniz Kalkınma Ajansı, coordinated by the Ministry of Industry and Technology. "Tokat İli Sağlık Turizmi Sektörü Termal Sağlık Kompleksi Ön Fizibilite Raporu". Year not printed in the text read; 2020 from URL. | https://www.yatirimadestek.gov.tr/pdf/assets/upload/fizibiliteler/tokat-ili-saglik-turizmi-sektoru-termal-saglik-kompleksi-on-fizibilite-raporu-2020.pdf | Opened; first 100,000 characters of 160,399 read. Verify the year before citing. |
| MEVKA2021 | Mevlana Kalkınma Ajansı, coordinated by the Ministry of Industry and Technology. "Konya İli 4 Yıldızlı Termal Otel Ön Fizibilite Raporu". Konya, June 2021. Table 6 (pp. 14-15) and Table 7 (p. 15) credit Kültür ve Turizm Bakanlığı, 2021. | https://www.yatirimadestek.gov.tr/pdf/assets/upload/fizibiliteler/konya-ili-4-yildizli-termal-otel-on-fzibilite-raporu2021.pdf | Opened. |
| WHC_LIST | UNESCO World Heritage Centre. World Heritage List, search "turkiye", ordered by year. | https://whc.unesco.org/en/list/search=turkiye&order=year | Opened. Names and years only; 2014 heading empty in extraction. |
| WHC_TR | UNESCO World Heritage Centre. "Türkiye" (State Party page). | https://whc.unesco.org/en/statesparties/tr | Opened. States 22 inscribed; the list itself not extracted. |
| KTB_DOSIM | T.C. Kültür ve Turizm Bakanlığı (dosim.ktb.gov.tr). "UNESCO Dünya Miras Listesinde Türkiye". No update date. | https://dosim.ktb.gov.tr/TR-218145/unesco-dunya-miras-listesinde-turkiye.html | Opened. 19 properties, older than the WHC list. Source of provinces. |
| DS2023 | Daily Sabah with AA. "UNESCO adds Anatolia's wooden hypostyle mosques to World Heritage list". Daily Sabah, 20 September 2023. Edited by Buse Keskin. | https://www.dailysabah.com/arts/unesco-adds-anatolias-wooden-hypostyle-mosques-to-world-heritage-list/news | Opened. Mosques and provinces; Gordion mentioned without a province. |
| DS2025 | Anadolu Agency. "Türkiye's ancient Lydian sites added to UNESCO world heritage list". Daily Sabah, 15 July 2025. Edited by Ayşe Sena Aykın. | https://www.dailysabah.com/arts/turkiyes-ancient-lydian-sites-added-to-unesco-world-heritage-list/news/amp | Opened. Manisa; total reached 22. |
| MGM_ANKARA | Meteoroloji Genel Müdürlüğü. "Resmi İklim İstatistikleri", Ankara, period 1927-2025. | https://www.mgm.gov.tr/veridegerlendirme/Il-ve-Ilceler-Istatistik.aspx?k=A | Opened. |
| MGM_ANTALYA | Meteoroloji Genel Müdürlüğü. "Resmi İklim İstatistikleri", Antalya, period 1930-2025. | https://www.mgm.gov.tr/veridegerlendirme/il-ve-ilceler-istatistik.aspx?m=ANTALYA | Opened. |
| MGM_IZMIR | Meteoroloji Genel Müdürlüğü. "Resmi İklim İstatistikleri", İzmir, period 1938-2025. | https://www.mgm.gov.tr/veridegerlendirme/il-ve-ilceler-istatistik.aspx?m=IZMIR | Opened. |
| MGM_ICEL | Meteoroloji Genel Müdürlüğü. "Resmi İklim İstatistikleri", İçel (Mersin), period 1929-2025. | https://www.mgm.gov.tr/veridegerlendirme/il-ve-ilceler-istatistik.aspx?m=ICEL | Opened. |
| ODABASI2023 | Orhan Odabaşı. "Türkiye Tıp Fakülteleri 2023" (Medical Schools in Turkey 2023). 2023, vol. 32, issue 1, pp. 37-61. doi:10.17942/sted.1259646. | https://dergipark.org.tr/tr/download/article-file/2987453 | Opened. Journal name not visible in the extraction; the DOI and dergipark path indicate STED. Confirm the journal's full name before citing. Article credits YÖK and ÖSYM data. |
| HURRIYET2022 | "Saç ekiminin başkenti İstanbul oldu". Hürriyet, Ekonomi Servisi, 11 May 2022. | https://www.hurriyet.com.tr/ekonomi/sac-ekiminin-baskenti-istanbul-oldu-42059972 | Opened. Interview-based claim. |
| PARA2024 | Merve Yılmaz Gergin (Para Araştırma). "Sağlık turizmi üssü Türkiye". Para Dergi, 2 March 2024 (updated 4 March 2024). | https://www.paradergi.com.tr/sektorler/2024/03/04/saglik-turizmi-ussu-turkiye | Opened. |
| HURRIYET_AFYON | Hürriyet Seyahat article, URL slug "termal-turizmin-baskenti-afyonkarahisar". Title, author and date not verified. | https://www.hurriyet.com.tr/seyahat/termal-turizmin-baskenti-afyonkarahisar-41075561 | Not opened; search result only. |
| SYGM2024 | T.C. Sağlık Bakanlığı, Sağlık Yatırımları Genel Müdürlüğü. Report on the opening of Antalya City Hospital. 18 March 2024. Title as in URL slug. | https://sygm.saglik.gov.tr/TR-102746/antalyaya-saglikta-dev-yatirim-1500-yatak-kapasiteli-sehir-hastanesi-hizmete-acildi.html | Opened. |
| BTSO_ND | Bursa Ticaret ve Sanayi Odası (BTSO). "BTSO'dan Bursa Sağlık Serbest Bölgesi İçin Önemli Bir Adım". Undated. | https://www.btso.org.tr/en/guncel/haberler-ve-duyurular/haber-duyuru-detay/362 | Opened. Undated; refers to 2023 targets. |
| EKONOMI_ANT | Ekonomi Gazetesi. American Hospital Antalya investment; USD 100 million in the URL slug and headline. Byline shown as Fikri Cinokur. Date not checked. | https://www.ekonomigazetesi.com/sirket-haberleri/amerikan-hastanesinden-antalyaya-100-milyon-dolarlik-saglik-yatirimi-84115 | Not opened; search result only. |
| YD_AMASYA | Pre-feasibility report, Amasya thermal tourism complex (title from URL slug). yatirimadestek.gov.tr. | https://www.yatirimadestek.gov.tr/pdf/assets/upload/fizibiliteler/amasya-ili-termal-turizm-kompleksi-on-fizibilite-raporu2021.pdf | Not opened; search result only. |
| YD_KARABUK | Pre-feasibility report, Karabük Akkaya thermal hotel (title from URL slug). yatirimadestek.gov.tr. | https://www.yatirimadestek.gov.tr/pdf/assets/upload/fizibiliteler/karabuk-ili-akkaya-termal-otel-on-fizibilite-raporu-2020.pdf | Not opened; search result only. |
| YD_DIYARBAKIR | Pre-feasibility report, Diyarbakır thermal facility with spa and congress centre (title from search result). yatirimadestek.gov.tr. | https://www.yatirimadestek.gov.tr/pdf/assets/upload/fizibiliteler/diyarbakir-ili-termal-tesis-konsepti-ile-spa-ve-kongre-merkezi-yatirimi-on-fizibilite-raporu--2021.pdf | Not opened; search result only. |

Citations are as seen through WebFetch. Check any item that enters a reference list against the original, in particular OKA2020 (year), ODABASI2023 (journal name), TUROB2019 (publisher) and all "not opened" items.

## 4. Pages that could not be read (none worked around)

| Page | Result |
|---|---|
| https://www.unesco.org.tr/Pages/125/122/UNESCO-D%C3%BCnya-Miras%C4%B1-Listesi | `robots_disallowed`. Not worked around; other sources used. |
| https://istanbul.ktb.gov.tr/Eklenti/144393,aralik-2025-t-rizm-istatistik-rapor-pdf.pdf | Redirects to a signed s3.ktb.gov.tr URL longer than the WebFetch proxy accepts (HTTP 403, URL length). Not worked around. The other monthly reports of this directorate appear to use the same host. |
| https://www.turob.com/assets/Istatistikler-Dosyalari-image/2025/IST_08_2025.doc | Binary; WebFetch returned no text. |
| https://goturkiye.com/branding/press-releases/wooden-hypostyle-mosques-in-anatolia-also-make-it-to-unesco-world-heritage-sites-list | Headline only. |

**Most useful manual step:** open the İstanbul directorate's December 2025 and December 2024 reports (for example the URL in the table above) or the Ministry's border and accommodation bulletins in a browser. It was not possible to confirm whether they carry the full province tables for items 1 and 2.

## 5. Consulted, no usable province data

- https://www.ktb.gov.tr/EN-120287/turkiye-on-the-world-heritage-list.html: 10 properties only, superseded.
- https://ttb.org.tr/kutuphane/14mart_tipegitimi.pdf: 2015; national count only (86 medical faculties, 76 teaching).

## 6. Leads seen in search results, not opened

- Antalya and İstanbul visitors 2024: https://hurriyetdailynews.com/antalya-welcomes-record-17-3-million-visitors-in-2024-204348 and https://hurriyetdailynews.com/istanbul-welcomed-more-than-18-million-visitors-last-year-205331. Definitions not checked, so not entered.
- Health free zones: https://www.medikalakademi.com.tr/saglik-serbest-bolgesi-turizm-teknoloji-dursun-aydin/
- Bursa and Kütahya health investments: https://sygm.saglik.gov.tr/TR-102602/bursa-ve-kutahyada-saglik-yatirimlarina-inceleme-ziyareti.html
- Kütahya thermal projects: https://www.mynet.com/kutahyada-termal-hamle-180100631219 and https://www.mynet.com/kugiadtan-termal-sehir-projesine-tam-destek-180104232350
- Service leaders: https://pixelplus.tursab.org.tr/apps//OldFiles/dosya/11430/saglikturizmiraporu_11430_3837043.docx (TÜRSAB) and https://acikerisim.alanya.edu.tr/items/ef577050-3b31-4416-ad50-987900629757 (Antalya compared with İstanbul, Ankara, İzmir).
- Thermal: https://dergipark.org.tr/en/download/article-file/2682786 and https://dergipark.org.tr/en/download/article-file/1746102
- Medical education, recent: https://www.birgun.net/makale/tip-fakultelerinde-durum-2026-726612
