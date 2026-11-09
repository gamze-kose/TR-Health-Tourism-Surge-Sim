# Sources for the country table

Accessed 9 November 2026.

`country_indicators.csv` keeps nine columns of the file `owid-covid-latest.csv` in the Our World in Data COVID-19 dataset (https://github.com/owid/covid-19-data). The dataset compiles the values below, as described in its codebook.

| Column | Original source, as given in the codebook |
|---|---|
| `population` | United Nations, Department of Economic and Social Affairs, Population Division, World Population Prospects |
| `aged_65_older` | World Bank World Development Indicators, based on United Nations World Population Prospects |
| `gdp_per_capita` | World Bank World Development Indicators, International Comparison Program, purchasing power parity |
| `hospital_beds_per_thousand` | OECD, Eurostat, World Bank, national government records and other sources, most recent year since 2010 |
| `human_development_index` | United Nations Development Programme |
| `diabetes_prevalence` | World Bank World Development Indicators, from the International Diabetes Federation Diabetes Atlas, 2017 |
| `life_expectancy` | James C. Riley, Clio Infra, United Nations Population Division |

`country_geography.csv` keeps names (English and Turkish), centre coordinates, region and landlocked status from the `countries` dataset by Mohammed Le Doze (https://github.com/mledoze/countries, ODbL).

Hospital beds are missing for 20 countries. They are estimated from the human development index with a log-linear fit on the other countries. A missing development index, share of older people, diabetes prevalence or income is replaced by the median of the subregion. Estimated values are marked in `data/countries.json` under `est` and labelled in the interface.

Road border gates are mapped to Turkish provinces by geography and should be checked against the Ministry of Trade list.
