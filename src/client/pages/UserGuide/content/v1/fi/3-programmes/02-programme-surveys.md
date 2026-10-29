# Koulutusohjelman kyselyt

Koulutusohjelman kysely on kysely, jonka koulutusohjelma tai tiedekunta tekee itse valitsemilleen opiskelijoille, esimerkiksi lukukausipalaute, opintosuunnan palaute tai usean kurssin yhteinen palaute. Siinä ei ole yliopistotason eikä koulutusohjelman kysymyksiä, vaan kirjoitat kaikki kysymykset itse.

Koulutusohjelman kyselyt tekevät koulutusohjelman hallinnoijat. Muuten ne toimivat kuten kurssikyselyt: ne avautuvat ja sulkeutuvat päivämääriensä mukaan, ja kysymykset, jakaminen, vastaukset ja vastapalaute toimivat samalla tavalla. Niiden ohjeet ovat vastuuopettajille tarkoitetuilla sivuilla [Omat kysymykset](/guide/questions), [Vastausten kerääminen](/guide/collecting-answers), [Tulokset](/guide/results) ja [Vastapalaute](/guide/counter-feedback). Kyselyn [vastuuhenkilöillä](#responsible-persons) on niissä samat oikeudet kuin vastuuopettajalla.

## Kyselyn luominen {#create}

1. Avaa [koulutusohjelman sivulla](/guide/programmes#programme-page) [[organisationSettings:organisationSurveysTab]]-välilehti (tiedekunnan sivulla [[organisationSettings:organisationFacultySurveysTab]]).
2. Valitse [[organisationSurveys:addSurvey]].
3. Anna kyselylle nimi kohtaan [[organisationSurveys:newSurveyName]] vähintään yhdellä kielellä.
4. Valitse päivämäärät kohtiin [[organisationSurveys:startDate]] ja [[organisationSurveys:endDate]]. Kysely avautuu ensimmäisenä päivänä klo 0.00 ja sulkeutuu viimeisenä päivänä klo 23.59. Se voi olla auki niin kauan kuin haluat, esimerkiksi koko lukukauden.
5. Lisää [[organisationSurveys:responsibleTeachers]] (katso [Vastuuhenkilöt](#responsible-persons)). Olet itse jo yksi heistä.
6. Lisää vastaajat (katso [Vastaajat](#respondents)).
7. Valitse [[common:save]]. Norppa avaa uuden kyselyn [[feedbackTargetView:surveyQuestionsTab]]-välilehden.
8. Lisää kysymykset kuten mihin tahansa kyselyyn; katso [Kysymysten muokkaaminen](/guide/questions#edit-questions). [[editFeedbackTarget:copyFromCourseButton]] kopioi kysymyksiä muista koulutusohjelman kyselyistä, ja [[editFeedbackTarget:copyUniversityQuestions]] lisää yliopistotason kysymykset, jos haluat ne mukaan.

Muuta ei tarvita: kysely avautuu itsestään alkamispäivänään. Siihen asti voit vielä muuttaa sen kysymyksiä.

> **Huom.** Opiskelijat eivät saa sähköpostia, kun koulutusohjelman kysely avautuu. Kun kysely on auki, lähetä heille [muistutusviesti](#reminders) tai jaa kyselyn linkki [[feedbackTargetView:shareTab]]-välilehdeltä.

## Vastaajat {#respondents}

Kyselyyn voivat vastata vain siihen lisätyt opiskelijat. He näkevät sen [[navBar:myFeedbacks]]-sivulla, kun se on auki. Opiskelijoita voi lisätä kahdella tavalla, joita voi myös yhdistää:

- _Opiskelijanumerot_: liitä tai kirjoita ne kenttään [[organisationSurveys:students]] pilkuilla, puolipisteillä, välilyönneillä tai rivinvaihdoilla eroteltuina (esimerkiksi Excelistä kopioitu sarake). Kun tallennat, Norppa merkitsee punaisella opiskelijanumerot, joita se ei tunnista, eikä tallenna ennen kuin korjaat tai poistat ne.
- _Kurssien opiskelijat_: valitse kohdan [[organisationSurveys:addCourses]] vierestä ajanjakso, hae koulutusohjelman kurssitoteutuksia nimellä tai koodilla ja valitse ne. Jokaisen kohdalla näkyy sen opiskelijamäärä.

Kurssien opiskelijat kopioidaan kyselyyn tallennettaessa; lista ei seuraa myöhempiä muutoksia ilmoittautumisissa. Jos haluat lisätä myöhemmin ilmoittautuneet, avaa [[organisationSurveys:editSurvey]] ja tallenna uudelleen: valittujen kurssien nykyiset opiskelijat kopioidaan silloin.

## Vastuuhenkilöt {#responsible-persons}

Kyselyn [[organisationSurveys:responsibleTeachers]] saavat vastuuopettajan oikeudet vain tähän kyselyyn: he voivat muokata sen kysymyksiä ennen avautumista, muuttaa sen asetuksia, nähdä kaikki sen vastaukset ja [[feedbackTargetView:studentsWithFeedbackTab]]-välilehden, lähettää muistutusviestejä ja kirjoittaa vastapalautteen. Kyselyn sivulla heidät on lueteltu otsikon [[feedbackTargetView:administrativePersons]] alla. He löytävät kyselyn [[navBar:myCourses]]-sivulta kohdasta [[teacherView:organisationSurveys]].

Kun lisäät vastuuhenkilön, kirjoita kenttään vähintään viisi merkkiä hänen nimestään tai sähköpostiosoitteestaan ja valitse hänet. Haku löytää vain yliopiston henkilökuntaa; jos henkilöä ei löydy, pyydä häntä kirjautumaan kerran Norppaan. Vastuuhenkilöitä on aina oltava vähintään yksi.

Koulutusohjelman hallinnoijat voivat muokata kyselyä ja nähdä sen vastaukset, vaikka eivät olisi vastuuhenkilöitä. [Vastapalautteen](/guide/counter-feedback) voivat kuitenkin kirjoittaa vain vastuuhenkilöt, joten lisää itsesi, jos kirjoitat sen.

## Kyselyn muokkaaminen {#edit}

Avaa kysely [[navBar:myCourses]]-sivulta kohdasta [[teacherView:organisationSurveys]] tai koulutusohjelman [[organisationSettings:organisationSurveysTab]]-välilehdeltä painikkeella [[organisationSurveys:viewFeedback]].

- _Nimi, päivämäärät, vastuuhenkilöt ja vastaajat_: valitse kyselyn sivulla [[organisationSurveys:editSurvey]], tee muutokset ja valitse [[common:save]]. Tämä onnistuu ennen palautejaksoa, sen aikana ja sen jälkeen.
- _Kysymykset_: [[feedbackTargetView:surveyQuestionsTab]]-välilehti, kunnes kysely avautuu. Sen jälkeen kysymykset on lukittu.

Jos haluat avata kyselyn heti, aseta sen alkamispäiväksi tämä päivä: kysely avautuu heti, mutta opiskelijat eivät saa sähköpostia. Päättyneen kyselyn saa avattua uudelleen siirtämällä sen päättymispäivää eteenpäin.

### Muistutusviestin lähettäminen {#reminders}

Norppa ei itse lähetä opiskelijoille sähköpostia koulutusohjelman kyselystä. Kun kysely on auki, vastuuhenkilö tai koulutusohjelman hallinnoija voi [lähettää muistutusviestin](/guide/collecting-answers#send-reminder) kyselyn [[feedbackTargetView:shareTab]]-välilehdeltä opiskelijoille, jotka eivät ole vielä vastanneet.

## Tulokset {#results}

Vastaukset näkyvät kyselyn [[feedbackTargetView:feedbacksTab]]-välilehdellä sitä mukaa kuin niitä tulee; koulutusohjelman [[organisationSettings:organisationSurveysTab]]-välilehdeltä pääset sinne painikkeella [[organisationSurveys:viewResults]]. Ne toimivat kuten kurssikyselyissä; katso [Tulokset](/guide/results). Koulutusohjelman kyselyiden välilehdellä jokaisen kyselyn kortissa näkyy [[organisationSurveys:givenFeedback]] muodossa vastaukset / vastaajat.

Kun kysely on päättynyt, vastuuhenkilöt voivat kirjoittaa opiskelijoille vastapalautteen. Jos kyselyyn on vastattu, mutta vastapalautetta ei ole kirjoitettu, he saavat muistutusviestin päättymistä seuraavana päivänä, ja [[navBar:myCourses]]-sivulla näkyy [[teacherView:feedbackResponseMissing]]. Katso [Vastapalaute](/guide/counter-feedback).

Koulutusohjelman kyselyt eivät ole mukana [kurssiyhteenvedossa](/guide/course-summary).

### Kyselyn poistaminen {#remove}

Koulutusohjelman kyselyn voi poistaa niin kauan kuin kukaan ei ole vastannut siihen: valitse koulutusohjelman [[organisationSettings:organisationSurveysTab]]-välilehdellä kyselyn kortista [[organisationSurveys:remove]] ja vahvista. Kun kyselyyn on vastattu, painiketta ei enää ole; jos kyselyyn ei pidä enää vastata, muuta sen päivämääriä.
