---
description: När kursenkäten öppnas och stängs, och hur du ändrar dess datum.
---

# Enkätens tidtabell

Norppa skapar kursenkäten automatiskt, och enkäten öppnas och stängs också automatiskt. Läraren behöver inte göra något för att enkäten ska öppnas. Innan den öppnas kan läraren ändå lägga till [egna frågor](/guide/questions) och [ändra datumen](#change-dates).

## När enkäten är öppen {#feedback-period}

Som standard öppnas kursenkäten kl. 00.00 dagen efter kursens sista dag och stängs 14 dagar senare kl. 23.59, så den är öppen i ungefär två veckor. Om kursens sista dag till exempel är den 12 december är enkäten öppen 13–27 december.

Norppa visar både kursens datum (från Sisu): [[feedbackTargetView:coursePeriod]] och enkätens datum: [[feedbackTargetView:feedbackPeriod]].

- Kursens datum i Sisu bestämmer kursenkätens tidtabell. Om kursens datum i Sisu fortsätter efter föreläsningarna, till exempel fram till tentamen, öppnas enkäten senare i motsvarande grad.
- Om kursens datum ändras i Sisu ändras också kursenkätens datum automatiskt.
- Om läraren ändrar enkätens datum manuellt i Norppa påverkar ändringar i Sisu dem inte längre.

Ungefär en vecka innan enkäten öppnas får de ansvariga lärarna och administratörerna ett e-postmeddelande med enkätens datum, en länk för att redigera den och de frågor som lärarna har lagt till så här långt. I meddelandet nämns också om färre än fem studerande har anmält sig till kursen; se [Kurser med färre än fem studerande](/guide/anonymity#small-courses).

## Ändra datumen {#change-dates}

Som ansvarig lärare eller administratör för kursen kan du ändra kursenkätens datum:

1. Välj [[navBar:myCourses]] och sedan kursen.
2. Klicka på [[common:edit]] bredvid [[feedbackTargetView:feedbackPeriod]].
3. Välj datumen under [[editFeedbackTarget:opensAt]] och [[editFeedbackTarget:closesAt]] i fönstret [[feedbackTargetSettings:editPeriodTitle]].
4. Klicka på [[common:save]].

[[video:change-dates]]

Beroende på enkätens status (kommande, öppen, avslutad) kan den ansvariga läraren ändra följande:

- Innan enkäten öppnas kan du ändra start- och slutdatumet. Startdatumet kan inte ligga i det förflutna, och enkäten måste vara öppen i minst ett dygn, så slutdatumet måste vara tidigast dagen efter startdatumet.
- Medan enkäten är öppen kan du bara ändra slutdatumet. Du kan förlänga enkäten, till exempel till tiden efter bedömningen, eller sätta dagens datum som slutdatum, så att enkäten stängs i dag kl. 23.59. Det finns ingen knapp som stänger enkäten genast.
- När enkäten har stängts kan datumen inte längre ändras. Bara supporten kan öppna en stängd kursenkät på nytt; se [Support](/guide/help#support).

> **Obs!** Mellanrespons och programenkäter är inte kopplade till Sisu, och deras datum ändras på ett annat sätt, oberoende av enkätens status. Se [Mellanrespons](/guide/during-the-course#interim-feedback) och [Redigera en programenkät](/guide/programme-surveys#edit).

## Öppna enkäten genast {#open-now}

(Obs! Lägg till dina egna frågor först: när enkäten är öppen kan de inte längre ändras.)

1. Välj [[navBar:myCourses]] och sedan kursen.
2. Klicka på [[common:edit]] bredvid [[feedbackTargetView:feedbackPeriod]].
3. Klicka på [[editFeedbackTarget:openImmediately]] i fönstret.
4. Bekräfta genom att välja [[editFeedbackTarget:openFeedbackImmediatelyDialogConfirm]].

Enkäten öppnas genast, och studerandena får länken per e-post direkt.

Om du i stället sätter dagens datum som startdatum och sparar, ber Norppa också om bekräftelse, och kursenkäten öppnas genast. Studerandena får då sitt e-postmeddelande i det dagliga utskicket kl. 11.15, eller följande dag om dagens utskick redan har gått.

## Vilka kurser får en enkät {#which-courses}

En kursenkät skapas automatiskt för kurser vars genomförandetyp i Sisu är någon av följande:

- laboratoriearbete
- nätundervisning
- fältkurs
- projekt
- föreläsningar
- smågruppsundervisning
- seminarium
- flerformsundervisning
- närundervisning
- distansundervisning
- självständigt arbete i projektform, men bara på Språkcentrums kurser.

<!-- Sisu-koder: urn:code:course-unit-realisation-type:teaching-participation-lab, -online, -field-course, -project, -lectures, -small-group, -seminar, -blended, -contact, -distance; för Språkcentrum (hy-org-1000003401) också independent-work-project. Källa: validRealisationTypes, norppa-updater, updateCoursesAndTeacherFeedbackTargets.js. -->

För andra genomförandetyper, såsom tentamina, lärdomsprov, essäer, självständigt arbete och praktik, kan en kursenkät öppnas separat via supporten: [norppa@helsinki.fi](mailto:norppa@helsinki.fi).

Det blir inte heller någon enkät om genomförandet i Sisu är ett utkast, inställt eller arkiverat, eller om det inte är kopplat till något studieavsnitt.

- Ett genomförande har bara en enkät, även om det hör till flera studieavsnitt.
- En kursenkät kan inte tas bort, men utbildningsprogrammet kan [stänga av responsen](/guide/settings#disable-feedback) för ett studieavsnitt.
- Om du vill ha respons på något annat än en kurs, till exempel en tentamen eller flera kurser tillsammans, kan utbildningsprogrammet skapa en [programenkät](/guide/programme-surveys).

## Uppdateringar från Sisu {#sisu-updates}

Norppa uppdaterar sina uppgifter från Sisu varje natt:

- Nya kurser och deras enkäter, lärare, roller och kursernas datum. En ändring som görs i Sisu syns i Norppa följande morgon.
- Grupper som definierats i Sisu (undervisningsgrupper) blir grupper inom samma enkät, inte separata enkäter. Se [Grupper](/guide/questions#groups).

Studerandenas anmälningar uppdateras oftare: en ny anmälan syns i Norppa vanligen inom ett par timmar. Bara godkända anmälningar räknas. En studerande vars anmälan annulleras tas bort följande natt, om hen inte redan har fått enkätens länk eller redan har svarat.
