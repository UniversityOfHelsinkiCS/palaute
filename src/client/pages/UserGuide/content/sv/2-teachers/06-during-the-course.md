---
description: Kontinuerlig respons och mellanrespons, så att du hör studerandena redan under kursen.
---

# Kontinuerlig respons och mellanrespons

Utöver kursenkäten i slutet av kursen kan läraren samla in respons under kursen på två sätt. Kursens ansvariga lärare kan aktivera "kontinuerlig respons", som är ett lättillgängligt sätt för studerandena att ge snabb respons till läraren, med e-post. Dessutom kan läraren samla in mellanrespons med en separat enkät, till exempel mitt i kursen. Dessa funktioner finns bara i vanliga kursenkäter (inte i utbildningsprogrammens egna enkäter).

## Kontinuerlig respons {#continuous-feedback}

Kontinuerlig respons ges i Norppa, och med den kan studerandena skriva fritt formulerad respons om kursen när som helst under kursen (innan kursenkäten öppnas). Den är avstängd tills en ansvarig lärare eller en admin för utbildningsprogrammet (utbildningsprogrammets direktör eller korrespondenten för responsen) slår på den.

Så här aktiverar du kontinuerlig respons:

1. Välj kursen i [[navBar:myCourses]].
2. Öppna fliken [[feedbackTargetView:continuousFeedbackTab]].
3. Slå på [[feedbackTargetView:activateContinuousFeedback]].
4. Om du vill få e-post om ny respons, slå på [[feedbackTargetView:activateContinuousFeedbackDigest]].
5. Skriv en lämplig inledning för studerandena i fältet [[feedbackTargetView:continuousFeedbackPreambleLabel]], till exempel vad du önskar respons om, och klicka på [[common:save]]. Inledningen visas på responsformuläret.

[[video:continuous-feedback]]

Valen sparas genast, men Norppa informerar inte studerandena om den kontinuerliga responsen automatiskt, så det är bra att berätta om den separat. Studerandena hittar kursen i [[navBar:myFeedbacks]] på fliken [[userFeedbacks:continuousFeedbackTab]] och skriver sin respons under [[userFeedbacks:giveContinuousFeedback]].

Studerandena kan ge kontinuerlig respons tills kursenkäten öppnas. Den respons som ges sparas i Norppa.

### Dagligt e-postmeddelande

När [[feedbackTargetView:activateContinuousFeedbackDigest]] är påslaget får kursens ansvariga lärare varje morgon ett e-postmeddelande med den kontinuerliga respons som getts under det senaste dygnet. Om ingen ny respons har kommit skickas inget meddelande. Respons som har getts medan e-postmeddelandet var avstängt skickas inte i efterhand, men den sparas i Norppa.

### Läsa och svara

På fliken [[feedbackTargetView:continuousFeedbackTab]] finns all kontinuerlig respons som har getts under rubriken [[feedbackTargetView:continuousFeedbackGiven]].

Så här svarar du på respons:

1. Klicka på [[feedbackTargetView:respondContinuousFeedback]].
2. Skriv ditt svar och klicka på [[common:send]].

Lärarens svar syns bara för den studerande som gav responsen. Den studerande får svaret per e-post, och det syns också i Norppa. Du kan ändra svaret senare med knappen [[common:edit]], men inget e-postmeddelande skickas om ändringarna.

Kontinuerlig respons är anonym: Norppa visar inte vem som gav den. Den kan läsas av ansvariga lärare och utbildningsprogrammets admins (utbildningsprogrammets direktör och korrespondenten för responsen), men inte av lärare (utan rollen som ansvarig lärare). Responsen kan inte tas bort.

När kursen pågår och kontinuerlig respons är påslagen visas märket [[teacherView:continuousFeedback]] vid kursen i [[navBar:myCourses]].

## Mellanrespons {#interim-feedback}

Mellanrespons är en separat enkät som motsvarar kursenkäten, men med dina egna frågor, till exempel mitt i kursen. Du kan skapa flera mellanresponser. Norppa kopierar kursens studerande och lärare till mellanresponsen när du skapar den.

Så här skapar du en mellanrespons (ansvariga lärare):

1. Välj kursen i [[navBar:myCourses]].
2. Öppna fliken [[feedbackTargetView:interimFeedbackTab]].
3. Klicka på [[interimFeedback:addSurvey]].
4. Ge mellanresponsen ett namn på minst ett språk och datumen i fälten [[interimFeedback:startDate]] och [[interimFeedback:endDate]].
5. Klicka på [[common:save]]. Den nya mellanresponsen öppnas på fliken [[feedbackTargetView:surveyQuestionsTab]].
6. Lägg till dina frågor. Se [redigera frågorna](/guide/questions#edit-questions).

[[video:interim-feedback]]

Mellanrespons har inga frågor på universitetsnivå eller programnivå. Om du vill ha med frågorna på universitetsnivå, lägg till dem med knappen [[editFeedbackTarget:copyUniversityQuestions]]. Precis som i kursenkäten låses frågorna när mellanresponsen öppnas.

Mellanresponsen öppnas kl. 00.00 på startdagen och stängs kl. 23.59 på slutdagen.

Så här ändrar du namnet eller datumen: öppna mellanresponsen med knappen [[interimFeedback:viewFeedback]] och klicka på [[interimFeedback:editSurvey]]. Du kan göra det när som helst, till exempel för att förlänga mellanresponsen eller öppna den på nytt efter att den har stängts.

### Samla in svar

Norppa skickar inga automatiska e-postmeddelanden om mellanrespons, varken till studerande eller till lärare. När mellanresponsen är öppen, skicka en påminnelse med knappen [[feedbackTargetResults:sendReminder]] på fliken [[feedbackTargetView:shareTab]] eller dela länken, till exempel per e-post. Se [dela enkäten](/guide/collecting-answers#share-link). Studerandena ser mellanresponsen i [[navBar:myFeedbacks]].

När en mellanrespons är öppen visas märket [[teacherView:interimFeedbackOpen]] vid kursen i [[navBar:myCourses]].

### Resultat och borttagning

[[interimFeedback:viewResults]] för mellanresponsen visar de svar som har kommit in. De fungerar tekniskt på samma sätt som i kursenkäten: se [resultat](/guide/results). När mellanresponsen har stängts kan den ansvariga läraren skicka [motrespons](/guide/counter-feedback) om den. Mellanrespons syns inte i [[navBar:courseSummary]].

Så här tar du bort en mellanrespons: klicka på [[interimFeedback:remove]] och bekräfta. En mellanrespons kan bara tas bort om den inte har fått några svar.
