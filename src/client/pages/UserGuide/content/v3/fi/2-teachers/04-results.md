# Tulokset

Kyselyn vastaukset näkyvät sen [[feedbackTargetView:feedbacksTab]]-välilehdellä ensimmäisestä vastauksesta lähtien, joten voit seurata niitä jo kyselyn ollessa auki. Tulokset toimivat samoin kurssipalautteessa, välipalautteessa ja koulutusohjelman kyselyissä.

## Vastausten katsominen {#view-answers}

1. Valitse kurssi [[navBar:myCourses]]-sivulta. Päättyneiden kurssien kyselyt ovat [[teacherView:endedSurveys]]-välilehdellä.
2. Avaa [[feedbackTargetView:feedbacksTab]]-välilehti.

[[video:view-answers]]

Välilehdellä näet:

- Vastausten kertymän päivittäin osuutena kyselyn opiskelijoista. Kaavioon on merkitty kyselyn avautumis- ja sulkeutumispäivä sekä viimeisin muistutusviesti.
- Otsikon [[questionResults:multipleChoiceQuestions]] alla kunkin asteikko- ja valintakysymyksen vastausjakauman. Asteikkokysymyksistä näytetään myös keskiarvo, johon [[feedbackView:dontKnowOption]]-vastauksia ei lasketa. Työmääräkysymyksessä nuoli osoittaa, kumpaan suuntaan vastaukset painottuvat.
- Otsikon [[questionResults:openQuestions]] alla avointen kysymysten vastaukset aakkosjärjestyksessä.

Uudet vastaukset tulevat näkyviin, kun lataat sivun uudelleen. [[feedbackTargetResults:tableView]] näyttää kaaviot taulukkoina ja [[feedbackTargetResults:chartView]] palauttaa kaaviot.

Jos kurssilla on Sisussa ryhmiä tai kyselyssä on ryhmittelykysymys, voit katsoa yhden ryhmän vastauksia välilehden yläosan valinnalla [[groups:chooseGroup]]. Yksittäisen ryhmän vastaukset näytetään vain, jos jokaisessa ryhmässä on joko ei yhtään tai vähintään viisi vastausta; katso [Ryhmien vastaukset](/guide/anonymity#groups).

Jos kurssille on ilmoittautunut alle viisi opiskelijaa, tulokset näkyvät vain kurssin vastuuopettajille ja hallintohenkilöille. Katso [Alle viiden opiskelijan kurssit](/guide/anonymity#small-courses).

## Vastausten näkyvyyden muuttaminen {#visibility}

Jokainen kysymys on joko [[common:public]] tai [[common:notPublic]]. Sinä, muut vastuuopettajat ja hallintohenkilöt sekä koulutusohjelman adminit näette kaikki vastaukset. Muut opettajat, koulutusohjelman lukuoikeuksilla olevat ja opiskelijat näkevät vain julkisten kysymysten vastaukset. Kaikki säännöt ja oletukset ovat kohdassa [Kuka näkee mitkäkin vastaukset](/guide/anonymity#public-answers).

Kysymyksen näkyvyyden muuttaminen:

1. Klikkaa [[feedbackTargetView:feedbacksTab]]-välilehdellä kysymyksen yläpuolelta [[common:public]] tai [[common:notPublic]].
2. Valitse [[common:publicInfo]] tai [[common:notPublicInfo]]. Muutos tallentuu heti.

[[video:answer-visibility]]

Ennen kyselyn avautumista asteikko- ja valintakysymysten näkyvyyden voi asettaa myös [kysymyksiä muokatessa](/guide/questions#edit-questions).

Avoimen kysymyksen voi asettaa julkiseksi vasta kyselyn sulkeuduttua, koska vastauksissa voi olla henkilötietoja. Norppa pyytää vahvistamaan, että olet tarkistanut, ettei vastauksissa ole henkilötietoja tai muuta arkaluontoista tietoa.

Yliopiston ja koulutusohjelman julkisiksi asettamien kysymysten näkyvyyttä et voi muuttaa.

## Avointen vastausten piilottaminen {#hide-answers}

Jos avoimessa vastauksessa on henkilötietoja, kuten opiskelijanumero, tai se on muuten asiaton, voit piilottaa sen. Myös koulutusohjelman adminit voivat piilottaa vastauksia.

1. Etsi vastaus [[feedbackTargetView:feedbacksTab]]-välilehdeltä.
2. Klikkaa sen vieressä olevaa silmäkuvaketta ([[feedbackTargetResults:setHidden]]).

[[video:hide-answers]]

Vastaus piilotetaan kaikilta, jotka näkevät vain julkiset vastaukset. Vastuuopettajat ja koulutusohjelman adminit näkevät sen edelleen piilotetuksi merkittynä. Myös saman kysymyksen täsmälleen samanlaiset vastaukset piilotetaan. Piilotuksen saa pois klikkaamalla kuvaketta uudelleen ([[feedbackTargetResults:setVisible]]).

Piilottamisella on merkitystä vain julkisissa kysymyksissä. Piilotetut vastaukset jätetään pois pdf-tiedostosta.

Vastauksia ei voi poistaa. Jos vastaus on poistettava kokonaan, ota yhteyttä [tukeen](/guide/help#support).

## Ketkä ovat vastanneet {#who-answered}

[[feedbackTargetView:studentsWithFeedbackTab]]-välilehdellä on luettelo kyselyn opiskelijoista nimineen, opiskelijanumeroineen ja sähköpostiosoitteineen. Sen näkevät vastuuopettajat ja koulutusohjelman adminit.

Se, onko opiskelija vastannut ([[common:feedbackGiven]] tai [[common:feedbackNotGiven]]), näytetään vain, kun kysely on sulkeutunut, vähintään viisi opiskelijaa on vastannut ja kurssin koulutusohjelma sallii sen. Muuten sarakkeessa lukee [[common:feedbackHidden]]. Luettelosta ei koskaan näe, kuka vastasi mitäkin. Katso tarkemmin [Ketkä ovat vastanneet](/guide/anonymity#who-answered).

[[feedbackTargetView:copyStudentNumbers]] kopioi opiskelijanumerot esimerkiksi sähköpostiin liitettäviksi. [[common:exportXLSX]] lataa luettelon.

## Vastausten lataaminen {#download}

Vastuuopettajat ja koulutusohjelman henkilöt voivat ladata vastaukset [[feedbackTargetView:feedbacksTab]]-välilehden yläosan valikosta [[feedbackTargetResults:export]]:

- [[common:exportXLSX]]: taulukko, jossa on sarake kullekin kysymykselle. Vastaukset on sekoitettu sarakkeittain, joten rivi ei ole yhden opiskelijan vastaukset. Tiedostossa ei ole aikaleimoja eikä opiskelijoiden tietoja.
- [[common:exportPdf]]: avaa selaimen tulostusnäkymän välilehdestä sellaisena kuin se näkyy, kaavioina tai taulukkoina. Tallenna se siellä pdf-tiedostoksi.

[[video:download-answers]]

Saat vain ne vastaukset, jotka näet välilehdellä. Jos olet valinnut ryhmän, saat vain sen ryhmän vastaukset.

Kurssien, vuosien ja koulutusohjelmien yhteiset luvut löydät [kurssiyhteenvedosta](/guide/course-summary).
