---
description: Vad din roll på kursen och dina rättigheter i utbildningsprogrammet låter dig göra, och vad du gör om rollen är fel.
---

# Roller och rättigheter

Norppa har olika användarroller. De som gäller kurser kommer direkt från Sisu (ansvarig lärare, lärare, administratör). Dessutom ges tillgång till fakulteternas och utbildningsprogrammens data via IAM-grupper. Dessa kan inte ändras i Norppa. Endast rollen som korrespondent för responsen bestäms i Norppa, i utbildningsprogrammets inställningar, och den ger rättigheter till all respons i utbildningsprogrammet.

## Roller på kursen {#course-roles}

Norppa hämtar varje kursgenomförandes lärare och deras roller från Sisu. På kursens sida i Norppa visas de under rubrikerna [[feedbackTargetView:responsibleTeachers]], [[feedbackTargetView:teachers]] och [[feedbackTargetView:administrativePersons]].

- _Ansvarig lärare_: rollerna "ansvarig lärare" och "kontaktperson" i Sisu. En ansvarig lärare kan
  - redigera enkätens frågor och ändra dess datum
  - läsa alla svar, gömma öppna svar och se vilka som har svarat
  - skicka påminnelser via e-post till studerandena
  - skriva motrespons
  - använda kontinuerlig respons och skapa mellanrespons.
- _Administratör_: rollen administratör i Sisu. En administratör har exakt samma rättigheter som en ansvarig lärare.
- _Lärare_: vilken annan undervisningsroll som helst i Sisu. En lärare ser enkäten i vyn [[common:preview]], kan kopiera enkätens länk på fliken [[feedbackTargetView:shareTab]] och ser endast svaren på publika frågor (se [publika svar](/guide/anonymity#public-answers)). En lärare kan inte redigera enkäten eller skriva motrespons.

Ansvariga lärare och administratörer får också Norppas e-postmeddelanden om enkäten, till exempel påminnelsen innan enkäten öppnas. På kurser som har börjat före 2023 är alla lärare som nämns i Sisu ansvariga lärare.

Samma roller gäller kursens mellanrespons. I en programenkät har de ansvariga personer som utbildningsprogrammet har valt den ansvariga lärarens rättigheter; se [Programenkäter](/guide/programme-surveys).

Instruktionerna för ansvariga lärare och administratörer finns i avsnittet [Ansvarig lärare](/guide/teachers).

## Rättigheter i utbildningsprogrammet eller fakulteten {#organisation-rights}

Rättigheterna till ett utbildningsprogram eller en fakultet kommer från universitetets IAM-grupper. Till exempel får utbildningsprogrammets direktör adminrättigheter till sitt program och ledningsgruppens medlemmar läsrättigheter. Om du har sådana rättigheter visas [[navBar:myProgrammes]] eller [[navBar:myOrganisations]] i menyn.

- _Läsrättigheter_ (Read): utbildningsprogrammets eller fakultetens sida med kurssammanfattning och kurser samt svaren på kursernas publika frågor när enkäterna har stängts.
- _Adminrättigheter_ (Admin): läsrättigheter (se ovan) och dessutom
  - alla svar på kurserna, också svaren på de öppna frågorna på fliken [[organisationSettings:openQuestionsTab]]
  - flikarna [[organisationSettings:settingsTab]], [[organisationSettings:surveyTab]] och [[organisationSettings:organisationSurveysTab]]
  - kursenkäter: redigera frågorna innan enkäten öppnas, gömma öppna svar, skicka påminnelser via e-post och se vilka som har svarat

Rättigheter i utbildningsprogrammet gör dig inte till lärare på en kurs: för att ändra kursenkätens datum eller skriva motrespons behöver du rollen som ansvarig lärare i Sisu.

_Korrespondenter för responsen_ får adminrättigheter till sitt utbildningsprogram. Utbildningsprogrammets admins lägger till dem i Norppa; se [Lägga till en korrespondent för responsen](/guide/settings#feedback-liaison).

Instruktionerna för utbildningsprogrammens personal finns i avsnittet [Utbildningsprogram](/guide/programmes).

## Kontrollera dina rättigheter {#check-your-rights}

- Roller på kursen: öppna kursens sida och se under vilken rubrik ditt namn står. Programenkätens ansvariga personer står under rubriken [[feedbackTargetView:administrativePersons]].
- Rättigheter till utbildningsprogram och fakulteter: klicka på ditt namn uppe till höger och välj [[navBar:userInformation]]. I fönstret visas de [[userInformation:iamGroups]] som påverkar Norppa och under [[userInformation:organisationAccess]] varje organisations kod och dina rättigheter, _Admin_ eller _Read_ (på engelska). Organisationens namn visas när du för muspekaren över koden. Fönstret visar inte roller på kurser.

[[video:check-your-rights]]

## Om din roll är fel {#wrong-role}

- Fel roll på kursen eller du saknas helt från kursen: rollen måste rättas i Sisu. Det gör den person som sköter kursgenomförandet i Sisu, ofta utbildningsprogrammets studieförvaltning. Norppa uppdaterar rollerna varje natt, så ändringen syns följande morgon. Om till exempel en gästföreläsare får de ansvariga lärarnas e-postmeddelanden har hen lagts till i Sisu som ansvarig lärare, kontaktperson eller administratör; att ändra rollen i Sisu till lärare löser saken.
- Rättigheter till utbildningsprogrammet eller fakulteten saknas: IAM-grupperna sköts utanför Norppa. Be ditt utbildningsprograms eller din fakultets förvaltning att lägga till dig i rätt grupp, och logga sedan ut ur Norppa och in igen. Alternativt kan en admin i utbildningsprogrammet lägga till dig som korrespondent för responsen.

Om rollen i Sisu är fel, kontakta universitetets allmänna support på [uni-help@helsinki.fi](mailto:uni-help@helsinki.fi).

Om rollen har ändrats i Sisu och är rätt där, men Norppa ännu efter ett par dagar visar den gamla rollen, kontakta [norppa@helsinki.fi](mailto:norppa@helsinki.fi).
