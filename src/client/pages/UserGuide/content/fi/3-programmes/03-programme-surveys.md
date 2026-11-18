---
description: Koulutusohjelman tai tiedekunnan omat kyselyt, kuten lukukausipalaute: luominen, vastaajat ja vastuuhenkilöt.
---

# Koulutusohjelman kyselyt

Koulutusohjelman kysely on "organisaatiotason" kysely. Organisaation kyselyn voi tehdä koulutusohjelma- tai tiedekuntatasolle ja se tehdään alusta alkaen itse, valituille opiskelijoille. Esimerkiksi: lukukausipalaute, opintosuunnan palaute tai usean kurssin yhteinen palaute. Tällainen kysely ei sisällä oletusarvoisesti yliopistotason tai koulutusohjelman kysymyksiä, mutta voit lisätä ne halutessasi mukaan.

Koulutusohjelman kyselyitä voivat tehdä koulutusohjelman adminit (koulutusohjelmajohtaja tai palautevastaava). Ne toimivat teknisesti kuin kurssikyselyt: aukiolopäivämäärät, kysymykset, jakaminen, vastaukset ja vastapalaute. Kyselyn [vastuuhenkilöillä](#responsible-persons) on vastaavat oikeudet kuin vastuuopettajalla, eli tarkemmat ohjeet ovat samat kuin _Vastuuopettajalle_: [Kysymykset](/guide/questions), [Vastausten kerääminen](/guide/collecting-answers), [Tulokset](/guide/results) ja [Vastapalaute](/guide/counter-feedback).

## Kyselyn luominen {#create}

1. Avaa [koulutusohjelman sivulla](/guide/programme-page#programme-page) [[organisationSettings:organisationSurveysTab]]-välilehti (tiedekunnan sivulla [[organisationSettings:organisationFacultySurveysTab]]).
2. Valitse [[organisationSurveys:addSurvey]].
3. Anna kyselylle nimi kohtaan [[organisationSurveys:newSurveyName]] vähintään yhdellä kielellä.
4. Valitse päivämäärät [[organisationSurveys:startDate]] ja [[organisationSurveys:endDate]]. Kysely avautuu klo 0.00 ja sulkeutuu viimeisenä päivänä klo 23.59. Se voi olla auki halutun ajan, esimerkiksi koko lukukauden.
5. Lisää [[organisationSurveys:responsibleTeachers]] (katso [Vastuuhenkilöt](#responsible-persons)). (Kyselyn luojalla on automaattisesti hallintohenkilöoikeudet.)
6. Lisää vastaajat (katso [Vastaajat](#respondents)).
7. Valitse [[common:save]]. Norppa avaa uuden kyselyn [[feedbackTargetView:surveyQuestionsTab]]-välilehden.
8. Lisää kysymykset kuten mihin tahansa kyselyyn; katso [Kysymysten muokkaaminen](/guide/questions#edit-questions). [[editFeedbackTarget:copyFromCourseButton]] kopioi kysymyksiä muista koulutusohjelman kyselyistä, ja [[editFeedbackTarget:copyUniversityQuestions]] lisää yliopistotason kysymykset, jos haluat ne mukaan.

[[video:programme-survey]]

Valmista tuli ja kysely avautuu itsestään avautumispäivänä (voit halutessasi vielä muokata kysymyksiä ennen kuin palaute aukeaa).

> **Huom.** Opiskelijat eivät saa sähköpostia, kun koulutusohjelman kysely avautuu. Kun kysely on auki, lähetä heille [muistutusviesti](#reminders) tai jaa kyselyn linkki [[feedbackTargetView:shareTab]]-välilehdeltä.

## Vastaajat {#respondents}

Kyselyyn voivat vastata vain siihen lisätyt opiskelijat. He näkevät kyselyn [[navBar:myFeedbacks]]-sivulla, kyselyn ollessa auki. Opiskelijoita voi lisätä kahdella tavalla, joita voi myös yhdistää:

- _Opiskelijanumerot_: liitä tai kirjoita ne kenttään [[organisationSurveys:students]] pilkuilla, puolipisteillä, välilyönneillä tai rivinvaihdoilla eroteltuina (esimerkiksi Excelistä kopioitu sarake). Kun tallennat, Norppa merkitsee punaisella opiskelijanumerot, joita se ei tunnista, eikä tallenna ennen kuin korjaat tai poistat ne.
- _Kurssien opiskelijat_: valitse kohdan [[organisationSurveys:addCourses]] vierestä ajanjakso, hae koulutusohjelman kurssitoteutuksia nimellä tai koodilla ja valitse (jokaisen kurssin kohdalla näkyy sen opiskelijamäärä).

Kurssien opiskelijat kopioidaan kyselyyn tallennettaessa; lista ei seuraa myöhempiä muutoksia ilmoittautumisissa. Jos haluat lisätä myöhemmin ilmoittautuneet, avaa [[organisationSurveys:editSurvey]] ja tallenna uudelleen: valittujen kurssien nykyiset opiskelijat lisätään mukaan.

## Vastuuhenkilöt {#responsible-persons}

Kyselyn [[organisationSurveys:responsibleTeachers]] saavat vastuuopettajan oikeudet vain tähän kyselyyn: he voivat muokata kysymyksiä ennen avautumista, muuttaa asetuksia, nähdä kaikki vastaukset ja [[feedbackTargetView:studentsWithFeedbackTab]]-välilehden, lähettää muistutusviestejä ja kirjoittaa vastapalautteen. Kyselyn sivulla heidät on lueteltu otsikon [[feedbackTargetView:administrativePersons]] alla. He löytävät kyselyn [[navBar:myCourses]]-sivulta kohdasta [[teacherView:organisationSurveys]].

Kun lisäät vastuuhenkilön, kirjoita kenttään vähintään viisi merkkiä hänen nimestään tai sähköpostiosoitteestaan ja valitse hänet. Haku löytää vain yliopiston henkilökuntaa; jos henkilöä ei löydy, pyydä häntä kirjautumaan kerran Norppaan. Vastuuhenkilöitä on aina oltava vähintään yksi.

Koulutusohjelman hallinnoijat (koulutusohjelman johtaja ja palautevastaava) voivat muokata kyselyä ja nähdä sen vastaukset, vaikka eivät olisi vastuuhenkilöitä. [Vastapalautteen](/guide/counter-feedback) voivat kuitenkin kirjoittaa vain vastuuhenkilöt.

## Kyselyn muokkaaminen {#edit}

Avaa kysely [[navBar:myCourses]]-sivulta kohdasta [[teacherView:organisationSurveys]] tai koulutusohjelman [[organisationSettings:organisationSurveysTab]]-välilehdeltä painikkeella [[organisationSurveys:viewFeedback]].

- _Nimi, päivämäärät, vastuuhenkilöt ja vastaajat_: valitse kyselyn sivulla [[organisationSurveys:editSurvey]], tee muutokset ja valitse [[common:save]]. Tämä onnistuu ennen palautejaksoa, sen aikana ja sen jälkeen.
- _Kysymykset_: [[feedbackTargetView:surveyQuestionsTab]]-välilehti [[feedbackTargetView:surveyTab]]-välilehden alla, kunnes kysely avautuu. Sen jälkeen kysymykset on lukittu.

Jos haluat avata kyselyn heti, aseta sen alkamispäiväksi tämä päivä: kysely avautuu heti (opiskelijat eivät saa automaattista sähköpostia auenneesta kyselystä). Päättyneen kyselyn saa avattua uudelleen siirtämällä sen päättymispäivää eteenpäin.

### Muistutusviestin lähettäminen {#reminders}

Norppa ei itse lähetä opiskelijoille sähköpostia organisaatiotason kyselystä. Kun kysely on auki, vastuuhenkilö tai koulutusohjelman hallinnoija voi [lähettää muistutusviestin](/guide/collecting-answers#send-reminder) kyselyn [[feedbackTargetView:shareTab]]-välilehdeltä opiskelijoille, jotka eivät ole vielä vastanneet.

## Tulokset {#results}

Vastaukset kertyvät kyselyn [[feedbackTargetView:feedbacksTab]]-välilehdelle ja niitä voi tarkastella aukeamispäivästä lähtien. Polku: koulutusohjelman [[organisationSettings:organisationSurveysTab]]-välilehti -> (valitse kysely ja) -> [[organisationSurveys:viewResults]]. Vastaus-osio toimii teknisesti kuten kurssikyselyissä; katso [Tulokset](/guide/results).

Kun kysely on päättynyt, vastuuhenkilöt voivat kirjoittaa opiskelijoille vastapalautteen. Jos kyselyyn on vastattu, mutta vastapalautetta ei ole kirjoitettu, vastuuhenkilöt saavat muistutusviestin päättymistä seuraavana päivänä, ja [[navBar:myCourses]]-sivulla näkyy [[teacherView:feedbackResponseMissing]]. Katso [Vastapalaute](/guide/counter-feedback).

Koulutusohjelman kyselyt eivät ole mukana [kurssiyhteenvedossa](/guide/course-summary).

### Kyselyn poistaminen {#remove}

Koulutusohjelman kyselyn voi poistaa niin kauan kuin kukaan ei ole vastannut siihen: valitse koulutusohjelman [[organisationSettings:organisationSurveysTab]]-välilehdellä kyselyn kortista [[organisationSurveys:remove]] ja vahvista. Kun kyselyyn on vastattu, painiketta ei enää ole; jos haluat kyselyn "ei-vastattavaan" tilaan, muuta sen päivämääriä.
