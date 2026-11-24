---
description: Korrespondenter för responsen, synligheten för vem som har svarat och att stänga av responsen för en kurs.
---

# Utbildningsprogrammets inställningar

På programmets flik [[organisationSettings:settingsTab]] (syns bara för admins, alltså utbildningsprogrammens direktörer och korrespondenterna för responsen) finns korrespondenterna för responsen, [[organisationSettings:generalSettings]] och [[organisationSettings:courseSettings]]. Varje ändring sparas genast.

## Lägga till en korrespondent för responsen {#feedback-liaison}

Korrespondenter för responsen läggs till i Norppa. En korrespondent för responsen får adminrättigheter till utbildningsprogrammet.

1. Öppna fliken [[organisationSettings:settingsTab]] på utbildningsprogrammets sida.
2. Skriv minst fem tecken av personens e-postadress eller namn under [[organisationSettings:newCorrespondent]].
3. Välj [[organisationSettings:setAsCorrespondent]] vid rätt person och bekräfta.

Sökningen hittar bara universitetets personal. Om någon inte hittas kan du be personen logga in i Norppa en gång och försöka på nytt.

Listan [[organisationSettings:feedbackCorrespondents]] visar programmets korrespondenter för responsen. [[organisationSettings:remove]] tar bort en korrespondent.

<!-- Explain IAM-based liaisons once Jami actually creates them; see documentation/known_bugs.md. -->

## Vem som ser de svarande {#student-list}

På enkätens flik [[feedbackTargetView:studentsWithFeedbackTab]] ser kursens ansvariga lärare en lista över kursens studerande. Programmets admins (utbildningsprogrammets direktör och korrespondent för responsen) kan under [[organisationSettings:studentListVisibility]] välja om listan också visar _vem som har svarat_:

- [[organisationSettings:studentListVisible]]: syns på alla programmets kurser.
- [[organisationSettings:studentListHidden]]: syns inte på någon kurs.
- [[organisationSettings:studentListByCourse]]: under [[organisationSettings:courseSettings]] får varje studieavsnitt en knapp [[organisationSettings:courseStudentListVisible]]. Slå på den för de kurser där uppgiften ska visas.

Inställningen gäller de studieavsnitt där utbildningsprogrammet är den primära organisationen. Om ett studieavsnitt hör till flera utbildningsprogram kan det primära programmet göra inställningen.

När inställningen är på syns uppgiften när enkäten har stängts och minst fem studerande har svarat; se [Vem har svarat](/guide/anonymity#who-answered).

## Stänga av responsen för en kurs {#disable-feedback}

Under [[organisationSettings:courseSettings]] har varje studieavsnitt i programmet en knapp [[organisationSettings:feedbackEnabled]]. Sök kursen med fältet [[organisationSettings:findByCourseUnit]] och stäng av insamlingen av respons, till exempel om kursens respons samlas in på något annat sätt.

Knappen gäller alla genomföranden av studieavsnittet. Kursens lärare ser då meddelandet [[teacherView:disabledCourseWarning]] på sidan [[navBar:myCourses]] och meddelandet [[feedbackTargetView:feedbackDisabled]] på kursens sida. Studerande kommer inte åt enkäten, och Norppa skickar ingen e-post om den. När du slår på knappen igen fungerar responsen normalt igen.
