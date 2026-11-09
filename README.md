<h1 align="center">TR-Health-Tourism-Surge-Sim</h1> 

<p align="center">
  <strong>If a crisis happened in a country you choose, how much of the care it needs could Türkiye's health tourism infrastructure provide, today and by 2047?</strong><br>
  A province-level simulation of hypothetical scenarios, in English and Turkish, based on published evidence.
</p>

<p align="center">
  <em>Seçtiğiniz bir ülkede kriz yaşansa, ortaya çıkan bakım ihtiyacının ne kadarını Türkiye'nin sağlık turizmi altyapısı bugün ve 2047'ye kadar karşılayabilir?</em>
</p>

<p align="center">
  <a href="https://gamze-kose.github.io/TR-Health-Tourism-Surge-Sim/"><strong>Open the simulator / Simülatörü açın</strong></a>
  &nbsp;·&nbsp;
  <a href="#english">English</a>
  &nbsp;·&nbsp;
  <a href="#turkce">Türkçe</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-black.svg" alt="MIT">
  <img src="https://img.shields.io/badge/installation-none-1D9E75.svg" alt="No installation">
  <img src="https://img.shields.io/badge/provinces-81%20(60%20receiving)-0F7A7F.svg" alt="81 provinces, 60 receiving">
  <img src="https://img.shields.io/badge/course-2027%20to%202047-0F7A7F.svg" alt="2027 to 2047">
  <img src="https://img.shields.io/badge/countries-178-0F7A7F.svg" alt="178 countries">
  <img src="https://img.shields.io/badge/care%20needs-17-B52AA8.svg" alt="17 care needs">
  <img src="https://img.shields.io/badge/languages-EN%20%7C%20TR-1A5FCF.svg" alt="English and Turkish">
  <img src="https://img.shields.io/badge/Monte%20Carlo-2%2C000%20runs-555.svg" alt="Monte Carlo">
  <img src="https://img.shields.io/badge/sensitivity-Sobol-5B4DA6.svg" alt="Sobol">
</p>

<p align="center">
  <strong>Gamze Köse</strong>, Independent Researcher, MSc in Health Tourism<br>
  <a href="https://orcid.org/0000-0003-1225-5118">ORCID 0000-0003-1225-5118</a> &nbsp;·&nbsp; <a href="https://github.com/gamze-kose">github.com/gamze-kose</a><br><br>
  <strong>Prof. Dr. Utku Köse</strong>, Department of Computer Engineering and Artificial Intelligence Application and Research Center, Süleyman Demirel University<br>
  University of North Dakota, Universidad Panamericana, VelTech University<br>
  <a href="https://orcid.org/0000-0002-9652-6415">ORCID 0000-0002-9652-6415</a> &nbsp;·&nbsp; <a href="https://utkukose.com">utkukose.com</a> &nbsp;·&nbsp; <a href="https://github.com/utkukose">github.com/utkukose</a>
</p>

<p align="center"><img src="docs/img/en/07-results.png" width="900" alt="The simulator after a run: patients travelling to Turkish cities, with key findings under the map"></p>

---

<a id="english"></a>

# English

## Why this model exists

Epidemics, natural disasters and armed conflicts can create care needs that the affected health system cannot meet. People living through a crisis do not travel for elective treatment. They need limb reconstruction, prostheses, rehabilitation after spinal cord or brain injury, burn care, kidney support after crush injury, and the cancer or dialysis treatment that the crisis has cut off.

Türkiye has built a large health tourism sector, with authorised hospitals, international patient services, transport links, hotels and thermal facilities. How much of these needs that infrastructure could meet has not been measured. The 2025 health tourism regulation mentions war and disaster in one place, Article 2, which allows a presidential decision to designate countries whose patients are treated outside the regulation's commercial rules.

**Research question.** How much of the treatment needs that disasters, wars and epidemics would create, and that could not be met locally, could Türkiye's health tourism infrastructure meet, in which cities, under what conditions, and how will this change by 2047?

**All scenarios are hypothetical.** The user chooses a country and a crisis that could happen there. Findings on past events enter the model only as numbers, such as injury patterns, referral shares and lengths of stay. No real event is simulated, and a few countries are not offered so that no scenario can repeat a recent war.

## Key findings

**The reserve is real, but it sits in few places.** Authorised hospitals are found in 60 of Türkiye's 81 provinces (44 named in published sources, 16 inferred from regional counts), and in each reference scenario 10 to 17 cities take 80% of the patients. After a hypothetical earthquake next door, 96% of referred patients are admitted (5th to 95th percentile: 91 to 98). In a year of armed conflict with an open corridor the share is 72% (55 to 91). In foreign crises no province goes above 85% occupancy, and idle authorised beds meet the reference demand, so paying patients do not have to be displaced.

**Beds are not what runs short.** Cancer care is the first limit: in an open-corridor conflict 1,196 of 3,300 cancer patients are admitted. Inpatient rehabilitation saturates at two to four times the reference casualties. When the exit from the country is restricted, only 20% (8 to 33) are admitted, and daily exit clearance explains 82% of the variance. In conflict, 63% are admitted with an unplanned response and 81% with a coordinated response prepared in advance.

**Over 20 years, preparation matters more than new buildings.** By 2047 domestic demand for hospital beds is 31% above 2024 because of ageing, while beds grow by 26%. On the current course the share admitted in conflict rises only from 72% to 75%. A planned expansion reaches 82% and an ambitious programme 93%. Preparing the national response brings most of this gain: 565 extra patients on the planned expansion and 1,051 on the ambitious programme. Added cancer and rehabilitation capacity gives 23 and 305. New units in small provinces give 54, and certifying more hospitals gives nothing in these scenarios, because general beds are not the limit.

## Using the simulator

The simulator is one HTML file and runs in the browser. It needs no installation or server. It opens in English and has a switch for Turkish. Nothing runs until a scenario is built. The screens below follow a hypothetical extreme earthquake in Azerbaijan, set in 2035. They describe no real event, and choosing a country says nothing about that country.

### Step 1. Choose a country

Tap a country on the map or pick it from the list. Its common parameters appear: population, hospital beds, human development index, older people, diabetes, road border gates and transfer time. Striped Turkish cities have no authorised hospital on record.

<p align="center"><img src="docs/img/en/02-country.png" width="900" alt="Step 1: choosing a country"></p>

