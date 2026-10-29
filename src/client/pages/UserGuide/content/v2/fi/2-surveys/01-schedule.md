# Kyselyn aikataulu

Norppa luo jokaiselle kurssitoteutukselle kurssikyselyn automaattisesti, ja kysely avautuu ja sulkeutuu itsestään kurssin Sisussa olevien päivämäärien mukaan. Sinun ei tarvitse tehdä mitään: vastuuopettajat voivat lisätä [omia kysymyksiään](/guide/questions) ja [muuttaa päivämääriä](#change-dates), mutta se ei ole pakollista.

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
- itsenäisen työskentelyn projekti, mutta vain Kielikeskuksen kursseilla.

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

Viikkoa ennen kyselyn avautumista vastuuopettajat saavat sähköpostin, joka muistuttaa, että he voivat vielä lisätä omia kysymyksiä. Katso [Norpan sähköpostit](#emails).

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

## Kyselyn avaaminen heti {#open-now}

1. Valitse [[navBar:myCourses]] ja sieltä kurssi.
2. Napsauta [[common:edit]] kohdan [[feedbackTargetView:feedbackPeriod]] vieressä.
3. Napsauta ikkunassa [[editFeedbackTarget:openImmediately]].
4. Vahvista valitsemalla [[editFeedbackTarget:openFeedbackImmediatelyDialogConfirm]].

Kysely avautuu saman tien, ja opiskelijat saavat linkin sähköpostiinsa heti. Lisää omat kysymyksesi ensin: kun kysely on auki, niitä ei voi enää muuttaa.

Jos sen sijaan asetat avautumispäiväksi tämän päivän ja tallennat, Norppa pyytää niin ikään vahvistusta, ja kysely avautuu saman tien. Opiskelijat saavat silloin sähköpostinsa päivittäisessä postituksessa klo 11.15 tai seuraavana päivänä, jos päivän postitus on jo lähtenyt.

> **Huom.** Välipalautteet ja koulutusohjelman kyselyt eivät seuraa Sisua, ja niiden päivämääriä voi muuttaa toisella tavalla kyselyn tilasta riippumatta. Katso [Välipalaute](/guide/continuous-and-interim-feedback#interim-feedback) ja [Koulutusohjelman kyselyn muokkaaminen](/guide/programme-surveys#edit).

## Norpan sähköpostit {#emails}

Norppa lähettää kyselyjä koskevat automaattiset sähköpostinsa kerran päivässä kello 11.15.

Kurssin kysely:

- Noin viikkoa ennen kyselyn aukeamista vastuuopettajat ja hallintohenkilöt saavat muistutuksen, jossa ovat kyselyn päivämäärät, linkki sen muokkaamiseen ja opettajien siihen mennessä lisäämät kysymykset, jotta he ehtivät vielä lisätä omiaan.
- Avautumispäivänä opiskelijat saavat sähköpostin, jossa on linkki kyselyyn ja sen sulkeutumispäivä. Myöhemmin ilmoittautuneet saavat viestin myöhempänä päivänä kyselyn ollessa auki. Jos vastuuopettaja avaa kyselyn [[editFeedbackTarget:openImmediately]]-painikkeella, viesti lähtee heti (ks. [Kyselyn avaaminen heti](#open-now)).
- Kyselyn sulkeutumista seuraavana päivänä vastuuopettajat ja hallintohenkilöt saavat muistutuksen vastapalautteen kirjoittamisesta, jos kyselyyn on vastattu eikä vastapalautetta ole vielä kirjoitettu.

Koulutusohjelman kysely: vain vastapalautemuistutus kyselyn vastuuhenkilöille sulkeutumista seuraavana päivänä. Opiskelijat eivät saa viestiä kyselyn auetessa.

Välipalaute: ei lainkaan automaattisia sähköposteja.

Näiden lisäksi [jatkuvan palautteen](/guide/continuous-and-interim-feedback#continuous-feedback) kooste lähtee klo 8 niiltä kursseilta, joilla se on kytketty päälle, ja Norppa välittää viestit, jotka käyttäjät lähettävät sen kautta: [muistutusviestit](/guide/collecting-answers#send-reminder), [vastapalautteen](/guide/counter-feedback#send-email), jos päätät lähettää sen sähköpostilla, sekä vastaukset jatkuvaan palautteeseen.
