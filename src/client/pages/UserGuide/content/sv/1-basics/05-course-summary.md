---
description: Nyckeltalen för kursenkäterna på dina egna kurser eller på ditt utbildningsprograms kurser.
---

# Kurssammanfattning

Kurssammanfattningen samlar statistiken för kursenkäterna: medeltalen för skalfrågorna på universitetsnivå, antalet studerande som svarat och antalet motresponser som getts. Lärarna ser sina egna kurser och utbildningsprogrammens personal kurserna i sina utbildningsprogram och fakulteter.

Öppna [[navBar:courseSummary]] i menyn högst upp. Den har två vyer:

- [[courseSummary:myCourses]]: kurserna där du är ansvarig lärare eller lärare, per organisation.
- [[courseSummary:myOrganisations]]: de utbildningsprogram, fakulteter och andra organisationer som du har [rättigheter](/guide/roles#organisation-rights) till, och deras studieavsnitt. (Visas endast om du har sådana rättigheter.)

Utbildningsprogrammets egen sammanfattning finns på utbildningsprogrammets sida, på fliken [[organisationSettings:summaryTab]], och där ingår också utbildningsprogrammets egna skalfrågor. Se [Utbildningsprogrammets sida](/guide/programme-page#programme-page).

Så navigerar du i hierarkin: öppna en organisation för att se dess studieavsnitt, och klicka på ett studieavsnitt för att öppna alla dess genomföranden. Genom att klicka på ett genomförande kommer du till svaren på dess enkät.

[[video:course-summary]]

## Vad siffrorna visar {#figures}

Kolumnerna:

- _En kolumn för varje skalfråga på universitetsnivå_ (och på utbildningsprogrammets sida för var och en av dess skalfrågor): svarens medeltal på skalan 1–5. Svaret "ingen uppgift" räknas inte med. Du ser frågan genom att föra muspekaren över kolumnens rubrik.
- _Arbetsmängd_: en pil visar om studerandena upplevde arbetsmängden som tung eller lätt i förhållande till studiepoängen. Du ser hur svaren fördelade sig genom att föra muspekaren över pilen.
- [[courseSummary:feedbackCount]]: svar / anmälda studerande.
- [[courseSummary:feedbackPercentage]]: andelen studerande som svarat.
- [[courseSummary:feedbackResponsePercentage]]: andelen kursgenomföranden som har fått motrespons.
- [[courseSummary:censoredCount]]: svar som kursens ansvariga lärare eller utbildningsprogrammets admins har gömt. Visas endast för organisationens admins.

Medeltalets färg och nyans visar hur högt det är: låga medeltal är röda, medelhöga gula och höga gröna. En blek cell betyder att det inte finns några svar.

Siffrorna för ett studieavsnitt, ett utbildningsprogram eller en fakultet räknas ut från svaren på alla dess kursgenomföranden, inte som ett medeltal av medeltal.

Kolumnerna är de frågor på universitetsnivå som var i bruk i början av den valda perioden. Om kursens enkät hade andra frågor visas en informationsikon i stället för medeltal på kursens rad.

Genom att välja en kolumnrubrik kan du sortera raderna enligt den. Knappen [[courseSummary:tableView]] visar samma siffror som en enda tabell, och knappen [[courseSummary:treeView]] återställer trädvyn. I vyn [[courseSummary:myOrganisations]] kan du fästa de organisationer du följer oftast överst med [[courseSummary:pinOrganisation]].

## Välja tidsperiod {#filters}

Som standard visar sammanfattningen det pågående läsåret. Välj ovanför raderna:

- [[courseSummary:year]]: ett läsår från och med 2020.
- [[courseSummary:semester]]: läsårets höst- eller vårtermin.
- [[courseSummary:period]]: en undervisningsperiod under terminen.

Ett kursgenomförande ingår om kursens datum i Sisu infaller under den valda tiden. När enkäten var öppen påverkar inte detta.

I menyn bredvid tidsperioden väljer du om Öppna universitetets kurser ingår: [[courseSummary:includeOpenUni]], [[courseSummary:excludeOpenUni]] eller [[courseSummary:onlyOpenUni]].

## Ladda ner siffrorna {#download}

1. Välj tidsperiod.
2. Välj [[common:exportXLSX]] högst upp på sidan.
3. Välj vad filen ska innehålla: [[generateReport:organisations]], [[generateReport:courseUnits]] och/eller [[generateReport:courseRealisations]]. Var och en hamnar på en egen flik.
4. Välj [[common:exportXLSX]].

[[video:course-summary-download]]

En fil som laddas ner från kurssammanfattningens sida innehåller dina organisationer och dina egna kurser. En fil som laddas ner från utbildningsprogrammets flik [[organisationSettings:summaryTab]] innehåller endast det utbildningsprogrammet, och också dess egna frågor.

Svaren på en enskild enkät laddas ner på dess flik [[feedbackTargetView:feedbacksTab]]; se [Ladda ner svaren](/guide/results#download).

## Varför en kurs saknas {#missing-courses}

Kurssammanfattningen omfattar _endast kursenkäter_: mellanrespons och programenkäter ingår inte. En kurs kan saknas eftersom:

- _Siffrorna har inte uppdaterats ännu._ Siffrorna för studieavsnitt, utbildningsprogram och fakulteter räknas om varje natt, så nya svar och ny motrespons syns där följande dag.
- _Dess enkät har inte öppnats ännu._ Enkäter som inte har öppnats räknas inte med.
- _Den har inga studerande i Norppa._
- _Den hör till en annan period._ Perioden bestäms av kursens datum i Sisu, inte av när enkäten var öppen.
- _Den hör till en annan organisation i Sisu._ En organisations sammanfattning innehåller de kurser vars studieavsnitt eller genomförande hör till organisationen i Sisu. Ett studieavsnitt som är kopplat till utbildningsprogrammet endast via sitt genomförande är märkt med texten [[common:partiallyResponsible]].
- _Du är inte dess lärare i Sisu._ [[courseSummary:myCourses]] visar endast de kurser där du är ansvarig lärare eller lärare.

Om kursen fortfarande saknas några dagar efter att dess uppgifter har rättats i Sisu, [kontakta supporten](/guide/help#support).
