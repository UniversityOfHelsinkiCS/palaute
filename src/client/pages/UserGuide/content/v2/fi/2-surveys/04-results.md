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

Jos kurssilla on Sisussa ryhmiä tai kyselyssä on ryhmittelykysymys, voit katsoa yhden ryhmän vastauksia välilehden yläosan valinnalla [[groups:chooseGroup]]. Yksittäisen ryhmän vastaukset näytetään vain, jos jokaisessa ryhmässä on vähintään 5 vastausta tai ei yhtään, jotta vastaajia ei voi tunnistaa. Katso [ryhmät](/guide/questions#groups).

Jos kurssille on ilmoittautunut alle 5 opiskelijaa, tulokset näkyvät vain kurssin vastuuopettajille. Katso [pienet kurssit](#small-courses).

## Kuka näkee mitkäkin vastaukset {#public-answers}

Jokainen kysymys on joko [[common:public]] tai [[common:notPublic]].

- Vastuuopettajat, hallintohenkilöt ja koulutusohjelman henkilöt, joilla on admin-oikeudet, näkevät kaikkien kysymysten vastaukset.
- Opettajat, opiskelijat ja ne koulutusohjelman henkilöt, joilla on lukuoikeudet, näkevät vain julkisten kysymysten vastaukset. Opiskelijat näkevät ne vastattuaan itse tai kyselyn sulkeuduttua.

Roolit on kuvattu sivulla [roolit](/guide/roles#course-roles).

Oletuksena:

- Opettajan lisäämät asteikko- ja valintakysymykset ovat julkisia.
- Avoimet kysymykset eivät ole julkisia.
- Toisesta kyselystä kopioidut ja kurssin edelliseltä toteutukselta siirtyneet kysymykset eivät ole julkisia.
- Kysymykset, jotka yliopisto tai koulutusohjelma on asettanut julkisiksi, ovat aina julkisia, eikä sitä voi muuttaa. Näitä ovat yliopistotason asteikko- ja valintakysymykset.

Kysymyksen näkyvyyden muuttaminen (vastuuopettajat):

1. Klikkaa [[feedbackTargetView:feedbacksTab]]-välilehdellä kysymyksen yläpuolelta [[common:public]] tai [[common:notPublic]].
2. Valitse [[common:publicInfo]] tai [[common:notPublicInfo]]. Muutos tallentuu heti.

[[video:answer-visibility]]

Ennen kyselyn avautumista asteikko- ja valintakysymysten näkyvyyden voi asettaa myös [kysymyksiä muokatessa](/guide/questions#edit-questions).

Avoimen kysymyksen voi asettaa julkiseksi vasta kyselyn sulkeuduttua, koska vastauksissa voi olla henkilötietoja. Norppa pyytää vahvistamaan, että olet tarkistanut, ettei vastauksissa ole henkilötietoja tai muuta arkaluontoista tietoa.

## Alle viiden opiskelijan kurssit {#small-courses}

Pienellä kurssilla opiskelijan vastaukset voisi tunnistaa ilman nimeäkin. Siksi kysely toimii toisin, jos kurssille on ilmoittautunut alle viisi opiskelijaa:

- Kun opiskelija avaa kyselyn, häntä varoitetaan, että vastaukset voi olla mahdollista yhdistää häneen. Hän voi perua tai jatkaa.
- Lähettääkseen vastauksensa opiskelijan on rastitettava kohta, jolla hän hyväksyy, että opettaja näkee vastaukset, vaikka ilmoittautuneita on vähän.
- Vastaukset näkevät vain kurssin vastuuopettajat ja hallintohenkilöt. Opiskelijat, muut opettajat ja koulutusohjelman henkilöstö näkevät ilmoituksen, ettei tuloksia näytetä.
- Viikkoa ennen aukeamista lähetettävä muistutus kertoo vastuuopettajille, että kurssi on pieni.

Raja lasketaan Norpassa kurssille ilmoittautuneista opiskelijoista, ei vastauksista. Se koskee kaikkia kyselytyyppejä.

## Avointen vastausten piilottaminen {#hide-answers}

Jos avoimessa vastauksessa on henkilötietoja, kuten opiskelijanumero, tai se on muuten asiaton, vastuuopettaja tai koulutusohjelman admin voi piilottaa sen:

1. Etsi vastaus [[feedbackTargetView:feedbacksTab]]-välilehdeltä.
2. Klikkaa sen vieressä olevaa silmäkuvaketta ([[feedbackTargetResults:setHidden]]).

[[video:hide-answers]]

Vastaus piilotetaan kaikilta, jotka näkevät vain julkiset vastaukset. Vastuuopettajat ja koulutusohjelman adminit näkevät sen edelleen piilotetuksi merkittynä. Myös saman kysymyksen täsmälleen samanlaiset vastaukset piilotetaan. Piilotuksen saa pois klikkaamalla kuvaketta uudelleen ([[feedbackTargetResults:setVisible]]).

Piilottamisella on merkitystä vain julkisissa kysymyksissä. Piilotetut vastaukset jätetään pois pdf-tiedostosta.

Vastauksia ei voi poistaa. Jos vastaus on poistettava kokonaan, ota yhteyttä [tukeen](/guide/help#support).

## Ketkä ovat vastanneet {#who-answered}

[[feedbackTargetView:studentsWithFeedbackTab]]-välilehdellä on luettelo kyselyn opiskelijoista nimineen, opiskelijanumeroineen ja sähköpostiosoitteineen. Sen näkevät vastuuopettajat ja koulutusohjelman adminit.

Se, onko opiskelija vastannut ([[common:feedbackGiven]] tai [[common:feedbackNotGiven]]), näytetään vain, jos

- kysely on sulkeutunut,
- vähintään 5 opiskelijaa on vastannut ja
- kurssin koulutusohjelma sallii sen asetuksissaan kaikille kursseilleen tai juuri tälle kurssille. Katso [koulutusohjelman asetukset](/guide/programmes#settings).

Muuten sarakkeessa lukee [[common:feedbackHidden]]. Luettelosta ei koskaan näe, kuka vastasi mitäkin.

[[feedbackTargetView:copyStudentNumbers]] kopioi opiskelijanumerot esimerkiksi sähköpostiin liitettäviksi. [[common:exportXLSX]] lataa luettelon.

## Vastausten lataaminen {#download}

Vastuuopettajat ja koulutusohjelman henkilöt voivat ladata vastaukset [[feedbackTargetView:feedbacksTab]]-välilehden yläosan valikosta [[feedbackTargetResults:export]]:

- [[common:exportXLSX]]: taulukko, jossa on sarake kullekin kysymykselle. Vastaukset on sekoitettu sarakkeittain, joten rivi ei ole yhden opiskelijan vastaukset. Tiedostossa ei ole aikaleimoja eikä opiskelijoiden tietoja.
- [[common:exportPdf]]: avaa selaimen tulostusnäkymän välilehdestä sellaisena kuin se näkyy, kaavioina tai taulukkoina. Tallenna se siellä pdf-tiedostoksi.

Saat vain ne vastaukset, jotka näet välilehdellä. Jos olet valinnut ryhmän, saat vain sen ryhmän vastaukset.

Kurssien, vuosien ja koulutusohjelmien yhteiset luvut löydät [kurssiyhteenvedosta](/guide/course-summary).

[[video:download-answers]]
