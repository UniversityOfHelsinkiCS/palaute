# Kysymykset

Kurssikyselyssä on kolmenlaisia kysymyksiä: [yliopistotason kysymykset](#university-questions), mahdolliset [koulutusohjelman kysymykset](#programme-questions) ja vastuuopettajien omat kysymykset. Kahta ensimmäistä ei voi muuttaa. Omia kysymyksiä voit lisätä siihen asti, kun kysely aukeaa. Välipalautteessa ja koulutusohjelman kyselyssä on vain omia kysymyksiä.

## Kysymysten muokkaaminen {#edit-questions}

Kysymyksiä voivat muokata:

- kurssin kysely: kurssin vastuuopettajat ja hallintohenkilöt sekä kurssin koulutusohjelman hallinnoijat (ks. [Roolit ja oikeudet](/guide/roles#course-roles))
- välipalaute: kurssin vastuuopettajat ja koulutusohjelman hallinnoijat
- koulutusohjelman kysely: sen vastuuhenkilöt ja koulutusohjelman hallinnoijat.

Kysymyksiä voi muokata vain siihen asti, kun kysely aukeaa. Sen jälkeen [[feedbackTargetView:surveyQuestionsTab]]-välilehti on harmaana, jotta kaikki opiskelijat vastaavat samoihin kysymyksiin. Kun kysely on sulkeutunut, välilehteä ei enää näy.

Kysymyksen lisääminen:

1. Avaa kysely [[navBar:myCourses]]-sivulta.
2. Avaa [[feedbackTargetView:surveyQuestionsTab]]-välilehti.
3. Valitse kysymysten alta [[questionEditor:addQuestion]] ja valitse [kysymyksen tyyppi](#question-types).
4. Kirjoita kysymys suomeksi, ruotsiksi ja englanniksi. Voit myös lisätä kysymykselle [[questionEditor:description]]-tekstin, esimerkiksi tarkennukseksi.
5. Jos kysymykseen on pakko vastata, kytke päälle [[common:required]].
6. Valitse [[questionEditor:done]].

[[video:edit-questions]]

Kysymys tallentuu heti. Mitään muuta ei tarvitse tallentaa tai julkaista: opiskelijat saavat ne kysymykset, jotka kyselyssä on sen auetessa.

Kysymystä muokataan sen [[common:edit]]-painikkeella. Useamman kysymyksen voit poistaa kerralla kysymysten alla olevalla [[questionEditor:removeMany]]-painikkeella.

[[questionEditor:addTextualContent]] lisää kysymyksen sijaan _tekstiosion_, esimerkiksi ohjeen tai väliotsikon sitä seuraaville kysymyksille. Tekstiosioissa ja kysymysten kuvauksissa voi käyttää Markdownia, esimerkiksi linkkejä ja luetteloita.

Arvoasteikko- ja monivalintakysymyksen muokkausikkunassa voit myös valita, ovatko sen vastaukset julkisia. Katso [Kuka näkee mitkäkin vastaukset](/guide/results#public-answers).

## Kysymystyypit {#question-types}

Kysymystyyppejä on neljä: [[questionEditor:likertQuestion]], [[questionEditor:openQuestion]], [[questionEditor:singleChoiceQuestion]] ja [[questionEditor:multipleChoiceQuestion]]. Asteikkokysymyksiin vastataan asteikolla 1–5 tai vaihtoehdolla _eos_ (en osaa sanoa). Numeroilla ei ole selitteitä, joten kerro kysymyksessä tai sen kuvauksessa, mitä 1 ja 5 tarkoittavat, esimerkiksi 1 = täysin eri mieltä, 5 = täysin samaa mieltä.

## Kysymykset edelliseltä toteutukselta {#carry-over}

Koskee vain kurssien kyselyjä. Kun uuden kurssitoteutuksen kysely avataan Norpassa ensimmäisen kerran, Norppa kopioi siihen opettajan omat kysymykset saman opintojakson edelliseltä toteutukselta. Tämä tapahtuu viimeistään viikkoa ennen kyselyn aukeamista, kun vastuuopettajat saavat muistutusviestinsä.

- Edellinen toteutus on viimeisin tätä toteutusta aiemmin alkanut toteutus, jolla on tämän kanssa ainakin yksi yhteinen opettaja missä tahansa opettajaroolissa.
- Kopio tehdään vain kerran. Sen jälkeen kummankaan kyselyn muutokset eivät vaikuta toiseen.
- Kopioidut kysymykset eivät ole julkisia, ennen kuin muutat ne julkisiksi.
- Myös ryhmittelykysymys kopioituu. Tarkista, että sen vaihtoehdot vastaavat tämän toteutuksen ryhmiä.
- Poista tarpeettomat kysymykset tavalliseen tapaan.

Mitään ei kopioidu, jos millään aiemmalla toteutuksella ei ole yhteistä opettajaa tämän kanssa tai jos opintojaksosta on Sisussa uusi versio, esimerkiksi uudelle opetussuunnitelmakaudelle. [Kopioi kysymykset silloin itse](#copy-questions).

## Kysymysten kopioiminen toisesta kyselystä {#copy-questions}

Omien kysymysten kopioiminen toisen kurssin kyselystä:

1. Valitse [[feedbackTargetView:surveyQuestionsTab]]-välilehdellä [[editFeedbackTarget:copyFromCourseButton]].
2. Valitse kurssi kurssikentästä. Siinä ovat kurssit, joita opetat.
3. Näkyviin tulevat kurssin toteutukset, joita olet opettanut ja joilla on omia kysymyksiä, sekä niiden kysymysten määrät. Näet toteutuksen kysymykset viemällä hiiren sen päälle.
4. Valitse toteutuksen kohdalta [[editFeedbackTarget:copyQuestionsButton]].

[[video:copy-questions]]

Kysymykset lisätään omien kysymystesi perään ja tallennetaan heti. Vain opettajan omat kysymykset kopioituvat, eivät yliopistotason tai koulutusohjelman kysymykset. Kopioidut kysymykset eivät ole julkisia, ennen kuin muutat ne julkisiksi.

Välipalautteessa ja koulutusohjelman kyselyssä [[editFeedbackTarget:copyFromCourseButton]] näyttää sen sijaan koulutusohjelman kyselyt niistä koulutusohjelmista ja tiedekunnista, joihin sinulla on admin-oikeudet. Välipalautteessa ja koulutusohjelman kyselyssä on lisäksi [[editFeedbackTarget:copyUniversityQuestions]]-painike, joka lisää yliopistotason kysymykset omiksi kysymyksiksesi, joten voit muokata tai poistaa niitä.

## Kieliversiot ja esikatselu {#languages}

Opiskelija näkee kyselyn sillä kielellä, jolla hän käyttää Norppaa: suomeksi, ruotsiksi tai englanniksi. Siksi kysymyseditorissa on jokaiselle kielelle oma kenttänsä rinnakkain. Täytä ainakin niiden kielten kentät, joita opiskelijasi käyttävät. Jos kenttä on tyhjä, sitä kieltä käyttävät opiskelijat näkevät kysymyksen jollain toisella kielellä.

Kyselyn näkeminen opiskelijan silmin:

1. Valitse kieli [[feedbackTargetView:surveyQuestionsTab]]-välilehden alareunan [[editFeedbackTarget:translationLanguage]]-valikosta. Kysymyseditorin kysymykset vaihtuvat tälle kielelle.
2. Valitse [[editFeedbackTarget:showPreview]].

[[video:preview-survey]]

[[common:preview]]-välilehdellä näkyy koko kysely siinä järjestyksessä kuin opiskelija sen näkee. Opettaja ei voi lähettää sitä. Vastuuopettaja pääsee takaisin muokkaamaan [[feedbackView:editSurvey]]-painikkeella.

## Ryhmät {#groups}

Jos kurssille on Sisussa määritelty opetusryhmiä, esimerkiksi harjoitusryhmiä, Norppa tietää, mihin ryhmään kukin opiskelija kuuluu. Jos kurssin kyselyllä on vähintään kaksi Sisun ryhmää, vastauksia voi tarkastella ryhmittäin [[feedbackTargetView:feedbacksTab]]-välilehdellä ilman, että sinun tarvitsee tehdä mitään. Ryhmät, niiden opiskelijamäärät ja opettajat näkyvät [[feedbackTargetView:surveyQuestionsTab]]-välilehden yläreunassa kohdassa [[groups:groupingInfo]].

Jos kurssilla ei ole ryhmiä Sisussa tai ne eivät sovi tarpeisiisi, lisää _ryhmittelykysymys_. Sen voi lisätä minkä tahansa tyyppiseen kyselyyn:

1. Valitse [[feedbackTargetView:surveyQuestionsTab]]-välilehdellä [[groups:addGroupingQuestion]].
2. Muokkaa kysymystä ja sen vaihtoehtoja. Jos kurssilla on ryhmiä Sisussa, ne ovat valmiina vaihtoehtoina.
3. Valitse [[questionEditor:done]].

[[video:grouping-question]]

Ryhmittelykysymys on pakollinen, se on aina opiskelijan ensimmäinen kysymys, eivätkä sen vastaukset ole julkisia. Kyselyssä voi olla vain yksi ryhmittelykysymys, ja se korvaa Sisun ryhmät. Jos haluat palata Sisun ryhmiin, poista ryhmittelykysymys.

Anonymiteetin suojaamiseksi vastaukset näytetään ryhmittäin vain, jos jokaisessa ryhmässä on joko nolla tai vähintään viisi vastausta. Pidä siis vaihtoehtoja vähän.

## Yliopistotason kysymykset {#university-questions}

Yliopisto on määrittänyt nämä kysymykset kaikkiin kurssien kyselyihin. Ne ovat samat kaikilla kursseilla, eikä niitä voi muokata tai poistaa. Kysymyseditorissa ne on merkitty tunnisteella [[questionEditor:universityQuestion]]. Välipalautteessa ja koulutusohjelman kyselyssä niitä ei ole, mutta voit [kopioida ne niihin](#copy-questions).

Ne näkyvät [[feedbackTargetView:surveyQuestionsTab]]-välilehden alussa. Kyselyn kysymykset riippuvat sen avautumispäivästä: 2.8.2026 tai myöhemmin aukeavissa kyselyissä on uudet kysymykset.

Yliopistotason asteikkokysymysten keskiarvot näkyvät [kurssiyhteenvedossa](/guide/course-summary#figures).

## Koulutusohjelman kysymykset {#programme-questions}

Koulutusohjelma tai tiedekunta voi lisätä omia kysymyksiään kaikkien opintojaksojensa kyselyihin. Kysymyseditorissa ne on merkitty tunnisteella [[questionEditor:programmeQuestion]], ja [[feedbackTargetView:surveyQuestionsTab]]-välilehden yläreunan laatikko kertoo, montako niitä on ja mikä organisaatio ne on lisännyt.

Opettaja ei voi muokata tai poistaa koulutusohjelman kysymyksiä. Jos jokin niistä ei sovi kurssillesi, ota yhteyttä koulutusohjelmaan. Välipalautteessa ja koulutusohjelman kyselyssä ei ole koulutusohjelman kysymyksiä.

Koulutusohjelman henkilöstö lisää ja muokkaa näitä kysymyksiä koulutusohjelman sivulla, ks. [Koulutusohjelman kysymykset](/guide/programmes#programme-questions).

## Kysymysten järjestys opiskelijalle {#question-order}

Kysymyseditorissa ovat ensin yliopistotason kysymykset, sitten koulutusohjelman kysymykset ja lopuksi opettajan omat kysymykset. Opiskelija näkee ne tässä järjestyksessä:

1. Ryhmittelykysymys, jos kyselyssä on sellainen (ks. [Ryhmät](#groups)).
2. Yliopistotason asteikko- ja monivalintakysymykset.
3. Koulutusohjelman asteikko- ja monivalintakysymykset.
4. Opettajan omat kysymykset ja tekstiosiot siinä järjestyksessä, johon opettaja on ne laittanut.
5. Koulutusohjelman avoimet kysymykset.
6. Yliopistotason avoin kysymys _Muita huomioita_, joka on aina viimeisenä.

Lopputuloksen näet [[editFeedbackTarget:showPreview]]-painikkeella (ks. [Kieliversiot ja esikatselu](#languages)).
