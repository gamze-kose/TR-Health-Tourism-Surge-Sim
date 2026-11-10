#!/usr/bin/env python3
"""Writes data/references.json, the numbered reference list shown in the simulator and the READMEs.

Every entry was checked in November 2026 against the publisher, the issuing body or another
authoritative record. Fields that could not be confirmed are left out of the citation.
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

GROUPS = [
    ("methods", [
        ("GARDNER_1985", "Gardner ES Jr, McKenzie E. Forecasting Trends in Time Series. Management Science. 1985;31(10):1237-1246.", "10.1287/mnsc.31.10.1237", None),
        ("HERMAN_2017", "Herman J, Usher W. SALib: An open-source Python library for Sensitivity Analysis. Journal of Open Source Software. 2017;2(9):97.", "10.21105/joss.00097", None),
        ("HWANG_1981", "Hwang CL, Yoon K. Multiple Attribute Decision Making: Methods and Applications. A State-of-the-Art Survey. Lecture Notes in Economics and Mathematical Systems, vol. 186. Berlin, Heidelberg: Springer; 1981.", "10.1007/978-3-642-48318-9", None),
        ("HYNDMAN_2021", "Hyndman RJ, Athanasopoulos G. Forecasting: Principles and Practice. 3rd edition. Melbourne: OTexts; 2021.", None, "https://otexts.com/fpp3/"),
        ("SALTELLI_2002", "Saltelli A. Making best use of model evaluations to compute sensitivity indices. Computer Physics Communications. 2002;145(2):280-297.", "10.1016/S0010-4655(02)00280-1", None),
        ("SOBOL_2001", "Sobol′ IM. Global sensitivity indices for nonlinear mathematical models and their Monte Carlo estimates. Mathematics and Computers in Simulation. 2001;55(1-3):271-280.", "10.1016/S0378-4754(00)00270-6", None),
    ]),
    ("turkey", [
        ("ASLAN_2026", "Aslan K. Fizyoterapi Hizmetlerinde Yönetim ve İşleyiş: Kamu Hastanelerine Teorik Bir Bakış. Sağlık Hizmetleri Araştırma Dergisi. 2026;4:5-14.", None, "https://dergipark.org.tr/tr/pub/hes/article/1715503"),
        ("BECERIR_2021", "Becerir HB, Gürdallı S, Yapıcı B, Alkaya F, Çakır A, Yaray K, Gürsoy TO. Radiotherapy Equipment and Workforce in Turkey. Turkish Journal of Oncology. 2021;36(4):512-518.", "10.5505/tjo.2021.2896", None),
        ("CAVUS_2020", "Çavuş A, Gönenbaba İ. Erzurum'daki Hastanelerin Sağlık Turizmi Açısından Değerlendirilmesi. Atatürk Üniversitesi Sosyal Bilimler Enstitüsü Dergisi. 2020;24(4):1681-1693.", None, "https://dergipark.org.tr/tr/pub/ataunisosbil/issue/59389/654143"),
        ("CUBUK_2022", "Çubuk M. Türkiye'de Büyükşehirlerin Sağlık Turizmi Potansiyellerinin CRITIC ve WASPAS Yöntemleri ile Karşılaştırılması. Bingöl Üniversitesi İktisadi ve İdari Bilimler Fakültesi Dergisi. 2022;6(2):147-174.", "10.33399/biibfad.1139104", None),
        ("ISIKCELIK_2026", "Işıkçelik F. Türkiye'de Seçilmiş İllerin Sağlık Turizmi Kapasitesinin Çok Kriterli Karar Verme Yöntemleriyle Karşılaştırmalı Analizi. Üçüncü Sektör Sosyal Ekonomi Dergisi. 2026;61(1):62-79.", "10.63556/tisej.2026.1710", None),
        ("KAYA_ARCHIVE", "Kaya E. Türkiye Sağlık İstatistikleri Arşivi: Sağlık Bakanlığı yıllıklarından derlenmiş il ve ulusal veri seti, 1964–2024. Version 1.1.0 [dataset]. Zenodo; 2026.", "10.5281/zenodo.23325100", None),
        ("KERVAN_2011", "Kervan Ü, Koç O, Özatik MA, Bayraktar G, Şener E, Çağlı K, Yekeler İ, Paç M. Türkiye'deki kalp damar cerrahisi kliniklerinin dağılımı ve hizmetlerinin niteliği. Türk Göğüs Kalp Damar Cerrahisi Dergisi. 2011;19(4):483-489.", "10.5606/tgkdc.dergisi.2011.074", None),
        ("ODABASI_2023", "Odabaşı O. Türkiye Tıp Fakülteleri 2023. Sürekli Tıp Eğitimi Dergisi. 2023;32(1):37-61.", "10.17942/sted.1259646", None),
        ("OZGOBEK_2026", "Özgöbek HR. Türkiye'de Fizyoterapist Sayısı Yeterli mi? Mevcut Durum, Gereksinimler ve Politika Önerileri. İzmir Kâtip Çelebi Üniversitesi Sağlık Bilimleri Fakültesi Dergisi. 2026;11(2):483-492.", "10.61399/ikcusbfd.1594430", None),
        ("YEARBOOK_2024", "T.C. Sağlık Bakanlığı. Sağlık İstatistikleri Yıllığı 2024.", None, "https://www.saglik.gov.tr/TR-114952/saglik-istatistikleri-yilligi-2024.html"),
        ("TASAR_2024", "Taşar MT, Buluk Eşitti B. Sağlık Turizmi Yetki Belgesi Bulunan Sağlık Tesislerinin Web Sitelerinin İncelenmesi: Çanakkale Örneği. Turar Turizm ve Araştırma Dergisi. 2024;13(2):151-179.", "10.7460/turar.1520705", None),
        ("TUIK_ELDERLY_2024", "Türkiye İstatistik Kurumu. İstatistiklerle Yaşlılar, 2024. 13 Mart 2025.", None, None),
        ("TUIK_ELDERLY_2025", "Türkiye İstatistik Kurumu. İstatistiklerle Yaşlılar, 2025. 12 Mart 2026.", None, None),
        ("TUIK_POP_2024", "Türkiye İstatistik Kurumu. Nüfus Projeksiyonları, 2023-2100. Haber Bülteni 53699. 30 Temmuz 2024.", None, "https://data.tuik.gov.tr/Bulten/Index?p=Nufus-Projeksiyonlari-2023-2100-53699"),
        ("USTE_2026", "Uluslararası Sağlık Turizmi Enstitüsü. Sağlık Turizmi Gelirleri 2025'te 3 Milyar Doları Aştı. 16 Mart 2026.", None, "https://www.uste.org.tr/saglik-turizmi-gelirleri-2025te-3-milyar-dolari-asti/"),
        ("REGULATION_2025", "Uluslararası Sağlık Turizmi ve Turistin Sağlığı Hakkında Yönetmelik. T.C. Resmî Gazete, 26 Nisan 2025, Sayı 32882.", None, "https://www.resmigazete.gov.tr/eskiler/2025/04/20250426-2.htm"),
        ("YORULMAZ_AKSOY_2024", "Yorulmaz M, Aksoy MR. Türkiye'de Sağlık Turizmi Açısından Yetkilendirilmiş Hastaneler ve Sağlık Turizmi Acentelerinin Bölgelere Göre Değerlendirilmesi. In: International Artuklu Congress on Medicine, Nursing, Midwifery, and Health Sciences, Congress Proceedings Book; 2024. p. 1029-1037.", "10.30546/19023.978-9952-8541-5-2.2024.4098", None),
    ]),
    ("params", [
        ("AYLI_2026", "Aylı BI, Demir ME, Akgül A, Şahin H. Environmental footprint of in-center hemodialysis in Türkiye: A national, scenario-based analysis of water, energy, and waste. PLOS ONE. 2026;21(7):e0354903.", "10.1371/journal.pone.0354903", None),
        ("BAGUST_1999", "Bagust A, Place M, Posnett JW. Dynamics of bed use in accommodating emergency admissions: stochastic simulation model. BMJ. 1999;319(7203):155-158.", "10.1136/bmj.319.7203.155", None),
        ("BAS_2026", "Baş F, Erdoğan NM, Ethemoğlu FB. Cost Analysis of 30,446 Intensive Care Unit Admissions in a Tertiary City Hospital in Türkiye. Research Square [preprint, not peer reviewed]. Posted 17 June 2026.", "10.21203/rs.3.rs-9710531/v1", None),
        ("BRICK_2025", "Brick A, Kakoulidou T, Humes H. Projections of national demand and bed capacity requirements for public acute hospitals in Ireland, 2023–2040: Based on the Hippocrates model. ESRI Research Series 213. Dublin: Economic and Social Research Institute; 2025.", "10.26504/rs213", None),
        ("GRASSELLI_2020", "Grasselli G, Pesenti A, Cecconi M. Critical Care Utilization for the COVID-19 Outbreak in Lombardy, Italy: Early Experience and Forecast During an Emergency Response. JAMA. 2020;323(16):1545-1546.", "10.1001/jama.2020.4031", None),
        ("KAO_2022", "Kao YH, Chen Y, Deutsch A, Wen H, Tseng TS. Rehabilitation length of stay and functional improvement among patients with traumatic spinal cord injury. Spinal Cord. 2022;60(3):237-244.", "10.1038/s41393-021-00686-6", None),
        ("KAYA_2024", "Kaya B, Balal M, Seyrek N, Mete B, Karayaylali I. Hemodialysis Experience After Kahramanmaraş Earthquake. Journal of Clinical Medicine. 2024;13(21):6610.", "10.3390/jcm13216610", None),
        ("SENSOY_2025", "Ozer Sensoy NN, Kazan S, Güngör O. In Türkiye, very few internal medicine research assistants consider becoming nephrologists in the future. Scientific Reports. 2025;15:45488.", "10.1038/s41598-025-28375-x", None),
        ("REES_2020", "Rees EM, Nightingale ES, Jafari Y, Waterlow NR, Clifford S, Pearson CAB, CMMID Working Group, Jombart T, Procter SR, Knight GM. COVID-19 length of hospital stay: a systematic review and data synthesis. BMC Medicine. 2020;18:270.", "10.1186/s12916-020-01726-3", None),
        ("TURGUT_2024", "Turgut M, Ağırbaş İ, Nergizoğlu G. Cost Analysis of Hemodialysis Session: A Comparison Between Activity-Based Costing and Traditional Costing Methods. Clinical and Experimental Health Sciences. 2024;14(4):1106-1112.", "10.33808/clinexphealthsci.1318606", None),
        ("VAN_DEN_HEEDE_2019", "Van den Heede K, Bouckaert N, Van de Voorde C. The impact of an ageing population on the required hospital capacity: results from forecast analysis on administrative data. European Geriatric Medicine. 2019;10(5):697-705.", "10.1007/s41999-019-00219-8", None),
        ("WHO_BLUEBOOK_2021", "World Health Organization. Classification and minimum standards for emergency medical teams. Geneva: World Health Organization; 2021.", None, "https://www.who.int/publications/i/item/9789240029330"),
        ("WHO_CHOICE", "World Health Organization, Economic Analysis and Evaluation Team, Department of Health Systems Governance and Financing. WHO-CHOICE estimates of cost for inpatient and outpatient health service delivery.", None, "https://cdn.who.int/media/docs/default-source/health-economics/who-choice-estimates-of-cost-for-inpatient-and-outpatient-health-service-delivery.pdf"),
    ]),
    ("needs", [
        ("AEBISCHER_2017", "Aebischer Perone S, Martinez E, du Mortier S, Rossi R, Pahud M, Urbaniak V, Chappuis F, Hagon O, Jacquérioz Bausch F, Beran D. Non-communicable diseases in humanitarian settings: ten essential questions. Conflict and Health. 2017;11:17.", "10.1186/s13031-017-0119-8", None),
        ("ANKAH_2025", "Ankah AH, Alanqar MM, Mansour BM, AlZebda MM, Idris AE, Brown P, Melhem NZ, Ayyad NA. Experiences of children with kidney failure in Gaza. Eastern Mediterranean Health Journal. 2025;31(4):250-253.", "10.26719/2025.31.4.250", None),
        ("BILIR_2024", "Bilir EE, Borman P, Ata AM, Alemdaroğlu E, Bodur H, Yanık B, Yurdakul F, Kesikburun B, Güler T, Başkan B, Akkuş S, Uzun O, Yaşar E. Clinical properties and rehabilitation needs of earthquake survivors in a subacute rehabilitation setting. Ulusal Travma ve Acil Cerrahi Dergisi. 2024;30(4):297-304.", "10.14744/tjtes.2024.27553", None),
        ("BILIR_2025", "Bilir EE, Ata AM, Borman P, Savtok BE, Afşin B, Eser F. Retrospective Analysis of Functional and Demographic Data of Earthquake-Related Peripheral Nerve Injuries. Archives of Health Science and Research. 2025;12:1-5.", "10.5152/ArcHealthSciRes.2024.23161", None),
        ("BIYIKLI_2019", "Bıyıklı K, Taşkın R, Ceylan A, Ulutabanca RÖ, Benli AR. War and Health Tourism: Data of Kayseri Province. International Journal of Health Management and Tourism. 2019;4(1):73-81.", "10.31201/ijhmt.441373", None),
        ("BUYURGAN_2023", "Buyurgan ÇS, Bozkurt Babuş S, Yarkaç A, Köse A, Usluer HO, Ayrık C, Narcı H, Orekici Temel G. Demographic and Clinical Characteristics of Earthquake Victims Presented to the Emergency Department with and without Crush Injury upon the 2023 Kahramanmaraş (Turkey) Earthquake. Prehospital and Disaster Medicine. 2023;38(6):707-715.", "10.1017/S1049023X23006416", None),
        ("FILY_2019", "Fily F, Ronat JB, Malou N, Kanapathipillai R, Seguin C, Hussein N, Fakhri RM, Langendorf C. Post-traumatic osteomyelitis in Middle East war-wounded civilians: resistance to first-line antibiotics in selected bacteria over the decade 2006–2016. BMC Infectious Diseases. 2019;19(1):103.", "10.1186/s12879-019-3741-9", None),
        ("GOSNEY_2013", "Gosney JE, Reinhardt JD, von Groote PM, Rathore FA, Melvin JL. Medical rehabilitation of spinal cord injury following earthquakes in rehabilitation resource-scarce settings: implications for disaster research. Spinal Cord. 2013;51(8):603-609.", "10.1038/sc.2013.50", None),
        ("HALACLI_2025", "Halacli B, Guven G, Kaya EK, Yildirim M, Bulut Yuksel ND, Kocak G, Bulut K, Gulen D, Erdemir Sullu B, Kilicaslan B, Seven AE, Gemcioglu E, Simsek M, Yuksel RC, Temel S, Kaynar AS, Deveci K, Alptekinoglu Mendil N, Aydin E, Ulger B, Esmaoglu A, Boyaci Dundar N, Ortac Ersoy E, Gundogan K, Akinci SB, Topeli A, on behalf of the Turkish Intensive Care Studies-Network (TRICS-Net). Evaluation of the clinical characteristics and outcomes of patients admitted to intensive care units after the Kahramanmaras (Türkiye) earthquake: a multicenter observational study. Frontiers in Medicine. 2025;12:1517344.", "10.3389/fmed.2025.1517344", None),
        ("HANNA_2020", "Hanna TP, King WD, Thibodeau S, Jalink M, Paulin GA, Harvey-Jones E, O'Sullivan DE, Booth CM, Sullivan R, Aggarwal A. Mortality due to cancer treatment delay: systematic review and meta-analysis. BMJ. 2020;371:m4087.", "10.1136/bmj.m4087", None),
        ("IDREES_2025", "Idrees MHD, Bashir MMI, Mohamed BAA, Ahmed AEA, Abdalla HMM, Shaaban KMA. April 15th war and hemodialysis patients in Sudan: a cross-sectional study. BMC Public Health. 2025;25:230.", "10.1186/s12889-025-21369-4", None),
        ("MENDES_2025", "Mendeş E, Gümüşburun N. A 10-Year Analysis of Surgical Interventions Applied to Migrants: A Border Hospital Experience During the Syrian Civil War. Turkish Journal of Anaesthesiology and Reanimation. 2025;53(5):263-276.", "10.4274/TJAR.2025.252054", None),
        ("MOITINHO_2019", "Moitinho de Almeida M, van Loenhout JAF, Thapa SS, Kumar KC, Schlüter BS, Singh R, Banse X, Putineanu D, Mahara DP, Guha-Sapir D. Clinical and demographic profile of admitted victims in a tertiary hospital after the 2015 earthquake in Nepal. PLoS ONE. 2019;14(7):e0220016.", "10.1371/journal.pone.0220016", None),
        ("NORTON_2013", "Norton I, von Schreeb J, Aitken P, Herard P, Lajolo C. Classification and Minimum Standards for Foreign Medical Teams in Sudden Onset Disasters. World Health Organization; 2013.", None, "https://cdn.who.int/media/docs/default-source/documents/publications/classification-and-minimum-standards-for-foreign-medical-teams-in-suddent-onset-disasters65829584-c349-4f98-b828-f2ffff4fe089.pdf"),
        ("OZTURK_2024", "Ozturk I, Gungor O, Ozturk S, Olmaz R, Gunes Keskin AJ, Kocyigit I, Sipahioglu MH, Dede F, Ulu S, Turgutalp K, Torun D, Sahutoglu T, Erdur FM, Altunoren O, Danis R, Yildiz G, Gurel A, Horoz M, Kucuksu M, Karakose S, Yildirim T, Altiparmak MR, Ayli MD, Tugcu M, Eren Z, Eroglu E, Coskun Yavuz Y, Akcali E, Sit D, Polat M, Yildirim S, Alagoz S, Gokcay Bek S, Pembegul I, Karaaslan T, Keles M, Sari F, Yilmaz U, Gorgulu N, Sahin G, Aydin Z, Yadigar S, Ulutas O, Selcuk NY, Ayar Y, Turgut D, Oto OA, Koc M, Yıldız A, Tuglular S, Sever MS. Epidemiological analysis of the victıms wıth crush syndrome in earthquakes of southeastern Turkey. Journal of Nephrology. 2024;37(9):2589-2599.", "10.1007/s40620-024-02051-1", None),
        ("REDMOND_2011", "Redmond AD, Mardel S, Taithe B, Calvot T, Gosney J, Duttine A, Girois S. A Qualitative and Quantitative Study of the Surgical and Rehabilitation Response to the Earthquake in Haiti, January 2010. Prehospital and Disaster Medicine. 2011;26(6):449-456.", "10.1017/S1049023X12000088", None),
        ("YILMAZ_2023", "Yilmaz S. Transportation model utilized in the first week following the Kahramanmaraş earthquakes in Turkey - transport health centers. Scandinavian Journal of Trauma, Resuscitation and Emergency Medicine. 2023;31:40. Correction: 2023;31:67.", "10.1186/s13049-023-01108-7", None),
    ]),
    ("data", [
        ("EC_COVID_2020", "European Commission. Coronavirus: European Solidarity in action. Factsheet. 26 June 2020.", None, "https://ec.europa.eu/commission/presscorner/api/files/attachment/865847/Covid19_factsheet_EuropeanSolidarity_EN_26JUne.pdf.pdf"),
        ("OWID_COVID", "Mathieu E, Ritchie H, Rodés-Guirao L, Appel C, Gavrilov D, Giattino C, Hasell J, Macdonald B, Dattani S, Beltekian D, Ortiz-Ospina E, Roser M. COVID-19 Pandemic. Our World in Data; 2020.", None, "https://ourworldindata.org/coronavirus"),
        ("WHO_MEDEVAC_2025", "Medical evacuation of Gaza patients: Oct 2023 - 1 Dec 2025. Summary sheet hosted by the World Health Organization Regional Office for the Eastern Mediterranean.", None, "https://www.emro.who.int/images/stories/palestine/Medevac_1Dec25.pdf"),
        ("UKR_MOH_2025", "Ministry of Health of Ukraine. Medevac Ukraine: over 5,600 Ukrainian patients have participated in the medical evacuation program abroad. 6 June 2025.", None, "https://moz.gov.ua/en/medevac-ukraine-over-5-600-ukrainian-patients-have-participated-in-the-medical-evacuation-program-abroad"),
        ("NATURAL_EARTH", "Natural Earth. Free vector and raster map data.", None, "https://www.naturalearthdata.com"),
        ("WHO_EUR_2026", "WHO Regional Office for Europe. Over 6400 Ukrainians receive life-saving treatment abroad through medical evacuations. News release. 3 March 2026.", None, "https://www.who.int/europe/news/item/03-03-2026-over-6400-ukrainians-receive-life-saving-treatment-abroad-through-medical-evacuations"),
        ("WHO_HAB_2022", "World Health Organization. Health Access Barriers for patients in the occupied Palestinian territory. Monthly report, October 2022. Published 7 December 2022.", None, "https://www.emro.who.int/images/stories/palestine/Oct_2022_Monthly.pdf"),
        ("WHO_GAZA_2025", "World Health Organization, Office for the occupied Palestinian territory. Estimating Trauma Rehabilitation Needs in Gaza: September 2025 Update. Technical note. 2 October 2025.", None, "https://cdn.who.int/media/docs/default-source/hq-whe/estimating-trauma-rehabilitation-needs-in-gaza-september-2025.pdf"),
        ("WHO_EMRO_2026", "World Health Organization, Regional Office for the Eastern Mediterranean. One in four injuries in Gaza is life-changing while rehabilitation services struggle to keep pace, WHO reports. 12 May 2026.", None, "https://www.emro.who.int/opt/news/one-in-four-injuries-in-gaza-is-life-changing-while-rehabilitation-services-struggle-to-keep-pace-who-reports.html"),
        ("WHO_REHAB_2021", "World Health Organization. Rehabilitation needs of people recovering from COVID-19. Scientific brief. WHO/2019-nCoV/Sci_Brief/Rehabilitation/2021.1. 29 November 2021.", None, "https://www.who.int/docs/default-source/coronaviruse/scientific-brief-rehabilitation-and-covid-19_.pdf"),
    ]),
]


def main():
    out, n = [], 0
    for key, items in GROUPS:
        rows = []
        for rid, cite, doi, url in items:
            n += 1
            row = {"n": n, "id": rid, "c": cite}
            if doi:
                row["d"] = doi
            if url:
                row["u"] = url
            rows.append(row)
        out.append({"k": key, "items": rows})
    with open(os.path.join(ROOT, "data", "references.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print("references", n)


if __name__ == "__main__":
    main()
