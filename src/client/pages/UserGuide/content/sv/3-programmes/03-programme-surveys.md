---
description: Utbildningsprogrammets eller fakultetens egna enkäter, till exempel terminsrespons: skapa en enkät, svarande och ansvariga personer.
---

# Programenkäter

En programenkät är en enkät på "organisationsnivå". En sådan enkät kan göras på utbildningsprogram- eller fakultetsnivå, och den byggs upp från början av programmet själv, för utvalda studerande. Till exempel: terminsrespons, respons på en studieinriktning eller gemensam respons för flera kurser. En sådan enkät innehåller som standard inga frågor på universitets- eller programnivå, men du kan lägga till dem om du vill.

Programenkäter kan skapas av programmets admins (utbildningsprogrammets direktör eller korrespondent för responsen). Tekniskt fungerar de som kursenkäter: öppettider, frågor, delning, svar och motrespons. Enkätens [ansvariga personer](#responsible-persons) har motsvarande rättigheter som en ansvarig lärare, så de närmare anvisningarna är desamma som under _Ansvarig lärare_: [Frågor](/guide/questions), [Samla in svar](/guide/collecting-answers), [Resultat](/guide/results) och [Motrespons](/guide/counter-feedback).

## Skapa en programenkät {#create}

1. Öppna fliken [[organisationSettings:organisationSurveysTab]] på [utbildningsprogrammets sida](/guide/programme-page#programme-page) (på en fakultets sida [[organisationSettings:organisationFacultySurveysTab]]).
2. Välj [[organisationSurveys:addSurvey]].
3. Ge enkäten ett namn under [[organisationSurveys:newSurveyName]] på minst ett språk.
4. Välj datum under [[organisationSurveys:startDate]] och [[organisationSurveys:endDate]]. Enkäten öppnas kl. 0.00 och stängs kl. 23.59 den sista dagen. Den kan vara öppen så länge som behövs, till exempel en hel termin.
5. Lägg till [[organisationSurveys:responsibleTeachers]] (se [Ansvariga personer](#responsible-persons)). (Den som skapar enkäten har automatiskt en administratörs rättigheter.)
6. Lägg till de svarande (se [Svarande](#respondents)).
7. Välj [[common:save]]. Norppa öppnar den nya enkätens flik [[feedbackTargetView:surveyQuestionsTab]].
8. Lägg till frågorna som i vilken enkät som helst; se [Redigera frågorna](/guide/questions#edit-questions). [[editFeedbackTarget:copyFromCourseButton]] kopierar frågor från programmets andra enkäter, och [[editFeedbackTarget:copyUniversityQuestions]] lägger till frågorna på universitetsnivå om du vill ha med dem.

[[video:programme-survey]]

Klart! Enkäten öppnas av sig själv på öppningsdagen (du kan ännu redigera frågorna innan den öppnas, om du vill).

> **Obs!** Studerande får ingen e-post när en programenkät öppnas. När enkäten är öppen kan du skicka dem en [påminnelse via e-post](#reminders) eller dela enkätens länk på fliken [[feedbackTargetView:shareTab]].

## Svarande {#respondents}

Bara de studerande som lagts till i enkäten kan svara på den. De ser enkäten på sidan [[navBar:myFeedbacks]] medan den är öppen. Du kan lägga till studerande på två sätt, som också kan kombineras:

- _Studentnummer_: klistra in eller skriv dem i fältet [[organisationSurveys:students]], åtskilda med kommatecken, semikolon, mellanslag eller radbyten (till exempel en kolumn kopierad från Excel). När du sparar markerar Norppa med rött de studentnummer som den inte känner igen, och sparar inte förrän du har rättat eller tagit bort dem.
- _Kursernas studerande_: välj period bredvid [[organisationSurveys:addCourses]], sök programmets kursgenomföranden med namn eller kod och välj dem (vid varje kurs visas antalet studerande).

Kursernas studerande kopieras till enkäten när du sparar; listan följer inte senare ändringar i anmälningarna. Om du vill lägga till studerande som anmält sig senare öppnar du [[organisationSurveys:editSurvey]] och sparar på nytt: de valda kursernas nuvarande studerande läggs till.

## Ansvariga personer {#responsible-persons}

Enkätens [[organisationSurveys:responsibleTeachers]] får en ansvarig lärares rättigheter till enbart den här enkäten: de kan redigera frågorna innan enkäten öppnas, ändra inställningarna, se alla svar och fliken [[feedbackTargetView:studentsWithFeedbackTab]], skicka påminnelser via e-post och skriva motrespons. På enkätens sida räknas de upp under rubriken [[feedbackTargetView:administrativePersons]]. De hittar enkäten på sidan [[navBar:myCourses]] under [[teacherView:organisationSurveys]].

När du lägger till en ansvarig person skriver du minst fem tecken av personens namn eller e-postadress i fältet och väljer personen. Sökningen hittar bara universitetets personal; om någon inte hittas kan du be personen logga in i Norppa en gång. Det måste alltid finnas minst en ansvarig person.

Programmets admins (utbildningsprogrammets direktör och korrespondent för responsen) kan redigera enkäten och se dess svar även om de inte är ansvariga personer. [Motrespons](/guide/counter-feedback) kan ändå bara skrivas av de ansvariga personerna.

## Redigera en programenkät {#edit}

Öppna enkäten på sidan [[navBar:myCourses]] under [[teacherView:organisationSurveys]], eller på programmets flik [[organisationSettings:organisationSurveysTab]] med knappen [[organisationSurveys:viewFeedback]].

- _Namn, datum, ansvariga personer och svarande_: välj [[organisationSurveys:editSurvey]] på enkätens sida, gör ändringarna och välj [[common:save]]. Det går före, under och efter responsperioden.
- _Frågor_: fliken [[feedbackTargetView:surveyQuestionsTab]] under fliken [[feedbackTargetView:surveyTab]], tills enkäten öppnas. Därefter är frågorna låsta.

Om du vill öppna enkäten genast anger du dagens datum som startdatum: enkäten öppnas genast (studerande får ingen automatisk e-post om att den har öppnats). En avslutad enkät kan öppnas på nytt genom att du flyttar fram slutdatumet.

### Skicka en påminnelse via e-post {#reminders}

Norppa skickar inte själv någon e-post till studerande om en enkät på organisationsnivå. När enkäten är öppen kan en ansvarig person eller programmets admin [skicka en påminnelse via e-post](/guide/collecting-answers#send-reminder) på enkätens flik [[feedbackTargetView:shareTab]] till de studerande som ännu inte har svarat.

## Resultat {#results}

Svaren samlas på enkätens flik [[feedbackTargetView:feedbacksTab]] och kan granskas från och med öppningsdagen. Väg: programmets flik [[organisationSettings:organisationSurveysTab]] -> (välj enkäten och) -> [[organisationSurveys:viewResults]]. Svarsdelen fungerar tekniskt som i kursenkäterna; se [Resultat](/guide/results).

När enkäten har avslutats kan de ansvariga personerna skriva motrespons till studerande. Om enkäten har fått svar men ingen motrespons har skrivits, får de ansvariga personerna en påminnelse via e-post dagen efter att enkäten avslutats, och på sidan [[navBar:myCourses]] syns [[teacherView:feedbackResponseMissing]]. Se [Motrespons](/guide/counter-feedback).

Programenkäterna ingår inte i [kurssammanfattningen](/guide/course-summary).

### Ta bort en programenkät {#remove}

En programenkät kan tas bort så länge ingen har svarat på den: välj [[organisationSurveys:remove]] på enkätens kort på programmets flik [[organisationSettings:organisationSurveysTab]] och bekräfta. När enkäten har fått svar finns knappen inte längre; om du vill att det inte ska gå att svara på enkäten ändrar du dess datum.