### Step 2. Describe the crisis

Choose the type of crisis and its size. For armed conflict you also choose how open the exit is and how long it lasts. The panel turns the choice into numbers: people affected and patients expected to need care abroad. Up to four crises can run together, and Türkiye can be hit at the same time by a Marmara earthquake.

<p align="center"><img src="docs/img/en/03-crisis.png" width="900" alt="Step 2: type and size of the crisis"></p>

### Step 3. Choose the year and the path

Move the slider to any year from 2027 to 2047 and choose how Türkiye develops until then. The current course follows past trends. The planned expansion and the ambitious programme add units in new cities, more certified hospitals, cancer and rehabilitation capacity, and a better prepared response. The card shows the state of Türkiye in that year, and the map marks cities that have opened a unit on this path. Below these, choose how the response is organised and what share of patients would choose Türkiye.

<p align="center"><img src="docs/img/en/04-year.png" width="900" alt="Step 3: year of the crisis and development path"></p>

### Step 4. Change any city, or leave them as they are

This step is optional. Tap any city on the map or pick it from the list. Seven numbers can be changed: beds and intensive care beds in authorised hospitals, dialysis places, radiotherapy places, rehabilitation beds, thermal beds and hotel beds. Each shows its default value, and the panel shows how many places would be open to crisis patients. Most beds are already in use, so an added bed is not an added place.

<p align="center"><img src="docs/img/en/05-cities.png" width="900" alt="Step 4: changing the capacity of a city"></p>

A city without a unit cannot receive anyone, and its numbers cannot be used. *Open a unit here* changes that. All your changes are listed, and each can be undone. If you change nothing, the default values are used: the latest data in the model, carried forward to the chosen year.

<p align="center"><img src="docs/img/en/06-open-unit.png" width="900" alt="Step 4: opening a unit in a city without one"></p>

### Step 5. Read the results

Patients travel to Turkish cities on the map, and icons show their care needs. The timeline plays the year. Key findings under the map answer five questions: Can Türkiye respond well? Where is the greatest potential? What holds the response back? Which cities should be supported? And over 20 years? If you changed a city, one more card shows what your changes did.

<p align="center"><img src="docs/img/en/08-key-findings.png" width="900" alt="Key findings under the map"></p>

A change matters only where capacity is the limit. In the earthquake above, transport seats are the limit, so added beds change nothing. In a scenario with many cancer patients, added radiotherapy places in one city admit more patients:

<p align="center"><img src="docs/img/en/08b-your-changes.png" width="300" alt="Effect of a change where capacity is the limit"></p>

### The 20 years tab

Each point runs the same crisis in that year, on each path and with your changes. The buttons run the crisis in another year.

<p align="center"><img src="docs/img/en/09-twenty-years.png" width="620" alt="The same crisis in any year to 2047"></p>

The tab then shows what each part of a programme adds, what can be done in each period, how Türkiye changes on this course, and which cities open a unit and when.

<table><tr><td><img src="docs/img/en/10-what-can-be-done.png" width="430" alt="What each part of the programme adds"></td><td><img src="docs/img/en/11-course.png" width="430" alt="What can be done, period by period"></td></tr></table>

### City panels

Tap a city to see why patients go there, how it has changed since 2015, how ready it is for each need, and what you can change. A striped city explains why nobody goes there and what it would take.

<table><tr><td><img src="docs/img/en/12-city-why.png" width="430" alt="City panel: why patients go here"></td><td><img src="docs/img/en/15-city-no-unit.png" width="430" alt="City panel: a city without a unit"></td></tr></table>

<table><tr><td><img src="docs/img/en/13-city-past.png" width="430" alt="City panel: past years"></td><td><img src="docs/img/en/14-city-forecast.png" width="430" alt="City panel: forecast and capacity"></td></tr></table>

### Needs, Cities, Impact and Settings

Needs sets out each care need with its evidence and sources. Cities rates every city for every need and lets you add stars for your own forecast. Impact gives the potential for Türkiye, who would pay and what holds the response back. Settings holds every parameter with its basis, and a code to save or share the setup.

<table><tr><td><img src="docs/img/en/16-needs.png" width="430" alt="Needs tab"></td><td><img src="docs/img/en/17-cities-tab.png" width="430" alt="Cities tab"></td></tr></table>

<table><tr><td><img src="docs/img/en/18-impact.png" width="430" alt="Impact tab"></td><td><img src="docs/img/en/19-settings.png" width="430" alt="Settings tab"></td></tr></table>

### On a phone

The map stays at the top while the steps and results scroll beneath it.

<p align="center"><img src="docs/img/en/20-phone.png" width="900" alt="The simulator on a phone"></p>

## Care needs

The study first sets out what the literature reports for each need. The full table, with evidence, transfer windows, the care that each need requires and its references, is in [`docs/needs_table.md`](docs/needs_table.md). Statements without a source are marked as the authors' judgement.

| Layer | Needs | Can it move abroad? |
|---|---|---|
| Caused by the crisis | Major limb injury, amputation, spinal cord injury, brain injury, burns, crush injury with kidney failure, face and jaw injury, eye injury, chest, abdomen and pelvis injury, critical illness in an epidemic, recovery after hospital | Mostly after the first days or weeks, once the patient is stable |
| Treatment cut off by the crisis | Cancer, long-term dialysis, heart disease, congenital disease, blood disease | Yes, if the patient can be stabilised for the journey |
| Routine care in a long crisis | Ordinary treatment no longer available at home | Yes. Only this layer is health tourism in the usual sense |
| Stays at home | The first hours of emergency care, long-term medicines, mental health care, childbirth and newborn care | No |

The people in the first two layers are patients, not tourists. The study therefore speaks of the infrastructure of health tourism and not of tourists.

## Model

The engine is a stochastic, capacity-constrained compartmental network model with a daily time step over one year. All analyses and the map run on the same file, `src/engine.js`.

**Places.** Provinces of Türkiye, 178 countries that can be chosen, and a domestic node for a disaster inside Türkiye. A health facility must hold the Ministry of Health's authorisation certificate before it can treat international patients. Patients therefore go only to provinces with an authorised hospital: 60 of 81, based on the count of 650 hospitals in December 2024. The other 21 receive nobody until a unit opens there. The rule and its limits are in [`docs/course_of_years.md`](docs/course_of_years.md).

