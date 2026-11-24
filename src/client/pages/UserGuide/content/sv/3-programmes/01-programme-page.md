---
description: Utbildningsprogrammets eller fakultetens sida, där du följer responsen på dess kurser.
---

# Utbildningsprogrammets sida

Varje utbildningsprogram och fakultet har en egen "instrumentpanel" i Norppa, alltså en sida där du kan följa den respons som samlats in. Programmets admins (direktören och korrespondenterna för responsen) kan justera [inställningarna](/guide/settings) och skapa egna [programspecifika frågor som ställs på alla programmets kurser](/guide/programme-questions) eller göra egna [programenkäter](/guide/programme-surveys).

## Öppna sidan och dess flikar {#programme-page}

Öppna [[navBar:myProgrammes]] i den övre menyn, eller [[navBar:myOrganisations]] om du har rättigheter även till annat än utbildningsprogram (till exempel en fakultet). Om inget av dem går att välja har du inga rättigheter till något utbildningsprogram; se [Rättigheter i utbildningsprogrammet eller fakulteten](/guide/roles#organisation-rights).

Med läsrättigheter (den snävare rättigheten) ser du:

- [[organisationSettings:summaryTab]]: programmets [kurssammanfattning](/guide/course-summary), där även medeltalen för programmets egna skalfrågor finns med.
- [[organisationSettings:courseRealisationsTab]]: programmets kursgenomföranden under den valda perioden, med deras kurs- och responsperioder, antal svar och ansvariga lärare. Välj en kurs för att öppna dess enkät.
- [[organisationSettings:responsiblesTab]]: programmets lärare och hur många kurser var och en hade under den valda perioden. Listan kan laddas ner med knappen [[common:exportXLSX]].

Med adminrättigheter (den bredare rättigheten: utbildningsprogrammens direktörer, andra som fått adminrättigheter via IAM-grupperna och korrespondenterna för responsen) ser du också:

- [[organisationSettings:settingsTab]]: korrespondenterna för responsen, vem som ser de svarande och på vilka kurser respons samlas in. Se [Utbildningsprogrammets inställningar](/guide/settings).
- [[organisationSettings:openQuestionsTab]]: svaren på de öppna frågorna på alla programmets kurser. Se [Öppna frågor](#open-questions).
- [[organisationSettings:surveyTab]] (på en fakultets sida [[organisationSettings:surveyFacultyTab]]): frågor som läggs till i alla programmets kursenkäter. Se [Frågor på programnivå](/guide/programme-questions).
- [[organisationSettings:organisationSurveysTab]] (på en fakultets sida [[organisationSettings:organisationFacultySurveysTab]]): programmets egna enkäter. Se [Programenkäter](/guide/programme-surveys).

Programmets admins ser alla svar på programmets kurser, medan man med läsrättigheter bara ser svaren på publika frågor; se [Svarens synlighet för olika användare](/guide/anonymity#public-answers).

## Öppna frågor {#open-questions}

På fliken [[organisationSettings:openQuestionsTab]] (endast admins) finns svaren på de öppna frågorna på universitetsnivå och programnivå för alla programmets kurser i en och samma vy, ordnade efter kurs och genomförande. Lärarnas egna frågor finns inte med.

- Välj [[courseSummary:all]] om du vill se alla år, eller [[courseSummary:filter]] om du vill välja läsår, termin eller period. Ett genomförande visas om kursens datum infaller under den valda tiden.
- Via kursens namn kommer du till dess kurssammanfattning och via genomförandets namn till dess svar.
- Mycket korta svar, under fem tecken, lämnas bort.
- Med [[feedbackTargetResults:export]] > [[common:exportPdf]] skriver du ut svaren eller sparar dem som en PDF-fil.

## Kursenkäter som admin {#course-surveys}

Med adminrättigheter (utbildningsprogrammets direktör, korrespondent för responsen) kan du också hantera programmets enskilda kursenkäter. Öppna en enkät genom att välja kursen på fliken [[organisationSettings:courseRealisationsTab]]. Du kan:

- redigera frågorna innan enkäten öppnas; se [Redigera frågorna](/guide/questions#edit-questions)
- gömma öppna svar; se [Gömma öppna svar](/guide/results#hide-answers)
- skicka påminnelser via e-post; se [Skicka en påminnelse](/guide/collecting-answers#send-reminder)
- se vem som har svarat (men inte vem som svarat vad); se [Vem har svarat](/guide/results#who-answered)
- slå på kontinuerlig respons och läsa den; se [Kontinuerlig respons](/guide/during-the-course#continuous-feedback).

Rättigheter i utbildningsprogrammet gör dig inte till lärare på en kurs: för att ändra en kursenkäts datum eller skriva motrespons behöver du rollen ansvarig lärare i Sisu. På samma sätt kan bara ansvariga lärare ändra frågornas synlighet, skapa mellanrespons och svara på kontinuerlig respons.
