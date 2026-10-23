# Kurssikyselyt

Norppa luo jokaiselle kurssitoteutukselle kurssikyselyn automaattisesti, ja sen päivämäärät määräytyvät kurssin Sisussa olevien päivämäärien mukaan. Sinun ei tarvitse tehdä mitään, jotta kysely avautuu: vastuuopettajat voivat lisätä omia kysymyksiään ja muuttaa päivämääriä, mutta se ei ole pakollista.

## Mille kursseille tulee kysely {#which-courses}

Kurssikysely luodaan kurssitoteutuksille, joiden toteutustyyppi Sisussa on jokin seuraavista:

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
- sekä pelkästään Kielikeskuksessa itsenäisen työskentelyn projektit.

<!-- Sisu-koodit: urn:code:course-unit-realisation-type:teaching-participation-lab, -online, -field-course, -project, -lectures, -small-group, -seminar, -blended, -contact, -distance; Kielikeskukselle (hy-org-1000003401) myös independent-work-project. Lähde: validRealisationTypes, norppa-updater, updateCoursesAndTeacherFeedbackTargets.js. -->

Muille toteutustyypeille, kuten tenteille, opinnäytteille, esseille, itsenäiselle työskentelylle ja harjoittelulle, kyselyä ei tule opintopisteistä riippumatta. Pyynnöstä tuki voi ottaa kyselyn käyttöön itsenäisen työskentelyn projektille, esseelle, harjoittelulle tai pro gradu -tutkielmalle, mutta ei tentille.

Kyselyä ei tule myöskään, jos toteutus on Sisussa peruttu, arkistoitu tai vielä luonnos tai jos sitä ei ole liitetty opintojaksoon.

- Toteutuksella on vain yksi kysely, vaikka se kuuluisi useaan opintojaksoon.
- Kurssikyselyä ei voi poistaa, mutta koulutusohjelma voi [poistaa palautteen käytöstä](/guide/programmes#disable-feedback) opintojaksolta.
- Jos haluat palautetta jostain, jolla ei ole kurssikyselyä, kuten tentistä tai useasta kurssista yhdessä, koulutusohjelma voi luoda [koulutusohjelman kyselyn](/guide/programme-surveys).

## Päivitykset Sisusta {#sisu-updates}

Norppa päivittää tietonsa Sisusta joka yö:

- Uudet kurssit ja niiden kyselyt, opettajat, roolit ja kurssien päivämäärät. Sisussa tehty muutos näkyy Norpassa seuraavana aamuna.
- Sisussa määritellyt ryhmät (opetusryhmät) tulevat ryhmiksi saman kyselyn sisälle, eivät erillisiksi kyselyiksi. Katso [Ryhmät](/guide/questions#groups).

Opiskelijoiden ilmoittautumiset päivittyvät useammin: uusi ilmoittautuminen näkyy Norpassa yleensä parin tunnin kuluessa. Vain hyväksytyt ilmoittautumiset otetaan huomioon. Opiskelija, jonka ilmoittautuminen perutaan, poistetaan seuraavana yönä, ellei hänelle ole jo lähetetty kyselyn linkkiä tai hän ole jo vastannut.

## Oletusarvoinen palauteaika {#feedback-period}

Oletuksena kurssikysely avautuu kurssin viimeistä päivää seuraavana päivänä klo 00.00 ja sulkeutuu 14 päivää myöhemmin klo 23.59, joten se on auki noin kaksi viikkoa. Jos kurssin viimeinen päivä on esimerkiksi 12. joulukuuta, kysely on auki 13.–27. joulukuuta.

Kurssin sivulla näkyvät molemmat ajat: [[feedbackTargetView:coursePeriod]] on kurssin päivämäärät Sisusta ja [[feedbackTargetView:feedbackPeriod]] kyselyn päivämäärät.

- Vain kurssin päivämäärät Sisussa ratkaisevat, eivät sen opetustapahtumat. Jos kurssin päivämäärät Sisussa jatkuvat opetuksen jälkeen, esimerkiksi tenttiin asti, kysely avautuu vastaavasti myöhemmin.
- Niin kauan kuin kukaan ei ole tallentanut kyselylle päivämääriä Norpassa, kyselyn päivämäärät seuraavat joka yö kurssin päivämääriä Sisussa. Kurssin päivämäärien muuttaminen Sisussa siis siirtää myös kyselyä.
- Kun päivämäärät on kerran tallennettu Norpassa, Sisu ei enää muuta niitä.

Viikkoa ennen kyselyn avautumista vastuuopettajat saavat sähköpostin, joka muistuttaa, että he voivat vielä lisätä omia kysymyksiä. Katso [Norpan lähettämät sähköpostit](/guide/collecting-answers#emails).

## Päivämäärien muuttaminen {#change-dates}

Vastuuopettajat ja hallintohenkilöt voivat muuttaa kurssikyselyn päivämääriä:

1. Valitse [[navBar:myCourses]] ja sieltä kurssi.
2. Napsauta [[common:edit]] kohdan [[feedbackTargetView:feedbackPeriod]] vieressä.
3. Valitse ikkunassa [[feedbackTargetSettings:editPeriodTitle]] päivämäärät kohtiin [[editFeedbackTarget:opensAt]] ja [[editFeedbackTarget:closesAt]].
4. Napsauta [[common:save]].

[[video:change-dates]]

Se, mitä voit muuttaa, riippuu kyselyn tilasta:

- Ennen avautumista voit muuttaa molempia päivämääriä. Avautumispäivä ei voi olla menneisyydessä, ja kyselyn pitää olla auki vähintään vuorokauden, joten sulkeutumispäivän on oltava aikaisintaan avautumispäivää seuraava päivä.
- Kun kysely on auki, voit muuttaa vain sulkeutumispäivää. Voit jatkaa kyselyä esimerkiksi arvioinnin jälkeiseen aikaan tai asettaa sulkeutumispäiväksi tämän päivän, jolloin kysely sulkeutuu tänään klo 23.59. Painiketta, joka sulkisi kyselyn heti, ei ole.
- Kun kysely on sulkeutunut, päivämääriä ei voi enää muuttaa. Vain tuki voi avata sulkeutuneen kurssikyselyn uudelleen.

Jos haluat avata kyselyn heti, napsauta samassa ikkunassa [[editFeedbackTarget:openImmediately]] ja vahvista valitsemalla [[editFeedbackTarget:openFeedbackImmediatelyDialogConfirm]]. Kysely avautuu saman tien, ja opiskelijat saavat linkin sähköpostiinsa heti. Lisää omat kysymyksesi ensin: kun kysely on auki, niitä ei voi enää muuttaa.

Jos sen sijaan asetat avautumispäiväksi tämän päivän ja tallennat, Norppa pyytää niin ikään vahvistusta, ja kysely avautuu saman tien. Opiskelijat saavat silloin sähköpostinsa päivittäisessä postituksessa klo 11.15, tai seuraavana päivänä, jos se on jo mennyt.

> **Huom.** Välipalautteet ja koulutusohjelman kyselyt eivät seuraa Sisua, ja niiden päivämäärät muutetaan toisella tavalla missä tahansa tilassa. Katso [Välipalaute](/guide/continuous-and-interim-feedback#interim-feedback) ja [Koulutusohjelman kyselyn muokkaaminen](/guide/programme-surveys#edit).
