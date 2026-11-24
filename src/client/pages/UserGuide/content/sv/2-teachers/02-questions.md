---
description: Lägga till egna frågor innan enkäten öppnas, frågetyperna och de fasta frågorna.
---

# Frågor

En kursenkät har alltid frågorna på universitetsnivå och eventuellt frågor från utbildningsprogrammet, som du inte kan ändra; se [Fasta frågor](#fixed-questions). Utöver dem kan du lägga till egna frågor tills enkäten öppnas. Mellanrespons och programenkäter har bara egna frågor.

## Redigera frågorna {#edit-questions}

Du kan redigera frågorna tills kursenkäten öppnas. Därefter syns fliken [[feedbackTargetView:surveyQuestionsTab]] inte längre, och frågorna kan inte längre redigeras.

Så här lägger du till en fråga:

1. Öppna enkäten från [[navBar:myCourses]].
2. Öppna fliken [[feedbackTargetView:surveyTab]] och under den fliken [[feedbackTargetView:surveyQuestionsTab]].
3. Välj [[questionEditor:addQuestion]] under frågorna och välj [frågetyp](#question-types).
4. Skriv frågan på finska, svenska och engelska. Du kan också lägga till en [[questionEditor:description]] till frågan, till exempel för att förtydliga den.
5. Om frågan måste besvaras, slå på [[common:required]].
6. Välj [[questionEditor:done]].

[[video:edit-questions]]

Om du bara lägger till en språkversion ser alla enkäten på det språket, oavsett vilket språk de använder Norppa på.

Du redigerar en fråga med knappen [[common:edit]] vid frågan. Flera frågor kan du ta bort på en gång med knappen [[questionEditor:removeMany]] under frågorna.

Knappen [[questionEditor:addTextualContent]] lägger till ett _textavsnitt_ i stället för en fråga, till exempel en instruktion eller en mellanrubrik för frågorna efter det. I textavsnitt och frågebeskrivningar kan du använda Markdown, till exempel länkar och listor.

I redigeringsfönstret för en skal- eller valfråga kan du också välja om svaren är publika. Skal- och valfrågor som du lägger till är som standard publika, men öppna frågor är det inte; se [Svarens synlighet för olika användare](/guide/anonymity#public-answers).

Frågorna kan redigeras av:

- kursenkät: kursens ansvariga lärare och administratörer samt admins för kursens utbildningsprogram (se [Roller och rättigheter](/guide/roles#course-roles))
- mellanrespons: kursens ansvariga lärare och utbildningsprogrammets admins
- programenkät: enkätens ansvariga personer och utbildningsprogrammets admins.

## Frågetyper {#question-types}

Det finns fyra frågetyper: [[questionEditor:likertQuestion]], [[questionEditor:openQuestion]], [[questionEditor:singleChoiceQuestion]] och [[questionEditor:multipleChoiceQuestion]]. Skalfrågor besvaras på en skala 1–5 eller med alternativet _ingen åsikt_. Siffrorna har inga förklaringar, så berätta i frågan eller i dess beskrivning vad 1 och 5 betyder, till exempel 1 = helt av annan åsikt, 5 = helt av samma åsikt.

## Kopiera frågor från en annan enkät {#copy-questions}

Så här kopierar du dina egna frågor från enkäten på en annan kurs:

1. Välj [[editFeedbackTarget:copyFromCourseButton]] på fliken [[feedbackTargetView:surveyQuestionsTab]].
2. Du ser de kurser som du undervisar på. Välj den kurs du vill ha.
3. Kursens genomföranden som du har undervisat på och som har egna frågor visas med antalet frågor. För muspekaren över ett genomförande för att se dess frågor.
4. Välj [[editFeedbackTarget:copyQuestionsButton]] vid genomförandet.

[[video:copy-questions]]

Frågorna läggs till efter dina egna frågor och sparas genast. Bara lärarens egna frågor kopieras, inte frågorna på universitetsnivå eller programnivå. De kopierade frågorna är inte publika förrän du gör dem publika.

I mellanrespons och programenkäter visar knappen [[editFeedbackTarget:copyFromCourseButton]] i stället programenkäterna från de utbildningsprogram och fakulteter där du har adminrättigheter. I mellanrespons och programenkäter finns dessutom knappen [[editFeedbackTarget:copyUniversityQuestions]], med vilken du kan lägga till frågorna på universitetsnivå om du vill.

## Frågor från föregående genomförande {#carry-over}

När enkäten för ett nytt kursgenomförande skapas i Norppa kopierar Norppa lärarens egna frågor till den från föregående genomförande av samma studieavsnitt. Om du inte vill ha de kopierade frågorna i den nya enkäten kan du ta bort dem på vanligt sätt.

- De kopierade frågorna är inte publika förrän du gör dem publika.
- Också en grupperingsfråga kopieras. Kontrollera att dess alternativ motsvarar grupperna i det här genomförandet.
- I vissa specialfall kan frågorna inte kopieras automatiskt, men du kan vid behov kopiera dem själv.

Se [Kopiera frågor från en annan enkät](#copy-questions).

## Språkversioner och förhandsvisning {#languages}

Studerande ser kursenkäten på det språk de använder Norppa på: finska, svenska eller engelska. Därför har frågeredigeraren ett eget fält för varje språk sida vid sida. Fyll i åtminstone fälten för de språk som dina studerande använder. Om en språkversion lämnas tom ser studerandena enkäten på ett annat språk.

Så här ser du enkäten som studerandena ser den:

1. Öppna fliken [[common:preview]].
2. Välj språk i menyn [[feedbackView:translationLanguage]] längst ned på fliken.

Samma meny finns också längst ned på fliken [[feedbackTargetView:surveyQuestionsTab]], där den också byter frågeredigerarens frågor till det valda språket. Båda flikarna använder det språk du valde senast.

[[video:preview-survey]]

Fliken [[common:preview]] visar hela enkäten så som studerandena ser den.

## Grupper {#groups}

Om kursen har undervisningsgrupper i Sisu, till exempel övningsgrupper, hämtar Norppa dem automatiskt från Sisu. Om kursenkäten har minst två grupper från Sisu kan svaren granskas gruppvis på fliken [[feedbackTargetView:feedbacksTab]]. Grupperna, deras antal studerande och lärare visas under [[groups:groupingInfo]] högst upp på fliken [[feedbackTargetView:surveyQuestionsTab]].

Om kursen inte har några grupper i Sisu, eller om de inte passar dina behov, lägg till en _grupperingsfråga_. Den kan läggas till i vilken typ av enkät som helst:

1. Välj [[groups:addGroupingQuestion]] på fliken [[feedbackTargetView:surveyQuestionsTab]].
2. Redigera frågan och dess alternativ. Om kursen har grupper i Sisu finns de färdigt som alternativ.
3. Välj [[questionEditor:done]].

[[video:grouping-question]]

Grupperingsfrågan är obligatorisk för den som svarar, den är enkätens första fråga och den är inte publik som standard. En kursenkät kan bara ha en grupperingsfråga, och om du har skapat den själv ersätter den grupperna från Sisu. Om du vill återgå till grupperna i Sisu, ta bort grupperingsfrågan.

För att skydda anonymiteten visas svaren gruppvis bara om varje grupp som har fått svar har minst fem svarande (se [Svar per grupp](/guide/anonymity#groups)).

## Fasta frågor {#fixed-questions}

### Frågor på universitetsnivå {#university-questions}

Universitetet har bestämt dessa frågor för alla kursenkäter. De är desamma på alla kurser och kan inte redigeras eller tas bort. I frågeredigeraren är de märkta med [[questionEditor:universityQuestion]], och de visas i början av fliken [[feedbackTargetView:surveyQuestionsTab]].

Det finns två versioner av frågorna: de som användes 2021–2026 och de som används från och med hösten 2026. Se [Frågor på universitetsnivå](/guide/university-questions). Mellanrespons och programenkäter har inga frågor på universitetsnivå, men du kan [kopiera in dem](#copy-questions) om du vill.

### Frågor på programnivå {#programme-questions}

Ett utbildningsprogram eller en fakultet kan lägga till egna frågor, och de kommer automatiskt med i kursenkäterna för alla programmets studieavsnitt. I frågeredigeraren är de märkta med [[questionEditor:programmeQuestion]], och på fliken [[feedbackTargetView:surveyQuestionsTab]] ser du hur många de är och vilken organisation som har lagt till dem.

Du kan inte redigera eller ta bort frågorna på programnivå. Mellanrespons och programenkäter har inga frågor på programnivå. Utbildningsprogrammets personal (utbildningsprogrammets direktör och korrespondenterna för responsen) kan lägga till och redigera dessa frågor på utbildningsprogrammets sida; se [Frågor på programnivå](/guide/programme-questions).

## Frågornas ordning för studerande {#question-order}

I frågeredigeraren kommer först frågorna på universitetsnivå, sedan frågorna på programnivå och sist lärarens egna frågor. Studerandena ser dem i den här ordningen:

1. Grupperingsfrågan, om enkäten har en (se [Grupper](#groups)).
2. Skal- och valfrågorna på universitetsnivå.
3. Utbildningsprogrammets skal- och valfrågor.
4. Kursens (lärarens) egna frågor och textavsnitt i den ordning de har placerats.
5. Utbildningsprogrammets öppna frågor.
6. Den öppna frågan på universitetsnivå _Övriga kommentarer_, som alltid kommer sist.

Slutresultatet ser du på fliken [[common:preview]] (se [Språkversioner och förhandsvisning](#languages)).
