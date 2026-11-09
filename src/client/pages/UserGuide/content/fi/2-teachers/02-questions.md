---
description: Omien kysymysten lisääminen ennen kyselyn avautumista, kysymystyypit ja valmiit kysymykset.
---

# Kysymykset

Kurssikyselyssä on aina yliopistotason kysymykset ja mahdollisesti koulutusohjelman kysymyksiä, joita et voi muuttaa; katso [Valmiit kysymykset](#fixed-questions). Niiden lisäksi voit lisätä omia kysymyksiä siihen asti, kun kysely avautuu. Välipalautteessa ja koulutusohjelman kyselyssä on vain omia kysymyksiä.

## Kysymysten muokkaaminen {#edit-questions}

Voit muokata kysymyksiä, kunnes kurssipalautekysely avautuu. Sen jälkeen [[feedbackTargetView:surveyQuestionsTab]]-välilehti on harmaana, eikä kysymyksiä pysty enää muokkaamaan. Kun kysely on sulkeutunut, välilehteä ei enää näy.

Kysymyksen lisääminen:

1. Avaa kysely [[navBar:myCourses]]-sivulta.
2. Avaa [[feedbackTargetView:surveyQuestionsTab]]-välilehti.
3. Valitse kysymysten alta [[questionEditor:addQuestion]] ja valitse [kysymyksen tyyppi](#question-types).
4. Kirjoita kysymys suomeksi, ruotsiksi ja englanniksi. Voit myös lisätä kysymykselle [[questionEditor:description]]-tekstin, esimerkiksi tarkennukseksi.
5. Jos kysymykseen on pakko vastata, kytke päälle [[common:required]].
6. Valitse [[questionEditor:done]].

[[video:edit-questions]]

Jos lisäät vain yhden kieliversion, kaikki vastaajat saavat kyselyn tällä kielellä, riippumatta siitä, mikä heidän asiointikielensä Norpassa on.

Kysymystä muokataan sen [[common:edit]]-painikkeella. Useamman kysymyksen voit poistaa kerralla kysymysten alla olevalla [[questionEditor:removeMany]]-painikkeella.

[[questionEditor:addTextualContent]] lisää kysymyksen sijaan _tekstiosion_, esimerkiksi ohjeen tai väliotsikon sitä seuraaville kysymyksille. Tekstiosioissa ja kysymysten kuvauksissa voi käyttää Markdownia, esimerkiksi linkkejä ja luetteloita.

Arvoasteikko- ja monivalintakysymyksen muokkausikkunassa voit myös valita, ovatko sen vastaukset julkisia. Lisäämäsi asteikko- ja valintakysymykset ovat oletuksena julkisia ja avoimet kysymykset eivät; katso [Vastausten näkyvyys eri käyttäjille](/guide/anonymity#public-answers).

Kysymyksiä voivat muokata:

- opintokohteen (kurssin) kysely: kurssin vastuuopettajat ja hallintohenkilöt sekä kurssin koulutusohjelman hallinnoijat (ks. [Roolit ja oikeudet](/guide/roles#course-roles))
- välipalaute: kurssin vastuuopettajat ja koulutusohjelman hallinnoijat
- koulutusohjelman kysely: kyselyn vastuuhenkilöt ja koulutusohjelman hallinnoijat.

## Kysymystyypit {#question-types}

Kysymystyyppejä on neljä: [[questionEditor:likertQuestion]], [[questionEditor:openQuestion]], [[questionEditor:singleChoiceQuestion]] ja [[questionEditor:multipleChoiceQuestion]]. Arvoasteikkokysymyksiin vastataan asteikolla 1–5 tai vaihtoehdolla _eos_ (en osaa sanoa). Numeroilla ei ole selitteitä, joten kerro kysymyksessä tai sen kuvauksessa, mitä 1 ja 5 tarkoittavat, esimerkiksi 1 = täysin eri mieltä, 5 = täysin samaa mieltä.

## Kysymysten kopioiminen toisesta kyselystä {#copy-questions}

Omien kysymysten kopioiminen toisen kurssin kyselystä:

1. Valitse [[feedbackTargetView:surveyQuestionsTab]]-välilehdellä [[editFeedbackTarget:copyFromCourseButton]].
2. Näet kurssit, joita opetat. Valitse haluamasi kurssi.
3. Näkyviin tulevat kurssin toteutukset, joita olet opettanut ja joilla on omia kysymyksiä, sekä niiden kysymysten määrät. Näet toteutuksen kysymykset viemällä hiiren sen päälle.
4. Valitse toteutuksen kohdalta [[editFeedbackTarget:copyQuestionsButton]].

[[video:copy-questions]]

Kysymykset lisätään omien kysymystesi perään ja tallennetaan heti. Vain opettajan omat kysymykset kopioituvat, eivät yliopistotason tai koulutusohjelman kysymykset. Kopioidut kysymykset eivät ole julkisia, ennen kuin muutat ne julkisiksi.

Välipalautteessa ja koulutusohjelman kyselyssä [[editFeedbackTarget:copyFromCourseButton]] näyttää sen sijaan koulutusohjelman kyselyt niistä koulutusohjelmista ja tiedekunnista, joihin sinulla on admin-oikeudet. Välipalautteessa ja koulutusohjelman kyselyssä on lisäksi [[editFeedbackTarget:copyUniversityQuestions]]-painike, josta voi halutessaan lisätä yliopistotason kysymykset.

## Kysymykset edelliseltä toteutukselta {#carry-over}

Kun uuden kurssitoteutuksen kysely luodaan Norppaan, Norppa kopioi siihen opettajan omat kysymykset saman opintojakson edelliseltä toteutukselta.  Jos et halua kopioituja kysymyksiä uuteen kyselyyn, voit poistaa ne tavalliseen tapaan.

- Kopioidut kysymykset eivät ole julkisia, ennen kuin muutat ne julkisiksi.
- Myös ryhmittelykysymys kopioituu. Tarkista, että sen vaihtoehdot vastaavat tämän toteutuksen ryhmiä.
- Tietyissä erityistapauksissa kysymyksiä ei voida kopioida automaattisesti, mutta voit tarvittaessa kopioida kysymykset itse.Koskee vain kurssien kyselyjä. Kun uuden kurssitoteutuksen kysely avataan Norpassa ensimmäisen kerran, Norppa kopioi siihen opettajan omat kysymykset saman opintojakson edelliseltä toteutukselta. Tämä tapahtuu viimeistään viikkoa ennen kyselyn aukeamista, kun vastuuopettajat saavat muistutusviestinsä.

[Kysymysten kopiointi](#copy-questions).

## Kieliversiot ja esikatselu {#languages}

Opiskelija näkee kurssipalautekyselyn sillä kielellä, jolla hän käyttää Norppaa: suomeksi, ruotsiksi tai englanniksi. Siksi kysymyseditorissa on jokaiselle kielelle oma kenttänsä rinnakkain. Täytä ainakin niiden kielten kentät, joita opiskelijasi käyttävät. Jos jokin kieliversio jää tyhjäksi, opiskelijat näkevät kyselyn toisella kielellä.

Kysely opiskelijan silmin:

1. Valitse kieli [[feedbackTargetView:surveyQuestionsTab]]-välilehden alareunan [[editFeedbackTarget:translationLanguage]]-valikosta. Kysymyseditorin kysymykset vaihtuvat tälle kielelle.
2. Valitse [[editFeedbackTarget:showPreview]].

[[video:preview-survey]]

[[common:preview]]-välilehdellä näkyy koko kysely siten kuin opiskelija sen näkee.

## Ryhmät {#groups}

Jos kurssille on Sisussa määritelty opetusryhmiä, esimerkiksi harjoitusryhmiä, Norppa perii tämän tiedon automaattisesti SISU:sta. Jos kurssin kyselyllä on vähintään kaksi Sisun ryhmää, vastauksia voi tarkastella ryhmittäin [[feedbackTargetView:feedbacksTab]]-välilehdellä. Ryhmät, niiden opiskelijamäärät ja opettajat näkyvät [[feedbackTargetView:surveyQuestionsTab]]-välilehden yläreunassa kohdassa [[groups:groupingInfo]].

Jos kurssilla ei ole ryhmiä Sisussa tai ne eivät sovi tarpeisiisi, lisää _ryhmittelykysymys_. Sen voi lisätä minkä tahansa tyyppiseen kyselyyn:

1. Valitse [[feedbackTargetView:surveyQuestionsTab]]-välilehdellä [[groups:addGroupingQuestion]].
2. Muokkaa kysymystä ja sen vaihtoehtoja. Jos kurssilla on ryhmiä Sisussa, ne ovat valmiina vaihtoehtoina.
3. Valitse [[questionEditor:done]].

[[video:grouping-question]]

Ryhmittelykysymys on vastaajalle pakollinen, kyselyn ensimmäinen kysymys ja sen vastaukset eivät ole julkisia. Kurssipalautekyselyssä voi olla vain yksi ryhmittelykysymys, ja jos opettaja on luonut sen itse, tämä ryhmittely korvaa Sisun ryhmät. Jos haluat palata Sisun ryhmiin, poista ryhmittelykysymys.

Anonymiteetin suojaamiseksi vastaukset näytetään ryhmittäin vain, jos jokaisessa vastauksia saaneessa ryhmässä on vähintään viisi vastaajaa (ks. [Ryhmien vastaukset](/guide/anonymity#groups)).

## Valmiit kysymykset {#fixed-questions}

### Yliopistotason kysymykset {#university-questions}

Yliopisto on määrittänyt nämä kysymykset kaikkiin kurssien kyselyihin. Ne ovat samat kaikilla kursseilla, eikä niitä voi muokata tai poistaa. Kysymyseditorissa ne on merkitty tunnisteella [[questionEditor:universityQuestion]], ja ne näkyvät [[feedbackTargetView:surveyQuestionsTab]]-välilehden alussa.

Kysymyksistä on kaksi versiota: 2021-2026 käytössä olleet sekä 2026 syksystä lähtien käytössä olevat. Katso [Yliopistotason kysymykset](/guide/university-questions). Välipalautteessa ja koulutusohjelman kyselyssä ei ole HY-yhteisiä kysymyksiä, mutta voit halutessasi [kopioida ne mukaan](#copy-questions).

### Koulutusohjelman kysymykset {#programme-questions}

Koulutusohjelma tai tiedekunta voi lisätä omia kysymyksiä ja nämä tulevat automaattisesti mukaan ohjelman kaikkien opintojaksojen kurssipalautekyselyihin. Kysymyseditorissa ne on merkitty tunnisteella [[questionEditor:programmeQuestion]], ja [[feedbackTargetView:surveyQuestionsTab]]-välilehden yläreunan laatikko kertoo, montako niitä on ja mikä organisaatio ne on lisännyt.

Et voi muokata tai poistaa koulutusohjelman kysymyksiä. Jos jokin niistä ei sovi kurssillesi, ota yhteyttä koulutusohjelmaan. Välipalautteessa ja koulutusohjelman kyselyssä ei ole koulutusohjelman kysymyksiä.

Koulutusohjelman henkilöstö lisää ja muokkaa näitä kysymyksiä koulutusohjelman sivulla; katso [Koulutusohjelman kysymykset](/guide/programme-questions).

## Kysymysten järjestys opiskelijalle {#question-order}

Kysymyseditorissa ovat ensin yliopistotason kysymykset, sitten koulutusohjelman kysymykset ja lopuksi omat kysymyksesi. Opiskelija näkee ne tässä järjestyksessä:

1. Ryhmittelykysymys, jos kyselyssä on sellainen (ks. [Ryhmät](#groups)).
2. Yliopistotason asteikko- ja monivalintakysymykset.
3. Koulutusohjelman asteikko- ja monivalintakysymykset.
4. Omat kysymyksesi ja tekstiosiosi siinä järjestyksessä, johon olet ne laittanut.
5. Koulutusohjelman avoimet kysymykset.
6. Yliopistotason avoin kysymys _Muita huomioita_, joka on aina viimeisenä.

Lopputuloksen näet [[editFeedbackTarget:showPreview]]-painikkeella (ks. [Kieliversiot ja esikatselu](#languages)).