**Common country parameters.** Every country is described in the same way: population, hospital beds per 1,000 people, human development index, share of people aged 65 or over, diabetes prevalence, road border gates with Türkiye and travel time. A crisis is built from these parameters and from figures published on past events. The rules are in [`docs/scenario_rules.md`](docs/scenario_rules.md).

**Care lines.** Intensive care, trauma and reconstruction, dialysis, oncology, inpatient rehabilitation and step-down care. Each line has Erlang-distributed stays, and a patient waiting for the next line keeps occupying a bed. Referrals on each line are split into 17 needs using published injury and referral patterns.

**Reserve.** Idle beds in authorised facilities, counted up to a safe occupancy of 85%, a released share of beds used by paying patients, rehabilitation hospital beds, haemodialysis capacity, radiotherapy capacity, and thermal and hotel beds for step-down care.

**Getting patients here.** Daily exit clearance, land corridors, a shared air pool, case coordinators, then placement by capacity and travel time.

**The course of the years.** Beds, intensive care beds and specialists follow each province's trend for 2015 to 2024, damped year by year. Population and ageing follow the main scenario of TÜİK, and domestic demand for beds rises with them. Three development paths show what can be done. The equations and every target are in [`docs/course_of_years.md`](docs/course_of_years.md).

**City readiness.** Each city is rated for each need with TOPSIS, using 20 indicators of specialised care, general capacity, tourism facilities, access and existing health tourism. Details are in [`docs/city_readiness.md`](docs/city_readiness.md).

**Analysis.** 2,000 Monte Carlo runs per scenario over parameter uncertainty and Poisson referral noise, Sobol indices with SALib, removal of one limit at a time, policy packages, saturation tests and greedy hub selection. Mass balance, extreme conditions, monotonicity and reproducibility are tested in `tests/test_engine.js`.

## Results

These are the six hypothetical reference scenarios. Their origins are numbered locations and stand for no country. Median of 2,000 runs, with the 5th and 95th percentiles.

| Scenario | Share of referrals admitted | Mean wait, days |
|---|---|---|
| Earthquake next door | 96% (91 to 98) | 20 (9 to 54) |
| Armed conflict, open corridor | 72% (55 to 91) | 101 (51 to 153) |
| Armed conflict, restricted exit | 20% (8 to 33) | 183 (152 to 216) |
| Regional epidemic | 88% (72 to 96) | 14 (7 to 37) |
| Marmara earthquake with foreign conflict | 72% (54 to 90) | 65 (33 to 99) |
| Distant crises | 72% (42 to 87) | 105 (59 to 170) |

**By need, reference run.** Patients admitted of those referred, core needs only.

| Need | Armed conflict, open corridor | Earthquake next door | Regional epidemic |
|---|---|---|---|
| Major limb injury and reconstruction | 2,273 of 2,456 | 1,198 of 1,228 | - |
| Amputation and prosthetic limb | 989 of 1,061 | 262 of 266 | - |
| Spinal cord injury | 270 of 289 | 65 of 65 | - |
| Traumatic brain injury | 278 of 330 | 62 of 65 | - |
| Major burns | 215 of 252 | 20 of 21 | - |
| Crush injury with kidney failure | - | 96 of 139 | - |
| Face and jaw injury | 99 of 108 | 20 of 21 | - |
| Eye injury and eye disease | 47 of 51 | 10 of 11 | - |
| Chest, abdomen and pelvis injury | 499 of 572 | 173 of 184 | - |
| Critical illness in an epidemic | - | - | 185 of 300 |
| Nursing and recovery after hospital | 385 of 412 | 400 of 401 | 1,197 of 1,200 |
| Cancer treatment | 1,196 of 3,300 | - | - |
| Long-term dialysis | 274 of 330 | - | 499 of 600 |

**Potential, reference run.** "At the observed share" assumes that Türkiye receives 9% of referrals, as in one documented medical evacuation programme (430 of 4,895). Care and transfer are valued at cost. For the Marmara scenario the figures cover foreign patients only.

| Scenario | Referred | Could be treated | At the observed share | Care and transfer | Companions |
|---|---|---|---|---|---|
| Earthquake next door | 2,400 | 2,308 | 203 | USD 20.1 million | 2,631 |
| Armed conflict, open corridor | 9,161 | 6,526 | 757 | USD 61.2 million | 7,439 |
| Armed conflict, restricted exit | 9,161 | 1,727 | 152 | USD 18.2 million | 1,969 |
| Regional epidemic | 2,100 | 1,881 | 165 | USD 12.1 million | 2,145 |
| Marmara earthquake with foreign conflict | 9,161 | 6,494 | 757 | USD 61.6 million | 7,404 |
| Distant crises | 11,561 | 8,336 | 926 | USD 76.5 million | 9,503 |

Full tables are in `results/summary.md`, `results/needs_by_scenario.csv` and `results/potential_by_scenario.csv`.

## From 2027 to 2047

The same hypothetical crisis is run in each year while Türkiye changes. The table gives the share of referrals admitted, with the 5th and 95th percentiles of 300 runs over model parameters, trend damping, ageing and paying patient growth.

| Scenario | 2027 | 2047, current course | 2047, planned expansion | 2047, ambitious programme |
|---|---|---|---|---|
| Earthquake next door | 96% (92 to 98) | 96% (91 to 98) | 97% (94 to 99) | 98% (95 to 99) |
| Armed conflict, open corridor | 72% (54 to 91) | 75% (58 to 95) | 82% (63 to 97) | 93% (70 to 98) |
| Armed conflict, restricted exit | 19% (9 to 34) | 19% (9 to 35) | 26% (13 to 47) | 33% (16 to 57) |
| Regional epidemic | 90% (72 to 96) | 90% (73 to 96) | 92% (78 to 97) | 94% (80 to 98) |
| Marmara earthquake with foreign conflict | 72% (54 to 90) | 75% (58 to 95) | 82% (64 to 97) | 92% (70 to 98) |
| Distant crises | 73% (42 to 88) | 75% (49 to 92) | 82% (67 to 95) | 91% (73 to 96) |

Where exit permits set the limit, as under restricted exit, Türkiye's own investments help little, and exit permits stay the main limit in every period. Fifteen provinces open a unit on the two programmes. Six provinces fall below the size of the smallest province holding a certificate today and never open on their own, so the model never reaches all 81. Full tables are in `results/outlook_by_year.csv` and `results/outlook.json`.

