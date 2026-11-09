# How a hypothetical scenario is built

The user chooses a country, a type of crisis and its size. No scenario describes a real event. Figures published on past events enter only as numbers. Every number below is a parameter that can be changed in the Settings tab, and its basis is listed in [`parameters.md`](parameters.md).

## Country parameters

| Parameter | Source, as compiled by Our World in Data |
|---|---|
| Population | United Nations, World Population Prospects |
| Hospital beds per 1,000 people | OECD, Eurostat, World Bank and national records. Estimated from the human development index for 20 countries |
| Human development index | United Nations Development Programme |
| Share of people aged 65 or over | World Bank, based on United Nations data |
| Diabetes prevalence | International Diabetes Federation, via the World Bank |
| Centre point | `countries` dataset by Mohammed Le Doze |
| Road border gates with Türkiye | Mapped by geography to Turkish provinces. To be checked against the Ministry of Trade list |

Palestine, Israel, Syria, Ukraine and Russia are not offered, so that no scenario can repeat a recent war. Türkiye is the destination, and can be added only as a simultaneous Marmara earthquake.

## Need for care abroad

A country with fewer hospital beds is expected to send more severe cases abroad. The share of cases that need care abroad is multiplied by

    capacity gap = (reference beds / beds in the country) ^ 0.5, limited to between 0.5 and 2

The reference is 2.81 beds per 1,000 people. The exponent and limits are assumptions.

## Size of the crisis

| Crisis | Limited | Major | Extreme | Upper limit |
|---|---|---|---|---|
| Earthquake or sudden disaster, people injured | 20,000 | 80,278 | 300,000 | 3% of the population |
| Armed conflict, people injured a day | 45 | 180 | 360 | 3% of the population a year |
| Armed conflict, people cut off from care | 500,000 | 2,100,000 | 5,000,000 | The population |
| Epidemic, critical cases per million people | 175 | 351 | 702 | None |

In an armed conflict, the number of patients cut off from treatment follows the people cut off from care:

    dialysis patients = people cut off / 1,000,000 x 524 x (diabetes in the country / 10.59)
    cancer patients = people cut off / 1,000,000 x 5,238 x (share aged 65 or over / 3.04) ^ 0.5

## Geography and exit

- Countries with road border gates use ambulance seats at those gates. Others share the air seats.
- Long flights leave fewer aircraft hours for medical transfers: the air seats of a country are multiplied by 20 / (2 x flight hours + 4), with an upper limit of 1.
- In an armed conflict the user chooses the exit: open (1), limited (0.5) or almost closed (0.02). The value multiplies the daily clearance rate.

## Key findings under the map

After a run, these findings are worked out from the same model.

- **Can Türkiye respond well?** Strong when at least 85% of referred patients are admitted and the average wait is 45 days or less. Limited when fewer than 50% are admitted. Partial otherwise. These thresholds are presentation choices.
- **Where is the greatest potential?** The three needs with the most admitted patients.
- **What holds the response back?** Each limit (exit permits, transport seats, case coordinators, bed and treatment capacity, rehabilitation staff) is removed in turn. The limit whose removal admits the most patients is shown, unless the gain is below 1% of referrals.
- **Which cities should be supported?** The need with the largest shortfall is taken. The six cities most ready for that need are tested one at a time, each with a leading centre for that need in the chosen year or in 2032, whichever is later. A city without a unit is tested with a new unit and is marked as needing one first. The three cities with the largest gains are shown. If the best gain is below 1% of referrals, the cities that receive the most patients are shown instead.
- **And over 20 years?** The share admitted in 2047 on each development path. The method is in [`course_of_years.md`](course_of_years.md).
- **What your changes did.** Shown only if the user has changed a city. Patients admitted and average wait, with the default values and with the changes.

## Reference runs

The batch analyses in `analysis/` and the figures in the README use six hypothetical reference scenarios. Their origins are numbered locations (`O01` to `O27`) and do not depend on the choices above, so that the results reported in the congress abstract can be reproduced.
