# Jatkuva palaute ja välipalaute

Kurssipalautekysely avautuu vasta kurssin päätyttyä. Jos haluat kuulla opiskelijoita jo kurssin aikana, kurssipalautteen vastuuopettajat voivat käyttää jatkuvaa palautetta, välipalautetta tai molempia. Kumpikaan ei vaikuta itse kurssipalautteeseen, eikä kumpaakaan ole koulutusohjelman kyselyissä.

## Jatkuva palaute {#continuous-feedback}

Jatkuvan palautteen avulla opiskelijat voivat kirjoittaa kurssista vapaamuotoista palautetta milloin tahansa ennen kurssipalautteen avautumista. Se on pois päältä, kunnes vastuuopettaja tai koulutusohjelman admin ottaa sen käyttöön:

1. Valitse kurssi [[navBar:myCourses]]-sivulta.
2. Avaa [[feedbackTargetView:continuousFeedbackTab]]-välilehti.
3. Kytke päälle [[feedbackTargetView:activateContinuousFeedback]].
4. Jos haluat sähköpostia uudesta palautteesta, kytke päälle [[feedbackTargetView:activateContinuousFeedbackDigest]].
5. Halutessasi kirjoita opiskelijoille teksti kenttään [[feedbackTargetView:continuousFeedbackPreambleLabel]], esimerkiksi mistä toivot palautetta, ja klikkaa [[common:save]]. Teksti näkyy palautelomakkeella.

[[video:continuous-feedback]]

Valinnat tallentuvat heti. Norppa ei kerro jatkuvasta palautteesta opiskelijoille, joten kerro siitä heille itse. He löytävät kurssin [[navBar:myFeedbacks]]-sivun [[userFeedbacks:continuousFeedbackTab]]-välilehdeltä ja kirjoittavat palautteensa painikkeella [[userFeedbacks:giveContinuousFeedback]].

Opiskelijat voivat antaa jatkuvaa palautetta kurssipalautteen avautumiseen asti. Sen jälkeenkin jo annettu palaute säilyy.

### Päivittäinen sähköposti

Kun [[feedbackTargetView:activateContinuousFeedbackDigest]] on päällä, kurssin vastuuopettajat saavat joka aamu klo 8 sähköpostin, jossa on edellisen vuorokauden aikana annettu jatkuva palaute. Jos uutta palautetta ei ole tullut, viestiä ei lähetetä. Palautetta, joka on annettu sähköpostin ollessa pois päältä, ei lähetetä jälkikäteen, mutta voit aina lukea sen välilehdeltä.

### Lukeminen ja vastaaminen

[[feedbackTargetView:continuousFeedbackTab]]-välilehdellä on kaikki palaute otsikon [[feedbackTargetView:continuousFeedbackGiven]] alla uusin ensin. Palautteeseen vastaaminen:

1. Klikkaa palautteen alla [[feedbackTargetView:respondContinuousFeedback]].
2. Kirjoita vastauksesi ja klikkaa [[common:send]].

Vastauksesi näkee vain palautteen antanut opiskelija. Hän näkee sen Norpassa ja saa sen sähköpostilla. Voit muuttaa vastausta myöhemmin painikkeella [[common:edit]], mutta muutoksista ei lähetetä sähköpostia.

Jatkuva palaute on nimetöntä: Norppa ei näytä, kuka sen antoi. Sitä voivat lukea vastuuopettajat ja koulutusohjelman adminit, mutta eivät opettajat, joilla ei ole vastuuopettajan roolia. Palautetta ei voi poistaa.

Kun kurssi on käynnissä ja jatkuva palaute on päällä, [[navBar:myCourses]]-sivulla kurssin kohdalla näkyy [[teacherView:continuousFeedback]]-merkki.

## Välipalaute {#interim-feedback}

Välipalaute on erillinen kysely omilla kysymyksilläsi, esimerkiksi kurssin puolivälissä. Välipalautteita voi luoda useita. Norppa kopioi välipalautteeseen kurssin opiskelijat ja opettajat, kun luot sen.

Välipalautteen luominen (vastuuopettajat):

1. Valitse kurssi [[navBar:myCourses]]-sivulta.
2. Avaa [[feedbackTargetView:interimFeedbackTab]]-välilehti.
3. Klikkaa [[interimFeedback:addSurvey]].
4. Anna sille nimi ainakin yhdellä kielellä sekä päivämäärät kenttiin [[interimFeedback:startDate]] ja [[interimFeedback:endDate]].
5. Klikkaa [[common:save]]. Uusi välipalaute avautuu [[feedbackTargetView:surveyQuestionsTab]]-välilehdelle.
6. Lisää kysymyksesi. Katso [kysymysten muokkaaminen](/guide/questions#edit-questions).

[[video:interim-feedback]]

Välipalautteessa ei ole yliopistotason eikä koulutusohjelman kysymyksiä. Jos haluat yliopistotason kysymykset mukaan, lisää ne painikkeella [[editFeedbackTarget:copyUniversityQuestions]]. Kuten kurssipalautteessa, kysymykset lukittuvat, kun välipalaute avautuu.

Välipalaute avautuu ensimmäisenä päivänään klo 0.00 ja sulkeutuu viimeisenä päivänään klo 23.59. Nimen tai päivämäärien muuttaminen: avaa välipalaute painikkeella [[interimFeedback:viewFeedback]] ja klikkaa [[interimFeedback:editSurvey]]. Voit tehdä tämän milloin tahansa, esimerkiksi jatkaaksesi välipalautetta tai avataksesi sen uudelleen sen sulkeuduttua.

### Vastausten kerääminen

Norppa ei lähetä välipalautteesta sähköposteja opiskelijoille eikä opettajille. Opiskelijat näkevät välipalautteen [[navBar:myFeedbacks]]-sivulla sen ollessa auki, mutta he eivät tiedä siitä, ellet kerro. Kun välipalaute on auki, lähetä muistutusviesti sen [[feedbackTargetView:shareTab]]-välilehdeltä painikkeella [[feedbackTargetResults:sendReminder]] tai jaa sen linkki. Katso [kyselyn jakaminen](/guide/collecting-answers#share-link).

Kun välipalaute on auki, [[navBar:myCourses]]-sivulla kurssin kohdalla näkyy [[teacherView:interimFeedbackOpen]]-merkki.

### Tulokset ja poistaminen

Välipalautteen [[interimFeedback:viewResults]] avaa sen vastaukset, kun vastauksia on. Ne toimivat kuten kurssipalautteessa: katso [tulokset](/guide/results). Kun välipalaute on sulkeutunut, siihen voi kirjoittaa [vastapalautteen](/guide/counter-feedback). Välipalaute ei näy [[navBar:courseSummary]]-sivulla.

Välipalautteen poistaminen: klikkaa sen kohdalla [[interimFeedback:remove]] ja vahvista. Välipalautteen voi poistaa vain, jos siihen ei ole vastattu.
