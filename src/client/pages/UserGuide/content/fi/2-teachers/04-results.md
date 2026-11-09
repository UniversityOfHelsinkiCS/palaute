---
description: Vastausten katsominen, niiden näkyvyys, avointen vastausten piilottaminen ja vastausten lataaminen.
---

# Tulokset

Kyselyn vastaukset näkyvät [[feedbackTargetView:feedbacksTab]]-välilehdellä ensimmäisestä vastauksesta lähtien, eli niitä voi seurata kyselyn ollessa auki. Tulokset toimivat samoin kurssipalautteessa, välipalautteessa ja koulutusohjelman kyselyissä.

## Vastausten katsominen {#view-answers}

1. Valitse kurssi [[navBar:myCourses]]-sivulta. Päättyneiden kurssien kyselyt ovat [[teacherView:endedSurveys]]-välilehdellä.
2. Avaa [[feedbackTargetView:feedbacksTab]]-välilehti.

[[video:view-answers]]

Välilehdellä näet:

- Vastausten kertymän päivittäin osuutena kyselyn opiskelijoista. Kaavioon on merkitty kyselyn avautumis- ja sulkeutumispäivä sekä viimeisin muistutusviesti.
- Otsikon [[questionResults:multipleChoiceQuestions]] alla kunkin asteikko- ja valintakysymyksen vastausjakauman. Asteikkokysymyksistä näytetään myös keskiarvo, johon [[feedbackView:dontKnowOption]]-vastauksia ei lasketa. Työmääräkysymyksessä nuoli osoittaa, kumpaan suuntaan vastaukset painottuvat.
- Otsikon [[questionResults:openQuestions]] alla avointen kysymysten vastaukset aakkosjärjestyksessä.

[[feedbackTargetResults:tableView]] näyttää kaaviot taulukkoina ja [[feedbackTargetResults:chartView]] palauttaa kaaviot.

Jos kurssilla on Sisussa ryhmiä tai kyselyssä on ryhmittelykysymys, voit suodattaa vastauksia ryhmäkohtaisesti valinnalla [[groups:chooseGroup]]. Yksittäisen ryhmän vastaukset näytetään vain, jos jokaisessa vastauksia saaneessa ryhmässä on vähintään viisi vastaajaa; katso [Ryhmien vastaukset](/guide/anonymity#groups).

Jos kurssille on ilmoittautunut alle viisi opiskelijaa, tulokset näkyvät vain kurssin vastuuopettajille ja hallintohenkilöille. Katso [Alle viiden opiskelijan kurssit](/guide/anonymity#small-courses).

## Vastausten näkyvyyden muuttaminen {#visibility}

Jokainen kysymys on joko [[common:public]] tai [[common:notPublic]]. Vastuuopettajat, hallintohenkilöt sekä koulutusohjelman adminit (koulutsohjelmajohtaja ja palautevastaava) näkevät kaikki vastaukset. Muut opettajat, koulutusohjelman lukuoikeuksilla olevat ja opiskelijat näkevät vain julkisten kysymysten vastaukset. Katso: [Vastausten näkyvyys eri käyttäjille](/guide/anonymity#public-answers).

Kysymyksen näkyvyyden muuttaminen:

1. Klikkaa [[feedbackTargetView:feedbacksTab]]-välilehdellä kysymyksen yläpuolelta [[common:public]] tai [[common:notPublic]].
2. Valitse [[common:publicInfo]] tai [[common:notPublicInfo]]. Muutos tallentuu heti.

[[video:answer-visibility]]

Ennen kyselyn avautumista asteikko- ja valintakysymysten näkyvyyden voi asettaa myös [kysymyksiä muokatessa](/guide/questions#edit-questions).

Avoimen kysymyksen voi asettaa julkiseksi vasta kyselyn sulkeuduttua, koska vastauksissa saattaa olla arkaluonteisia- tai henkilötietoja. Norppa pyytää vahvistamaan, että tämä on tarkistettu, ennenkuin vastaukset muutetaan julkisiksi.

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

[[feedbackTargetView:studentsWithFeedbackTab]]-välilehdellä on luettelo kurssin opiskelijoista (eli potentiaalisesta vastaajajoukosta). Lista näkevät vastuuopettajat ja koulutusohjelman adminit (koulutusohjelmajohtaja, palautevastaava).

Opiskelijan ([[common:feedbackGiven]] tai [[common:feedbackNotGiven]]), näytetään vain, kun kysely on sulkeutunut, vähintään viisi opiskelijaa on vastannut ja kurssin koulutusohjelma on sallinut toiminnallisuuden teknisesti, koulutusohjelman asetuksissa. Muuten sarakkeessa lukee [[common:feedbackHidden]]. Luettelosta ei koskaan näe, kuka vastasi mitäkin. Katso tarkemmin [Ketkä ovat vastanneet](/guide/anonymity#who-answered).

[[feedbackTargetView:copyStudentNumbers]] kopioi opiskelijanumerot esimerkiksi sähköpostiin liitettäviksi. [[common:exportXLSX]] lataa excel-tiedoston vastanneista.

## Vastausten lataaminen {#download}

Vastuuopettajat ja koulutusohjelman henkilöt voivat ladata vastaukset [[feedbackTargetView:feedbacksTab]]-välilehden yläosan valikosta [[feedbackTargetResults:export]]:

- [[common:exportXLSX]]: taulukko, jossa on sarake kullekin kysymykselle. Vastaukset on sekoitettu sarakkeittain, joten yksi rivi ei ole yhden opiskelijan vastaukset. Tiedostossa ei ole aikaleimoja eikä opiskelijoiden tietoja.
- [[common:exportPdf]]: avaa selaimen pdf-tulostusnäkymän, jonka voi tallentaa omalle koneelle.

[[video:download-answers]]

Kurssien, vuosien ja koulutusohjelmien yhteiset luvut löydät [kurssiyhteenvedosta](/guide/course-summary).
