---
description: Granska svaren, deras synlighet, dölja öppna svar och ladda ner svaren.
---

# Resultat

Enkätens svar syns på fliken [[feedbackTargetView:feedbacksTab]] från och med det första svaret, så du kan följa dem medan enkäten är öppen. Resultaten fungerar likadant i kursenkäter, mellanrespons och programenkäter.

## Granska svaren {#view-answers}

1. Välj kursen i [[navBar:myCourses]]. Enkäterna för avslutade kurser finns på fliken [[teacherView:endedSurveys]].
2. Öppna fliken [[feedbackTargetView:feedbacksTab]].

[[video:view-answers]]

På fliken ser du:

- Hur antalet svar har ökat dag för dag, som andel av enkätens studerande. I diagrammet är enkätens start- och slutdatum och den senaste påminnelsen utmärkta.
- Hur svaren på varje skal- och valfråga fördelar sig. För skalfrågor visas också medelvärdet, där svaren [[feedbackView:dontKnowOption]] inte räknas med. I frågan om arbetsbelastning visar en pil åt vilket håll svaren lutar.
- Svaren på de öppna frågorna i alfabetisk ordning.

[[feedbackTargetResults:tableView]] visar diagrammen som tabeller och [[feedbackTargetResults:chartView]] byter tillbaka.

Om kursen har grupper i Sisu eller enkäten har en grupperingsfråga kan du filtrera svaren gruppvis med [[groups:chooseGroup]]. En enskild grupps svar visas bara om varje grupp som har fått svar har minst fem svarande; se [Svar per grupp](/guide/anonymity#groups).

Om färre än fem studerande har anmält sig till kursen syns resultaten bara för kursens ansvariga lärare och administratörer. Se [Kurser med färre än fem studerande](/guide/anonymity#small-courses).

## Ändra vem som ser svaren {#visibility}

Varje fråga är antingen [[common:public]] eller [[common:notPublic]]. Ansvariga lärare, administratörer och utbildningsprogrammets admins (utbildningsprogrammets direktör och korrespondenten för responsen) ser alla svar. Andra lärare, de som har läsrättigheter till utbildningsprogrammet och studerande ser bara svaren på publika frågor. Se [Svarens synlighet för olika användare](/guide/anonymity#public-answers).

Så här ändrar du en frågas synlighet:

1. Klicka på [[common:public]] eller [[common:notPublic]] under frågan på fliken [[feedbackTargetView:feedbacksTab]].
2. Välj [[common:publicInfo]] eller [[common:notPublicInfo]]. Ändringen sparas genast.

[[video:answer-visibility]]

Innan enkäten öppnas kan du också ställa in synligheten för skal- och valfrågor när du [redigerar frågorna](/guide/questions#edit-questions).

En öppen fråga kan göras publik först efter att enkäten har stängts, eftersom svaren kan innehålla känslig information eller personuppgifter. Norppa ber dig bekräfta att detta har kontrollerats innan svaren görs publika.

Du kan inte ändra synligheten för frågor som universitetet eller utbildningsprogrammet har gjort publika.

## Dölja öppna svar {#hide-answers}

Om ett öppet svar innehåller personuppgifter, såsom ett studentnummer, eller annars är olämpligt, kan du dölja det. Också utbildningsprogrammets admins kan dölja svar.

1. Leta upp svaret på fliken [[feedbackTargetView:feedbacksTab]].
2. Klicka på ögonikonen bredvid det ([[feedbackTargetResults:setHidden]]).

[[video:hide-answers]]

Svaret döljs för alla som bara ser publika svar. Ansvariga lärare och utbildningsprogrammets admins ser det fortfarande, märkt som dolt. Också svar som är exakt likadana i samma fråga döljs. Du visar svaret igen genom att klicka på ikonen på nytt ([[feedbackTargetResults:setVisible]]).

Att dölja svar spelar bara roll för publika frågor. Dolda svar lämnas bort ur pdf-filen.

Svar kan inte tas bort. Om ett svar måste tas bort helt, kontakta [supporten](/guide/help#support).

## Vem har svarat {#who-answered}

Fliken [[feedbackTargetView:studentsWithFeedbackTab]] under fliken [[feedbackTargetView:surveyTab]] listar kursens studerande (det vill säga de potentiella svarandena). Listan syns för ansvariga lärare och utbildningsprogrammets admins (utbildningsprogrammets direktör, korrespondenten för responsen).

Om en studerande har svarat ([[common:feedbackGiven]] eller [[common:feedbackNotGiven]]) visas bara när enkäten har stängts, minst fem studerande har svarat och kursens utbildningsprogram har tillåtit funktionen i sina inställningar. Annars står det [[common:feedbackHidden]] i kolumnen. Listan visar aldrig vem som svarade vad. Se närmare [Vem har svarat](/guide/anonymity#who-answered).

[[feedbackTargetView:copyStudentNumbers]] kopierar studentnumren, till exempel för att klistra in dem i ett e-postmeddelande. [[common:exportXLSX]] laddar ner en Excel-fil över dem som har svarat.

## Ladda ner svaren {#download}

Ansvariga lärare och utbildningsprogrammets personal kan ladda ner svaren via menyn [[feedbackTargetResults:export]] högst upp på fliken [[feedbackTargetView:feedbacksTab]]:

- [[common:exportXLSX]]: en tabell med en kolumn för varje fråga. Svaren är blandade inom varje kolumn, så en rad är inte en studerandes svar. Filen har inga tidsstämplar eller uppgifter om studerandena.
- [[common:exportPdf]]: öppnar webbläsarens pdf-utskriftsvy, där du kan spara filen på din dator.

[[video:download-answers]]

Siffror för flera kurser, år och utbildningsprogram hittar du i [kurssammanfattningen](/guide/course-summary).