## Data and limits

Country parameters are national averages from the United Nations, the World Bank, the OECD, UNDP and the International Diabetes Federation, compiled by Our World in Data. Beds, intensive care beds, occupancy and workforce in Türkiye are province-level figures from the Ministry of Health yearbooks, 2015 to 2024. Sources and caveats are listed in [`data/SOURCES.md`](data/SOURCES.md), and all 158 parameters are listed with their basis in [`docs/parameters.md`](docs/parameters.md).

Which provinces can receive patients is known by region only. The Ministry's list of authorised facilities declined automated reading. Of the 60 receiving provinces, 44 are named in published sources and 16 are inferred from the regional count. Each city panel says which, and the list can be replaced in one place. Health tourist shares, authorised beds, rehabilitation beds and oncology places by province are estimates built from national totals. No province list of burn units, rehabilitation hospitals, prosthetic workshops or paediatric centres was found.

The evidence is uneven. Figures for some needs are thin, no source gives transfer windows in days by need, and many clinical pathway shares, costs and activation rates are stated as assumptions. No national count of health tourists by nationality or by treatment was found. All referrals go to Türkiye by default as a stress test. In practice several countries share such patients. After 2027, trends, ageing effects and programme targets are stated assumptions, and country profiles and the crisis itself stay fixed over the years.

Reference lists keep the exact titles of the sources, and some of those titles name real places, because a citation must match the source. The results compare options under stated assumptions. They are not forecasts and must not guide decisions about individual patients.

## Running it

```bash
python3 src/build_countries.py     # build the country table with common parameters
python3 src/build_model.py         # assemble data/model.json
python3 src/build_cities.py        # add city indicators, care needs and panel data
python3 src/build_docs.py          # write the parameter, needs and readiness documents
node tests/test_engine.js data/model.json
node analysis/run_all.js data/model.json results 2000
pip install SALib numpy && python3 analysis/sobol_run.py 256
python3 analysis/summarize.py
node analysis/run_forecast.js data/model.json results
node analysis/run_outlook.js data/model.json results 300
node src/extract_strings.js        # check that every string has a Turkish version
node src/build_page.js             # rebuild index.html
```

`index.html` is self-contained. To publish it, enable GitHub Pages for the main branch and root folder.

## Related paper

> Köse, G. & Köse, U. (2026). Health Tourism Infrastructure as a Cross-Border Healthcare Reserve in Extraordinary Situations: A Province-Level Simulation and 2047 Projection for Türkiye. *INHSC2026, 5th International / 8th National Health Services Congress*, 13-14 November 2026, Isparta, Türkiye.

The abstract is in [`docs/abstract_INHSC2026.md`](docs/abstract_INHSC2026.md).

---

<a id="turkce"></a>

# Türkçe

## Bu model neden geliştirildi?

Salgınlar, doğal afetler ve silahlı çatışmalar, etkilenen sağlık sisteminin karşılayamayacağı bakım ihtiyaçları doğurabilmektedir. Kriz yaşayan insanlar seçmeli bir tedavi için yola çıkmaz. Onların ihtiyacı uzuv rekonstrüksiyonu, protez, omurilik veya beyin yaralanması sonrası rehabilitasyon, yanık bakımı, ezilme yaralanması sonrası böbrek desteği ve krizin kestiği kanser veya diyaliz tedavisidir.

Türkiye, yetkili hastaneleri, uluslararası hasta birimleri, ulaşım bağlantıları, otelleri ve termal tesisleriyle büyük bir sağlık turizmi sektörü kurmuştur. Bu altyapının söz konusu ihtiyaçların ne kadarını karşılayabileceği ise ölçülmemiştir. 2025 tarihli sağlık turizmi yönetmeliği savaş ve afetten yalnızca 2. maddesinde söz etmekte, Cumhurbaşkanı kararıyla belirlenen ülkelerin hastalarının yönetmeliğin ticari kuralları dışında tedavi edilebilmesine imkân tanımaktadır.

**Araştırma sorusu.** Afetlerin, savaşların ve salgınların doğuracağı ve yerinde karşılanamayacak tedavi ihtiyaçlarının ne kadarı, hangi şehirlerde ve hangi koşullarda Türkiye'nin sağlık turizmi altyapısıyla karşılanabilir, bu durum 2047'ye kadar nasıl değişir?

**Bütün senaryolar varsayımsaldır.** Kullanıcı bir ülke ve orada yaşanabilecek bir kriz seçmektedir. Geçmiş olaylara ilişkin bulgular modele yalnızca yaralanma örüntüleri, sevk oranları ve yatış süreleri gibi sayılar olarak girer. Hiçbir gerçek olay simüle edilmez. Hiçbir senaryonun yakın geçmişteki bir savaşı yinelememesi için birkaç ülke seçeneklerin dışında bırakılmıştır.

## Önemli bulgular

**Rezerv gerçektir, ancak az sayıda yerde toplanmaktadır.** Yetkili hastaneler Türkiye'nin 81 ilinin 60'ında bulunmakta (44'ü yayımlanmış kaynaklarda adı geçen, 16'sı bölgesel sayımlardan çıkarılan iller), her referans senaryoda hastaların %80'ini 10-17 şehir kabul etmektedir. Komşu ülkede yaşanan varsayımsal bir depremde sevk edilen hastaların %96'sı kabul edilmektedir (5.-95. yüzdelik: 91-98). Koridorun açık olduğu bir yıllık silahlı çatışmada bu oran %72'dir (55-91). Yurt dışı krizlerde hiçbir ilde doluluk %85'i aşmamakta, atıl yetkili yataklar referans talebi karşılamaktadır. Bu nedenle ödeme yapan hastaların yerinden edilmesi gerekmemektedir.

**Eksik olan yatak değildir.** İlk sınır kanser bakımıdır: Koridorun açık olduğu çatışmada 3.300 kanser hastasından 1.196'sı kabul edilebilmektedir. Yatarak rehabilitasyon, referans yaralı sayısının iki ila dört katında doygunluğa ulaşmaktadır. Ülkeden çıkış kısıtlandığında kabul oranı %20'ye (8-33) düşmekte, varyansın %82'sini günlük çıkış izni açıklamaktadır. Çatışmada kabul oranı hazırlıksız bir müdahalede %63 iken önceden hazırlanmış eşgüdümlü bir müdahalede %81'dir.

