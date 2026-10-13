# Vastapalaute

Vastapalaute on vastauksesi opiskelijoille heidän antamaansa palautteeseen. Se osoittaa, että palaute on luettu, ja kannustaa opiskelijoita antamaan palautetta jatkossakin. Kyselyllä on yksi vastapalaute, joka on yhteinen kaikille sen opiskelijoille. Vastapalaute toimii samoin kurssipalautteessa, välipalautteessa ja koulutusohjelman kyselyissä.

Vastapalautteen pituus on vapaa. Voit esimerkiksi kiittää opiskelijoita, koota yhteen annetun palautteen, kommentoida tärkeimpinä pitämiäsi asioita ja kertoa, mitä aiot muuttaa opetuksessasi. Opiskelijoille arvokkainta ovat konkreettiset muutokset.

## Vastapalautteen kirjoittaminen {#write}

Vastuuopettajat voivat kirjoittaa vastapalautteen kyselyn sulkeuduttua 12 kuukauden ajan.

1. Valitse kurssi [[navBar:myCourses]]-sivulta. Kurssin vieressä oleva [[teacherView:feedbackResponseMissing]]-merkki vie suoraan kohtaan 3.
2. Avaa [[feedbackTargetView:giveFeedbackResponseTab]]-välilehti.
3. Kirjoita teksti [[feedbackResponse:responseLabel]]-kenttään. Kenttä tukee Markdownia, esimerkiksi otsikoita, luetteloita, lihavointia ja linkkejä. Alla oleva [[feedbackResponse:previewLabel]] näyttää, miltä teksti näyttää.
4. Jätä [[feedbackResponse:checkboxSendEmail]] valituksi, jos haluat lähettää vastapalautteen opiskelijoille sähköpostilla, tai poista valinta, jos haluat vain tallentaa sen.
5. Klikkaa [[feedbackResponse:dialogSendEmailSubmit]] ja vahvista, tai [[feedbackResponse:dialogSaveSubmit]], jos poistit valinnan.

Kuka tahansa kyselyn vastuuopettajista voi muokata vastapalautetta myöhemmin samalla välilehdellä.

Kurssipalautteen tai koulutusohjelman kyselyn sulkeutumista seuraavana päivänä sen vastuuopettajat saavat sähköpostimuistutuksen vastapalautteesta, jos kyselyyn on vastattu eikä vastapalautetta ole vielä annettu. Katso [sähköpostit](/guide/collecting-answers#emails).

## Lähettäminen sähköpostilla {#send-email}

Sähköposti lähtee kaikille kyselyn opiskelijoille, ei vain vastanneille. Siinä on vastapalautteen teksti ja linkki kyselyn vastauksiin.

Sähköpostin voi lähettää vain kerran. Sen jälkeen valintaruudussa lukee [[feedbackResponse:emailSent]] ja välilehden nimi on [[feedbackTargetView:editFeedbackResponseTab]]. Tekstiä voi yhä muokata: opiskelijat näkevät uuden version Norpassa, mutta uutta sähköpostia ei lähetetä.

Jos tallensit vastapalautteen ilman sähköpostia, voit lähettää sen myöhemmin: valitse [[feedbackResponse:checkboxSendEmail]] ja klikkaa [[feedbackResponse:dialogSendEmailSubmit]].

### Tilan tarkistaminen {#status}

[[navBar:myCourses]]-sivulla päättyneen kyselyn vieressä oleva merkki kertoo sen vastapalautteen tilan:

- [[teacherView:feedbackResponseMissing]]: kyselyyn on vastattu, mutta vastapalautetta ei ole annettu. Merkki näkyy 12 kuukautta kyselyn sulkeutumisesta.
- [[teacherView:feedbackResponseNotSent]]: vastapalaute on tallennettu, mutta sähköpostia ei ole lähetetty.
- [[teacherView:feedbackResponseGiven]]: vastapalaute on tallennettu ja lähetetty sähköpostilla.

[[teacherView:endedSurveys]]-välilehden numero kertoo, monestako päättyneestä kurssistasi puuttuu vastapalaute.

## Miten opiskelijat näkevät sen {#students-see}

Kyselyn sulkeuduttua opiskelijat näkevät vastapalautteen kyselyn [[feedbackTargetView:feedbacksTab]]-välilehdellä otsikon [[feedbackTargetResults:responseHeading]] alla vastausten yläpuolella. Siellä se näkyy vain, jos kyselyyn on vastattu.

[[navBar:myFeedbacks]]-sivulla kyselyn kohdalla näkyy opiskelijoille [[userFeedbacks:feedbackResponseGiven]]. Jos lähetit sähköpostin, he saavat tekstin myös sähköpostilla.

Jos haluat jakaa vastapalautteen muuta kautta, esimerkiksi kurssin oppimisympäristössä, kopioi [[feedbackTargetView:studentResultsLinkTitle]] kyselyn [[feedbackTargetView:shareTab]]-välilehdeltä. Linkki on siellä kyselyn sulkeuduttua.
