---
description: Jatkuva palaute ja välipalaute, joilla kuulet opiskelijoita jo kurssin aikana.
---

# Jatkuva palaute ja välipalaute

Kurssin loppuun sijoittuvan kurssipalautekyselyn lisäksi opettaja voi kerätä kurssin aikana palautetta kahdella tavalla. Kurssin vastuuopettaja voi aktivoida "jatkuvan palautteen", joka on matalankynnyksen sähköposti-pohjainen pikapalaute opettajan ja opiskelijoiden välillä. Lisäksi opettaja voi kerätä esim. kurssin puolivälissä  välipalautetta erillisellä kyselylomakkeella. Nämä ominaisuudet on käytettävissä vain tavallisen kurssipalautekyselyn puitteissa (ei koulutusohjelman omissa kyselyissä).

## Jatkuva palaute {#continuous-feedback}

Jatkuva palaute annetaan Norpassa (järjestelmässä) ja siinä opiskelijat voivat kirjoittaa kurssista vapaamuotoista palautetta milloin tahansa kurssin aikana (ennen kurssipalautteen avautumista). Se on pois päältä, kunnes vastuuopettaja tai koulutusohjelman admin (koulutusohjelman johtaja tai palautevastaava) ottaa sen käyttöön:

Jatkuvan palautteen aktivointi:

1. Valitse kurssi [[navBar:myCourses]]-sivulta.
2. Avaa [[feedbackTargetView:continuousFeedbackTab]]-välilehti.
3. Kytke päälle [[feedbackTargetView:activateContinuousFeedback]].
4. Jos haluat sähköpostia uudesta palautteesta, kytke päälle [[feedbackTargetView:activateContinuousFeedbackDigest]].
5. Kirjoita opiskelijoille sopiva johdanto kenttään [[feedbackTargetView:continuousFeedbackPreambleLabel]], esimerkiksi mistä toivot palautetta, ja klikkaa [[common:save]]. Johdanto näkyy palautelomakkeella.

[[video:continuous-feedback]]

Valinnat tallentuvat heti, mutta Norppa ei infoa opiskelijoita jatkuvasta palautteesta automaattisesti, joten siitä on hyvä informoida erikseen. Opiskelijat löytävät kurssin [[navBar:myFeedbacks]]-sivun [[userFeedbacks:continuousFeedbackTab]]-välilehdeltä ja kirjoittavat palautteensa kohdassa [[userFeedbacks:giveContinuousFeedback]].

Opiskelijat voivat antaa jatkuvaa palautetta kurssipalautteen avautumiseen asti. Annettu palaute tallentuu Norppaan.

### Päivittäinen sähköposti

Kun [[feedbackTargetView:activateContinuousFeedbackDigest]] on päällä, kurssin vastuuopettajat saavat joka aamu sähköpostin, jossa on edellisen vuorokauden aikana annettu jatkuva palaute. Jos uutta palautetta ei ole tullut, viestiä ei lähetetä. Palautetta, joka on annettu sähköpostin ollessa pois päältä, ei lähetetä jälkikäteen, mutta se tallentuu Norppaan.

### Lukeminen ja vastaaminen

[[feedbackTargetView:continuousFeedbackTab]]-välilehdellä on kaikki annettu jatkuva palaute otsikon [[feedbackTargetView:continuousFeedbackGiven]] alla.

Palautteeseen vastaaminen:

1. Klikkaa [[feedbackTargetView:respondContinuousFeedback]].
2. Kirjoita vastauksesi ja klikkaa [[common:send]].

Opettajan antaman vastauksen näkee vain palautteen antanut opiskelija. Opiskelija saa vastauksen sähköpostitse ja se näkyy myös Norpassa. Voit muuttaa vastausta myöhemmin painikkeella [[common:edit]], mutta muutoksista ei lähetetä sähköpostia.

Jatkuva palaute on nimetöntä: Norppa ei näytä, kuka sen antoi. Sitä voivat lukea vastuuopettajat ja koulutusohjelman adminit (koulutusohjelmajohtaja ja palautevastaava), mutta eivät opettajat (joilla ei ole vastuuopettajan roolia). Palautetta ei voi poistaa.

Kun kurssi on käynnissä ja jatkuva palaute on päällä, [[navBar:myCourses]]-sivulla kurssin kohdalla näkyy [[teacherView:continuousFeedback]]-merkki.

## Välipalaute {#interim-feedback}

Välipalaute on erillinen, kurssipalautekyselyä vastaava kysely, mutta omilla kysymyksilläsi, esimerkiksi kurssin puolivälissä. Välipalautteita voi luoda useita. Norppa kopioi välipalautteeseen kurssin opiskelijat ja opettajat, kun luot sen.

Välipalautteen luominen (vastuuopettajat):

1. Valitse kurssi [[navBar:myCourses]]-sivulta.
2. Avaa [[feedbackTargetView:interimFeedbackTab]]-välilehti.
3. Klikkaa [[interimFeedback:addSurvey]].
4. Anna välipalautteelle nimi ainakin yhdellä kielellä sekä päivämäärät kenttiin [[interimFeedback:startDate]] ja [[interimFeedback:endDate]].
5. Klikkaa [[common:save]]. Uusi välipalaute avautuu [[feedbackTargetView:surveyQuestionsTab]]-välilehdelle.
6. Lisää kysymyksesi. Katso [kysymysten muokkaaminen](/guide/questions#edit-questions).

[[video:interim-feedback]]

Välipalautteessa ei ole yliopistotason eikä koulutusohjelman kysymyksiä. Jos haluat yliopistotason kysymykset mukaan, lisää ne painikkeella [[editFeedbackTarget:copyUniversityQuestions]]. Kuten kurssipalautlomakkeella, kysymykset lukittuvat, kun välipalaute avautuu.

Välipalaute avautuu aukeamispäivänä klo 0.00 ja menee kiinni sulkeutumispäivänä klo 23.59.

Nimen tai päivämäärien muuttaminen: avaa välipalaute painikkeella [[interimFeedback:viewFeedback]] ja klikkaa [[interimFeedback:editSurvey]]. Voit tehdä tämän milloin tahansa, esimerkiksi jatkaaksesi välipalautetta tai avataksesi sen uudelleen sen sulkeuduttua.

### Vastausten kerääminen

Norppa ei lähetä välipalautteesta automaattisesti sähköposteja opiskelijoille eikä opettajille. Kun välipalaute on auki, lähetä muistutusviesti [[feedbackTargetView:shareTab]]-välilehdeltä painikkeella [[feedbackTargetResults:sendReminder]] tai jaa sen linkki esim. sähköpostitse. Katso [kyselyn jakaminen](/guide/collecting-answers#share-link). Opiskelijat näkevät välipalautteen [[navBar:myFeedbacks]]-sivulla.

Kun välipalaute on auki, [[navBar:myCourses]]-sivulla kurssin kohdalla näkyy [[teacherView:interimFeedbackOpen]]-merkki.

### Tulokset ja poistaminen

Välipalautteen [[interimFeedback:viewResults]] näyttää kertyneet vastaukset. Ne toimivat teknisesti samoin kuin kurssipalautteessa: katso [tulokset](/guide/results). Kun välipalaute on sulkeutunut, vastuuopettaja voi lähettää siihen liittyen [vastapalautteen](/guide/counter-feedback). Välipalaute ei näy [[navBar:courseSummary]]-sivulla.

Välipalautteen poistaminen: klikkaa [[interimFeedback:remove]] ja vahvista. Välipalautteen voi poistaa vain, jos siihen ei ole vastattu.