**Yirmi yıllık seyirde hazırlık, yeni yapılardan daha önemlidir.** 2047'de yaşlanmanın etkisiyle hastane yatağına yurt içi talep 2024'e göre %31 artarken yatak sayısı %26 artmaktadır. Mevcut seyirde çatışmadaki kabul oranı yalnızca %72'den %75'e çıkmaktadır. Planlı genişleme %82'ye, iddialı program %93'e ulaşmaktadır. Bu kazancın büyük bölümü ulusal müdahale hazırlığından gelmektedir: Planlı genişlemede 565, iddialı programda 1.051 ek hasta. Eklenen kanser ve rehabilitasyon kapasitesi 23 ve 305 ek hasta sağlamaktadır. Küçük illerde açılan yeni birimlerin katkısı 54 hastadır. Daha çok hastaneye yetki belgesi kazandırmak ise bu senaryolarda sonucu değiştirmemektedir, çünkü genel yatak sınır oluşturmamaktadır.

## Simülatörün kullanımı

Simülatör tek bir HTML dosyasıdır ve tarayıcıda çalışır. Kurulum veya sunucu gerektirmez. İngilizce açılır, Türkçeye tek düğmeyle geçilir. Bir senaryo kurulmadan hiçbir şey çalışmaz. Aşağıdaki ekranlar 2035 yılında Azerbaycan'da yaşandığı varsayılan çok büyük bir depremi izlemektedir. Bu ekranlar gerçek bir olayı anlatmaz, bir ülkenin seçilmesi de o ülke hakkında herhangi bir yargı içermez.

### 1. adım: Ülkeyi seçin

Haritada bir ülkeye dokunun veya listeden seçin. Ülkenin ortak parametreleri görüntülenir: Nüfus, hastane yatağı, insani gelişme endeksi, yaşlı nüfus, diyabet, kara sınır kapıları ve nakil süresi. Türkiye'de çizgili görünen şehirlerde kayıtlı yetkili hastane yoktur.

<p align="center"><img src="docs/img/tr/02-country.png" width="900" alt="1. adım: Ülke seçimi"></p>

### 2. adım: Krizi tanımlayın

Krizin türünü ve büyüklüğünü seçin. Silahlı çatışmada çıkışın ne kadar açık olduğunu ve sürecini de belirlersiniz. Panel bu seçimi sayılara dönüştürür: Etkilenen kişiler ve yurt dışında bakıma ihtiyaç duyması beklenen hastalar. Aynı anda dört krize kadar çalıştırılabilir, Türkiye'de eş zamanlı bir Marmara depremi de eklenebilir.

<p align="center"><img src="docs/img/tr/03-crisis.png" width="900" alt="2. adım: Krizin türü ve büyüklüğü"></p>

### 3. adım: Yılı ve gelişim yolunu seçin

Kaydırıcıyı 2027 ile 2047 arasında istediğiniz yıla getirin ve Türkiye'nin o yıla kadar nasıl gelişeceğini seçin. Mevcut seyir geçmiş eğilimleri izler. Planlı genişleme ve iddialı program yeni şehirlerde birimler, daha çok yetkili hastane, kanser ve rehabilitasyon kapasitesi ve daha hazırlıklı bir müdahale ekler. Kart o yıldaki Türkiye'yi özetler, harita bu yolda birim açan şehirleri işaretler. Altta müdahalenin nasıl örgütlendiğini ve hastaların ne kadarının Türkiye'yi seçeceğini belirlersiniz.

<p align="center"><img src="docs/img/tr/04-year.png" width="900" alt="3. adım: Krizin yılı ve gelişim yolu"></p>

### 4. adım: İstediğiniz şehri değiştirin ya da olduğu gibi bırakın

Bu adım isteğe bağlıdır. Haritada bir şehre dokunun veya listeden seçin. Yedi değer değiştirilebilir: Yetkili hastanelerdeki yatak ve yoğun bakım yatağı, diyaliz yeri, radyoterapi yeri, rehabilitasyon yatağı, termal yatak ve otel yatağı. Her satırda varsayılan değer yazar, panel de kriz hastalarına kaç yerin açık olacağını gösterir. Yatakların çoğu zaten kullanımda olduğundan eklenen her yatak kriz hastası için bir yer anlamına gelmez.

<p align="center"><img src="docs/img/tr/05-cities.png" width="900" alt="4. adım: Bir şehrin kapasitesinin değiştirilmesi"></p>

Birimi olmayan bir şehir hasta kabul edemez, sayıları da kullanılamaz. *Burada birim aç* düğmesi bunu değiştirir. Bütün değişiklikler listelenir ve her biri geri alınabilir. Hiçbir şeyi değiştirmezseniz varsayılan değerler, yani modeldeki en güncel verilerin seçilen yıla taşınmış hâli kullanılır.

<p align="center"><img src="docs/img/tr/06-open-unit.png" width="900" alt="4. adım: Birimi olmayan şehirde birim açılması"></p>

### 5. adım: Sonuçları okuyun

Hastalar haritada Türkiye'deki şehirlere gider, simgeler bakım ihtiyaçlarını gösterir. Zaman çubuğu yılı oynatır. Haritanın altındaki bulgular beş soruyu yanıtlamaktadır: Türkiye iyi yanıt verebiliyor mu? En büyük potansiyel nerede? Yanıtı ne sınırlıyor? Hangi şehirler desteklenmeli? 20 yıl içinde ne değişir? Bir şehri değiştirdiyseniz, ek bir kart değişikliklerinizin ne yaptığını gösterir.

<p align="center"><img src="docs/img/tr/08-key-findings.png" width="900" alt="Haritanın altındaki öne çıkan bulgular"></p>

Bir değişiklik yalnızca kapasite sınır oluşturuyorsa etkili olur. Yukarıdaki depremde sınır nakil koltuklarıdır, bu yüzden eklenen yataklar sonucu değiştirmez. Kanser hastalarının çok olduğu bir senaryoda ise tek bir şehre eklenen radyoterapi yerleri daha çok hastanın kabul edilmesini sağlar:

<p align="center"><img src="docs/img/tr/08b-your-changes.png" width="300" alt="Kapasitenin sınır olduğu durumda değişikliğin etkisi"></p>

### 20 yıl sekmesi

Her nokta aynı krizi o yılda, her gelişim yolunda ve sizin değişikliklerinizle çalıştırır. Düğmeler krizi başka bir yılda çalıştırır.

