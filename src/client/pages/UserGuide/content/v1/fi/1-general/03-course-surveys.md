# Kurssikyselyt

Norppa luo jokaiselle kurssitoteutukselle kurssikyselyn automaattisesti, ja sen päivämäärät määräytyvät kurssin Sisussa olevien päivämäärien mukaan. Sinun ei tarvitse tehdä mitään, jotta kysely avautuu: vastuuopettajat voivat lisätä [omia kysymyksiään](/guide/questions) ja [muuttaa päivämääriä](/guide/survey-dates), mutta se ei ole pakollista.

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

Viikkoa ennen kyselyn avautumista vastuuopettajat saavat sähköpostin, joka muistuttaa, että he voivat vielä lisätä omia kysymyksiä. Katso [Norpan sähköpostit](/guide/emails).

Vastuuopettajat voivat muuttaa päivämääriä Norpassa; katso [Kyselyn päivämäärät](/guide/survey-dates).

## Yliopistotason kysymykset {#university-questions}

Yliopisto on määrittänyt nämä kysymykset kaikkiin kurssien kyselyihin. Ne ovat samat kaikilla kursseilla, eikä niitä voi muokata tai poistaa. Kysymyseditorissa ne on merkitty tunnisteella [[questionEditor:universityQuestion]]. Välipalautteessa ja koulutusohjelman kyselyssä niitä ei ole, mutta voit [kopioida ne niihin](/guide/questions#copy-questions).

Ne näkyvät [[feedbackTargetView:surveyQuestionsTab]]-välilehden alussa. Kyselyn kysymykset riippuvat sen avautumispäivästä: 2.8.2026 tai myöhemmin aukeavissa kyselyissä on uudet kysymykset.

Yliopistotason asteikkokysymysten keskiarvot näkyvät [kurssiyhteenvedossa](/guide/course-summary#figures).

## Koulutusohjelman kysymykset {#programme-questions}

Koulutusohjelma tai tiedekunta voi lisätä omia kysymyksiään kaikkien opintojaksojensa kyselyihin. Kysymyseditorissa ne on merkitty tunnisteella [[questionEditor:programmeQuestion]], ja [[feedbackTargetView:surveyQuestionsTab]]-välilehden yläreunan laatikko kertoo, montako niitä on ja mikä organisaatio ne on lisännyt.

Opettaja ei voi muokata tai poistaa koulutusohjelman kysymyksiä. Jos jokin niistä ei sovi kurssillesi, ota yhteyttä koulutusohjelmaan. Välipalautteessa ja koulutusohjelman kyselyssä ei ole koulutusohjelman kysymyksiä.

Koulutusohjelman henkilöstö lisää ja muokkaa näitä kysymyksiä koulutusohjelman sivulla, ks. [Koulutusohjelman kysymykset](/guide/programmes#programme-questions).

## Kysymysten järjestys opiskelijalle {#question-order}

Kysymyseditorissa ovat ensin yliopistotason kysymykset, sitten koulutusohjelman kysymykset ja lopuksi opettajan omat kysymykset. Opiskelija näkee ne tässä järjestyksessä:

1. Ryhmittelykysymys, jos kyselyssä on sellainen (ks. [Ryhmät](/guide/questions#groups)).
2. Yliopistotason asteikko- ja monivalintakysymykset.
3. Koulutusohjelman asteikko- ja monivalintakysymykset.
4. Opettajan omat kysymykset ja tekstiosiot siinä järjestyksessä, johon opettaja on ne laittanut.
5. Koulutusohjelman avoimet kysymykset.
6. Yliopistotason avoin kysymys _Muita huomioita_, joka on aina viimeisenä.

Lopputuloksen näet [[editFeedbackTarget:showPreview]]-painikkeella (ks. [Kieliversiot ja esikatselu](/guide/questions#languages)).
