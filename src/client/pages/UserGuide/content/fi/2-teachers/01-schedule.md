---
description: Milloin kurssikysely avautuu ja sulkeutuu, ja miten muutat sen päivämääriä.
---

# Kyselyn aikataulu

Norppa luo kurssipalautekyselyn automaattisesti, ja kysely myös avautuu ja sulkeutuu automaattisesti. Opettajan ei tarvitse tehdä mitään, jotta kysely avautuu. Ennen avautumista opettaja voi kuitenkin lisätä [omia kysymyksiä](/guide/questions) ja [muuttaa päivämääriä](#change-dates).

## Milloin kysely on auki {#feedback-period}

Oletuksena kurssipalautekysely avautuu kurssin viimeistä päivää seuraavana päivänä klo 00.00 ja sulkeutuu 14 päivää myöhemmin klo 23.59, joten se on auki noin kaksi viikkoa. Jos kurssin viimeinen päivä on esimerkiksi 12. joulukuuta, kysely on auki 13.–27. joulukuuta.

Norppa näyttää sekä kurssin päivämäärät (Sisusta): [[feedbackTargetView:coursePeriod]] että palautekyselyn päivämäärät: [[feedbackTargetView:feedbackPeriod]].

- Opintokohteen (kurssin) päivämäärät Sisussa määrittävät kurssipalautekyselyn aikataulun. Jos kurssin päivämäärät Sisussa jatkuvat luento-opetuksen jälkeen, esimerkiksi tenttiin asti, kysely avautuu vastaavasti myöhemmin.
- Opintokohteen (kurssin) päivämäärien muuttaminen Sisussa muuttaa myös kurssipalautekyselyn päivämääriä automaattisesti.
- Jos opettaja muuttaa kurssipalautelomakkeen päivämääriä manuaalisesti Norpassa, Sisun muutokset eivät enää vaikuta.

Noin viikkoa ennen kyselyn avautumista vastuuopettajat ja hallintohenkilöt saavat sähköpostin, jossa on kyselyn päivämäärät, linkki sen muokkaamiseen ja opettajien siihen mennessä lisäämät kysymykset. Sähköpostissa on myös maininta, jos kurssille on ilmoittautunut alle viisi opiskelijaa; katso [Alle viiden opiskelijan kurssit](/guide/anonymity#small-courses).

## Päivämäärien muuttaminen {#change-dates}

Kurssin vastuuopettajana tai hallintohenkilönä voit muuttaa kurssipalautekyselyn päivämääriä:

1. Valitse [[navBar:myCourses]] ja sieltä kurssi.
2. Klikkaa [[common:edit]] kohdan [[feedbackTargetView:feedbackPeriod]] vieressä.
3. Valitse ikkunassa [[feedbackTargetSettings:editPeriodTitle]] päivämäärät kohtiin [[editFeedbackTarget:opensAt]] ja [[editFeedbackTarget:closesAt]].
4. Klikkaa [[common:save]].

[[video:change-dates]]

Vastuuopettaja voi kurssipalautekyselyn tilasta (tuleva, aktiivinen, päättynyt) riippuen muokata seuraavia asetuksia:

- Ennen avautumista voit muuttaa avautumis- ja päättymispäivämääriä. Avautumispäivä ei voi olla menneisyydessä, ja kyselyn pitää olla auki vähintään vuorokauden, joten sulkeutumispäivän on oltava aikaisintaan avautumispäivää seuraava päivä.
- Kun kysely on auki, voit muuttaa vain päättymispäivämäärää. Voit jatkaa kyselyä esimerkiksi arvioinnin jälkeiseen aikaan tai asettaa päättymispäivämääräksi kuluvan päivän, jolloin kysely sulkeutuu tänään klo 23.59. Painiketta, joka sulkisi kyselyn heti, ei ole.
- Kun kysely on sulkeutunut, päivämääriä ei voi enää muuttaa. Vain tuki voi avata sulkeutuneen kurssikyselyn uudelleen; katso [Tuki](/guide/help#support).

> **Huom.** Välipalautteet ja koulutusohjelman palautekyselyt eivät ole sidottuja Sisuun, ja niiden päivämääriä voi muuttaa toisella tavalla kyselyn tilasta riippumatta. Katso [Välipalaute](/guide/during-the-course#interim-feedback) ja [Koulutusohjelman kyselyn muokkaaminen](/guide/programme-surveys#edit).

## Kyselyn avaaminen heti {#open-now}

(huom.! Lisää omat kysymyksesi ensin: kun kysely on auki, niitä ei voi enää muuttaa.)

1. Valitse [[navBar:myCourses]] ja sieltä kurssi.
2. Klikkaa [[common:edit]] kohdan [[feedbackTargetView:feedbackPeriod]] vieressä.
3. Klikkaa ikkunassa [[editFeedbackTarget:openImmediately]].
4. Vahvista valitsemalla [[editFeedbackTarget:openFeedbackImmediatelyDialogConfirm]].

Kysely avautuu saman tien, ja opiskelijat saavat linkin sähköpostiinsa heti.

Jos sen sijaan asetat avautumispäiväksi tämän päivän ja tallennat, Norppa pyytää niin ikään vahvistusta, ja kurssipalautekysely avautuu saman tien. Opiskelijat saavat silloin sähköpostinsa päivittäisessä postituksessa klo 11.15 tai seuraavana päivänä, jos päivän postitus on jo lähtenyt.

## Mille kursseille tulee kysely {#which-courses}

Kurssikysely luodaan automaattisesti opintokohteille (kursseille), joiden toteutustyyppi Sisussa on jokin seuraavista:

- laboratoriotyöskentely
- verkko-opetus
- kenttäkurssi
- projekti
- luento-opetus
- pienryhmäopetus
- seminaari
- monimuoto-opetus
- lähiopetus
- etäopetus
- itsenäisen työskentelyn projekti, mutta vain Kielikeskuksen kursseilla.

<!-- Sisu-koodit: urn:code:course-unit-realisation-type:teaching-participation-lab, -online, -field-course, -project, -lectures, -small-group, -seminar, -blended, -contact, -distance; Kielikeskukselle (hy-org-1000003401) myös independent-work-project. Lähde: validRealisationTypes, norppa-updater, updateCoursesAndTeacherFeedbackTargets.js. -->

Muille toteutustyypeille, kuten tenteille, opinnäytteille, esseille, itsenäiselle työskentelylle ja harjoittelulle, kurssipalautekysely voidaan avata erikseen tuen kautta: [norppa@helsinki.fi](mailto:norppa@helsinki.fi).

Kyselyä ei tule myöskään, jos toteutus on Sisussa luonnostilassa, peruttu, arkistoitu tai jos sitä ei ole liitetty opintojaksoon.

- Toteutuksella on vain yksi kysely, vaikka se kuuluisi useaan opintojaksoon.
- Kurssikyselyä ei voi poistaa, mutta koulutusohjelma voi [poistaa palautteen käytöstä](/guide/settings#disable-feedback) opintojaksolta.
- Jos haluat palautetta jostain muusta kuin opintokohteesta, esim. tentistä tai useasta kurssista yhdessä, koulutusohjelma voi luoda [koulutusohjelman kyselyn](/guide/programme-surveys).

## Päivitykset Sisusta {#sisu-updates}

Norppa päivittää tietonsa Sisusta joka yö:

- Uudet kurssit ja niiden kyselyt, opettajat, roolit ja kurssien päivämäärät. Sisussa tehty muutos näkyy Norpassa seuraavana aamuna.
- Sisussa määritellyt ryhmät (opetusryhmät) tulevat ryhmiksi saman kyselyn sisälle, eivät erillisiksi kyselyiksi. Katso [Ryhmät](/guide/questions#groups).

Opiskelijoiden ilmoittautumiset päivittyvät useammin: uusi ilmoittautuminen näkyy Norpassa yleensä parin tunnin kuluessa. Vain hyväksytyt ilmoittautumiset otetaan huomioon. Opiskelija, jonka ilmoittautuminen perutaan, poistetaan seuraavana yönä, ellei hänelle ole jo lähetetty kyselyn linkkiä tai hän on jo vastannut.