<p align="center"><img src="docs/img/tr/09-twenty-years.png" width="620" alt="2047 yılına kadar herhangi bir yılda aynı kriz"></p>

Sekme ardından programın her parçasının ne kattığını, her dönemde neler yapılabileceğini, Türkiye'nin bu seyirde nasıl değiştiğini ve hangi şehrin ne zaman birim açtığını göstermektedir.

<table><tr><td><img src="docs/img/tr/10-what-can-be-done.png" width="430" alt="Programın her parçasının katkısı"></td><td><img src="docs/img/tr/11-course.png" width="430" alt="Dönem dönem neler yapılabilir"></td></tr></table>

### Şehir panelleri

Bir şehre dokunduğunuzda hastaların neden oraya gittiğini, şehrin 2015'ten bu yana nasıl değiştiğini, her ihtiyaç için ne kadar hazır olduğunu ve neleri değiştirebileceğinizi görürsünüz. Çizgili bir şehir, oraya neden hasta gitmediğini ve bunun için ne gerektiğini açıklar.

<table><tr><td><img src="docs/img/tr/12-city-why.png" width="430" alt="Şehir paneli: Hastalar neden buraya geliyor"></td><td><img src="docs/img/tr/15-city-no-unit.png" width="430" alt="Şehir paneli: Birimi olmayan şehir"></td></tr></table>

<table><tr><td><img src="docs/img/tr/13-city-past.png" width="430" alt="Şehir paneli: Geçmiş yıllar"></td><td><img src="docs/img/tr/14-city-forecast.png" width="430" alt="Şehir paneli: Öngörü ve kapasite"></td></tr></table>

### İhtiyaçlar, Şehirler, Etki ve Ayarlar

İhtiyaçlar sekmesi her bakım ihtiyacını kanıtı ve kaynaklarıyla ortaya koyar. Şehirler sekmesi her şehri her ihtiyaç için derecelendirir ve kendi öngörünüz için yıldız vermenize imkân tanır. Etki sekmesi Türkiye için potansiyeli, masrafı kimin ödeyeceğini ve yanıtı neyin sınırladığını gösterir. Ayarlar sekmesinde dayanaklarıyla birlikte bütün parametreler ve kurulumu saklamaya ya da paylaşmaya yarayan bir kod bulunur.

<table><tr><td><img src="docs/img/tr/16-needs.png" width="430" alt="İhtiyaçlar sekmesi"></td><td><img src="docs/img/tr/17-cities-tab.png" width="430" alt="Şehirler sekmesi"></td></tr></table>

<table><tr><td><img src="docs/img/tr/18-impact.png" width="430" alt="Etki sekmesi"></td><td><img src="docs/img/tr/19-settings.png" width="430" alt="Ayarlar sekmesi"></td></tr></table>

### Telefonda

Harita üstte sabit kalır, adımlar ve sonuçlar altında kayar.

<p align="center"><img src="docs/img/tr/20-phone.png" width="900" alt="Simülatörün telefondaki görünümü"></p>

## Bakım ihtiyaçları

Çalışma önce her ihtiyaç için literatürün ne bildirdiğini ortaya koymaktadır. Kanıtları, nakil zamanlarını, gereken bakımı ve kaynakları içeren tam tablo [`docs/needs_table.md`](docs/needs_table.md) dosyasındadır. Kaynağı olmayan ifadeler yazarların değerlendirmesi olarak işaretlenmiştir.

| Katman | İhtiyaçlar | Yurt dışına taşınabilir mi? |
|---|---|---|
| Krizin doğrudan yol açtığı | Ağır uzuv yaralanması, ampütasyon, omurilik yaralanması, beyin yaralanması, yanıklar, böbrek yetmezliğiyle seyreden ezilme yaralanması, yüz ve çene yaralanması, göz yaralanması, göğüs, karın ve pelvis yaralanması, salgında kritik hastalık, hastane sonrası iyileşme | Çoğunlukla ilk günler veya haftalardan sonra, hasta stabil olduğunda |
| Krizin kestiği tedaviler | Kanser, uzun süreli diyaliz, kalp hastalığı, doğumsal hastalık, kan hastalığı | Evet, hasta yolculuğa hazırlanabiliyorsa |
| Uzun krizde rutin bakım | Artık ülkesinde alınamayan olağan tedaviler | Evet. Olağan anlamda sağlık turizmi yalnızca bu katmandır |
| Yerinde kalan | Acil bakımın ilk saatleri, uzun süreli ilaç tedavileri, ruh sağlığı hizmetleri, doğum ve yenidoğan bakımı | Hayır |

İlk iki katmandaki kişiler turist değil, hastadır. Bu nedenle çalışmada turistlerden değil, sağlık turizminin altyapısından söz edilmektedir.

## Model

Motor, bir yıl boyunca günlük adımla çalışan, stokastik ve kapasite kısıtlı bir kompartman ağ modelidir. Bütün analizler ve harita aynı dosyayı, `src/engine.js` dosyasını kullanmaktadır.

**Yerler.** Türkiye'nin illeri, seçilebilen 178 ülke ve Türkiye içindeki bir afet için yurt içi düğüm. Bir sağlık tesisinin uluslararası hasta tedavi edebilmesi için Sağlık Bakanlığından yetki belgesi alması gerekir. Bu nedenle hastalar yalnızca yetkili hastanesi olan illere gitmektedir: Aralık 2024'teki 650 hastane sayımına göre 81 ilin 60'ı. Diğer 21 ile, birim açılana kadar hasta gönderilmez. Kural ve sınırları [`docs/course_of_years.md`](docs/course_of_years.md) dosyasındadır.

**Ülkelerin ortak parametreleri.** Her ülke aynı biçimde tanımlanmaktadır: Nüfus, 1.000 kişi başına hastane yatağı, insani gelişme endeksi, 65 yaş ve üzeri nüfusun payı, diyabet prevalansı, Türkiye ile kara sınır kapıları ve seyahat süresi. Kriz bu parametrelerden ve geçmiş olaylara ilişkin yayımlanmış sayılardan kurulur. Kurallar [`docs/scenario_rules.md`](docs/scenario_rules.md) dosyasındadır.

**Bakım hatları.** Yoğun bakım, travma ve rekonstrüksiyon, diyaliz, onkoloji, yatarak rehabilitasyon ve ara bakım. Her hatta yatış süreleri Erlang dağılımını izler, bir sonraki hattı bekleyen hasta yatağı işgal etmeyi sürdürür. Her hattaki sevkler, yayımlanmış yaralanma ve sevk örüntüleriyle 17 ihtiyaca ayrılmaktadır.

**Rezerv.** Yetkili tesislerdeki, %85 güvenli doluluğa kadar sayılan atıl yataklar, ödeme yapan hastaların kullandığı yatakların serbest bırakılan bir payı, rehabilitasyon hastanesi yatakları, hemodiyaliz kapasitesi, radyoterapi kapasitesi ve ara bakım için termal ve otel yatakları.

**Hastaların Türkiye'ye gelişi.** Günlük çıkış izni, kara koridorları, ortak hava kapasitesi, vaka koordinatörleri, ardından kapasiteye ve seyahat süresine göre yerleştirme.

**Yılların seyri.** Yatak, yoğun bakım yatağı ve uzman hekim sayıları her ilin 2015-2024 eğilimini, yıldan yıla sönümlenerek izlemektedir. Nüfus ve yaşlanma TÜİK ana senaryosuna dayanmakta, yatağa yurt içi talep de bunlarla birlikte artmaktadır. Neler yapılabileceğini üç gelişim yolu göstermektedir. Denklemler ve bütün hedefler [`docs/course_of_years.md`](docs/course_of_years.md) dosyasındadır.

**Şehirlerin hazırlığı.** Her şehir, her ihtiyaç için TOPSIS ile derecelendirilmektedir. Bu amaçla uzmanlaşmış bakım, genel kapasite, turizm tesisleri, erişim ve mevcut sağlık turizmine ilişkin 20 gösterge kullanılmaktadır. Ayrıntılar [`docs/city_readiness.md`](docs/city_readiness.md) dosyasındadır.

**Analiz.** Parametre belirsizliği ve Poisson sevk gürültüsü üzerinden senaryo başına 2.000 Monte Carlo koşusu, SALib ile Sobol indeksleri, sınırların tek tek kaldırılması, politika paketleri, doygunluk testleri ve açgözlü merkez seçimi. Kütle dengesi, uç koşullar, monotonluk ve yeniden üretilebilirlik `tests/test_engine.js` dosyasında sınanmaktadır.

## Sonuçlar

Aşağıda altı varsayımsal referans senaryo yer almaktadır. Çıkış noktaları numaralı konumlardır ve hiçbir ülkeyi temsil etmez. 2.000 koşunun ortancası, 5. ve 95. yüzdeliklerle birlikte verilmiştir.

| Senaryo | Sevklerin kabul edilme oranı | Ortalama bekleme, gün |
|---|---|---|
| Komşu ülkede deprem | %96 (91-98) | 20 (9-54) |
| Silahlı çatışma, açık koridor | %72 (55-91) | 101 (51-153) |
| Silahlı çatışma, kısıtlı çıkış | %20 (8-33) | 183 (152-216) |
| Bölgesel salgın | %88 (72-96) | 14 (7-37) |
| Yurt dışı çatışmayla birlikte Marmara depremi | %72 (54-90) | 65 (33-99) |
| Uzak krizler | %72 (42-87) | 105 (59-170) |

**İhtiyaca göre, referans koşu.** Kabul edilen / sevk edilen hasta, yalnızca temel ihtiyaçlar.

| İhtiyaç | Silahlı çatışma, açık koridor | Komşu ülkede deprem | Bölgesel salgın |
|---|---|---|---|
| Ağır uzuv yaralanması ve rekonstrüksiyon | 2.273 / 2.456 | 1.198 / 1.228 | - |
| Ampütasyon ve uzuv protezi | 989 / 1.061 | 262 / 266 | - |
| Omurilik yaralanması | 270 / 289 | 65 / 65 | - |
| Travmatik beyin hasarı | 278 / 330 | 62 / 65 | - |
| Ağır yanıklar | 215 / 252 | 20 / 21 | - |
| Böbrek yetmezliğiyle seyreden ezilme yaralanması | - | 96 / 139 | - |
| Yüz ve çene yaralanması | 99 / 108 | 20 / 21 | - |
| Göz yaralanması ve göz hastalığı | 47 / 51 | 10 / 11 | - |
| Göğüs, karın ve pelvis yaralanması | 499 / 572 | 173 / 184 | - |
| Salgında kritik hastalık | - | - | 185 / 300 |
| Hastane sonrası hemşirelik ve iyileşme | 385 / 412 | 400 / 401 | 1.197 / 1.200 |
| Kanser tedavisi | 1.196 / 3.300 | - | - |
| Uzun süreli diyaliz | 274 / 330 | - | 499 / 600 |

**Potansiyel, referans koşu.** "Gözlenen payla" sütunu, belgelenmiş bir tıbbi tahliye programında olduğu gibi (4.895 hastanın 430'u) sevklerin %9'unun Türkiye'ye geldiğini varsaymaktadır. Bakım ve nakil maliyet üzerinden değerlenmiştir. Marmara senaryosunda sayılar yalnızca yabancı hastaları kapsamaktadır.

| Senaryo | Sevk edilen | Tedavi edilebilecek | Gözlenen payla | Bakım ve nakil | Refakatçi |
|---|---|---|---|---|---|
| Komşu ülkede deprem | 2.400 | 2.308 | 203 | 20,1 milyon USD | 2.631 |
| Silahlı çatışma, açık koridor | 9.161 | 6.526 | 757 | 61,2 milyon USD | 7.439 |
| Silahlı çatışma, kısıtlı çıkış | 9.161 | 1.727 | 152 | 18,2 milyon USD | 1.969 |
| Bölgesel salgın | 2.100 | 1.881 | 165 | 12,1 milyon USD | 2.145 |
| Yurt dışı çatışmayla birlikte Marmara depremi | 9.161 | 6.494 | 757 | 61,6 milyon USD | 7.404 |
| Uzak krizler | 11.561 | 8.336 | 926 | 76,5 milyon USD | 9.503 |

Tam tablolar `results/summary.md`, `results/needs_by_scenario.csv` ve `results/potential_by_scenario.csv` dosyalarındadır.

## 2027'den 2047'ye

Aynı varsayımsal kriz, Türkiye değişirken her yıl yeniden çalıştırılmaktadır. Tabloda sevklerin kabul edilme oranı, model parametreleri, eğilim sönümlemesi, yaşlanma ve ödeme yapan hasta artışı üzerinden yapılan 300 koşunun 5. ve 95. yüzdelikleriyle verilmiştir.

| Senaryo | 2027 | 2047, mevcut seyir | 2047, planlı genişleme | 2047, iddialı program |
|---|---|---|---|---|
| Komşu ülkede deprem | %96 (92-98) | %96 (91-98) | %97 (94-99) | %98 (95-99) |
| Silahlı çatışma, açık koridor | %72 (54-91) | %75 (58-95) | %82 (63-97) | %93 (70-98) |
| Silahlı çatışma, kısıtlı çıkış | %19 (9-34) | %19 (9-35) | %26 (13-47) | %33 (16-57) |
| Bölgesel salgın | %90 (72-96) | %90 (73-96) | %92 (78-97) | %94 (80-98) |
| Yurt dışı çatışmayla birlikte Marmara depremi | %72 (54-90) | %75 (58-95) | %82 (64-97) | %92 (70-98) |
| Uzak krizler | %73 (42-88) | %75 (49-92) | %82 (67-95) | %91 (73-96) |

Kısıtlı çıkışta olduğu gibi sınırı çıkış izinleri belirlediğinde Türkiye'nin kendi yatırımlarının etkisi sınırlı kalmakta, çıkış izinleri her dönemde ana sınır olmayı sürdürmektedir. İki programda 15 il birim açmaktadır. Altı il, bugün yetki belgesi olan en küçük ilin altında kaldığı için kendiliğinden birim açmamakta, dolayısıyla model hiçbir zaman 81 ile ulaşmamaktadır. Tam tablolar `results/outlook_by_year.csv` ve `results/outlook.json` dosyalarındadır.

## Veriler ve sınırlar

Ülke parametreleri, Birleşmiş Milletler, Dünya Bankası, OECD, UNDP ve Uluslararası Diyabet Federasyonu verilerine dayanan ve Our World in Data tarafından derlenen ulusal ortalamalardır. Türkiye'ye ilişkin yatak, yoğun bakım, doluluk ve iş gücü verileri, Sağlık Bakanlığının 2015-2024 yıllıklarından alınan il düzeyindeki verilerdir. Kaynaklar ve uyarılar [`data/SOURCES.md`](data/SOURCES.md) dosyasında, dayanaklarıyla birlikte 158 parametrenin tamamı [`docs/parameters.md`](docs/parameters.md) dosyasında yer almaktadır.

Hangi illerin hasta kabul edebileceği yalnızca bölge düzeyinde bilinmektedir. Bakanlığın yetkili tesis listesi otomatik araçlarla okunamamıştır. Hasta kabul eden 60 ilin 44'ü yayımlanmış kaynaklarda adı geçen illerdir, 16'sı bölgesel sayıdan çıkarılmıştır. Her şehir panelinde bu durum belirtilmekte, liste tek bir yerden değiştirilebilmektedir. İllere göre sağlık turisti payları, yetkili yataklar, rehabilitasyon yatakları ve onkoloji yerleri ulusal toplamlardan üretilmiş tahminlerdir. Yanık üniteleri, rehabilitasyon hastaneleri, protez atölyeleri veya pediatri merkezleri için il düzeyinde bir listeye ulaşılamamıştır.

Kanıtlar eşit düzeyde değildir. Bazı ihtiyaçlara ilişkin veriler sınırlıdır, hiçbir kaynak nakil zamanlarını ihtiyaca göre gün cinsinden vermemektedir, birçok klinik yol payı, maliyet ve devreye alma oranı varsayım olarak belirtilmiştir. Sağlık turistlerine ilişkin, uyruğa veya tedaviye göre ulusal bir sayıma ulaşılamamıştır. Bütün sevkler, varsayılan olarak bir stres testi şeklinde Türkiye'ye yönlendirilir, oysa uygulamada bu hastaları birden çok ülke paylaşmaktadır. 2027 sonrasındaki eğilimler, yaşlanma etkileri ve program hedefleri belirtilmiş varsayımlardır. Ülke profilleri ve krizin kendisi yıllar boyunca sabit tutulmaktadır.

Kaynakçalarda kaynakların tam başlıkları korunmuştur. Bir atfın kaynakla örtüşmesi gerektiğinden bu başlıkların bazılarında gerçek yer adları geçmektedir. Sonuçlar, belirtilen varsayımlar altında seçenekleri karşılaştırmaktadır. Bunlar öngörü niteliği taşımaz ve tek tek hastalara ilişkin kararlara yön vermemelidir.

## Çalıştırma

Komutlar yukarıdaki [Running it](#running-it) bölümünde verilmiştir. `index.html` tek başına çalışır. Yayımlamak için GitHub Pages ana dal ve kök klasör için etkinleştirilmelidir.

## İlgili bildiri

> Köse, G. ve Köse, U. (2026). Health Tourism Infrastructure as a Cross-Border Healthcare Reserve in Extraordinary Situations: A Province-Level Simulation and 2047 Projection for Türkiye. *INHSC2026, 5. Uluslararası / 8. Ulusal Sağlık Hizmetleri Kongresi*, 13-14 Kasım 2026, Isparta, Türkiye.

Bildiri özeti [`docs/abstract_INHSC2026.md`](docs/abstract_INHSC2026.md) dosyasındadır.

---

## Acknowledgements / Teşekkür

The authors acknowledge the open statistics of the Ministry of Health of Türkiye, the Türkiye Sağlık İstatistikleri Arşivi compiled by E. Kaya, Natural Earth, the authors of SALib, and Tabler Icons by Paweł Kuna (MIT License).

Yazarlar, Türkiye Cumhuriyeti Sağlık Bakanlığının açık istatistiklerine, E. Kaya tarafından derlenen Türkiye Sağlık İstatistikleri Arşivine, Natural Earth'e, SALib geliştiricilerine ve Paweł Kuna tarafından hazırlanan Tabler Icons'a (MIT Lisansı) teşekkür eder.

## License / Lisans

MIT, see [LICENSE](LICENSE).

---

<p align="center">
  Gamze Köse &nbsp;&amp;&nbsp; Prof. Dr. Utku Köse<br>
  Süleyman Demirel University, Isparta, Türkiye
</p>
