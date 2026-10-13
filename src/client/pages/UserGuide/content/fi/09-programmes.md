# Koulutusohjelmat ja tiedekunnat

Jokaisella koulutusohjelmalla ja tiedekunnalla on Norpassa oma sivunsa. Siellä sen henkilökunta seuraa kurssiensa palautetta, ja sen hallinnoijat lisäävät kysymyksiä kaikkiin sen kurssikyselyihin, tekevät koulutusohjelman kyselyitä ja valitsevat sen asetukset.

## Koulutusohjelman sivu {#programme-page}

Avaa ylävalikosta [[navBar:myProgrammes]] (nimeltään [[navBar:myOrganisations]], jos sinulla on oikeuksia muuhunkin kuin koulutusohjelmiin) ja valitse koulutusohjelma tai tiedekunta. Jos valikossa ei ole kumpaakaan, sinulla ei ole oikeuksia yhteenkään koulutusohjelmaan; katso [Oikeudet koulutusohjelmassa tai tiedekunnassa](/guide/roles#organisation-rights).

Sivun välilehdet riippuvat oikeuksistasi. Lukuoikeuksilla näet:

- [[organisationSettings:summaryTab]]: koulutusohjelman [kurssiyhteenveto](/guide/course-summary), jossa ovat mukana myös koulutusohjelman omien asteikkokysymysten keskiarvot.
- [[organisationSettings:courseRealisationsTab]]: koulutusohjelman valitun ajanjakson kurssitoteutukset, niiden kurssi- ja palautejaksot, vastausmäärät ja vastuuopettajat. Valitsemalla kurssin pääset sen kyselyyn.
- [[organisationSettings:responsiblesTab]]: koulutusohjelman opettajat ja kunkin kurssien määrä valitulla ajanjaksolla. Listan saa ladattua painikkeella [[common:exportXLSX]].

Hallinnoijat eli koulutusohjelman johtaja, muut IAM-ryhmien kautta hallinnointioikeudet saaneet ja koulutusohjelman palautevastaavat näkevät lisäksi:

- [[organisationSettings:settingsTab]]: palautevastaavat, vastanneiden näkyvyys ja se, millä kursseilla palautetta kerätään.
- [[organisationSettings:openQuestionsTab]]: kaikkien koulutusohjelman kurssien avointen kysymysten vastaukset.
- [[organisationSettings:surveyTab]] (tiedekunnan sivulla [[organisationSettings:surveyFacultyTab]]): kysymykset, jotka lisätään kaikkiin koulutusohjelman kurssikyselyihin.
- [[organisationSettings:organisationSurveysTab]] (tiedekunnan sivulla [[organisationSettings:organisationFacultySurveysTab]]): koulutusohjelman omat kyselyt. Katso [Koulutusohjelman kyselyt](/guide/programme-surveys).

Hallinnoijat näkevät kaikki koulutusohjelman kurssien vastaukset, lukuoikeuksilla näkee vain julkisten kysymysten vastaukset.

## Koulutusohjelman kysymykset {#programme-questions}

Koulutusohjelman kysymykset lisätään kaikkien niiden opintojaksojen kurssikyselyihin, jotka kuuluvat Sisussa koulutusohjelmalle. Ne tulevat yliopistotason kysymysten jälkeen. Opettajat näkevät ne kyselyssään, mutta eivät voi muokata tai poistaa niitä.

1. Avaa koulutusohjelman sivulla [[organisationSettings:surveyTab]]-välilehti. Ylimpänä ovat yliopistotason kysymykset, joita ei voi muuttaa täällä.
2. Valitse [[questionEditor:addQuestion]] ja kysymystyyppi, tai [[questionEditor:addTextualContent]], jos haluat lisätä tekstiosion.
3. Kirjoita kysymys suomeksi, ruotsiksi ja englanniksi ja valitse [[questionEditor:done]].
4. Kun tallennat ensimmäisen kerran, Norppa muistuttaa, että kysymykset ovat koko koulutusohjelman yhteisiä. Vahvista.

Kysymykset toimivat samoin kuin opettajan omat kysymykset; katso [Kysymysten muokkaaminen](/guide/questions#edit-questions).

Muutos näkyy heti kaikissa koulutusohjelman kurssikyselyissä, _myös jo avautuneissa ja päättyneissä_. Jos muutat kysymyksen sanamuotoa, se muuttuu myös kyselyissä, joissa siihen on jo vastattu, ja poistettu kysymys katoaa niistäkin. Lisää siis koulutusohjelman kysymykset ennen kuin lukukauden kyselyt avautuvat, ja lisää mieluummin uusi kysymys kuin muuta vanhan merkitystä.

Opiskelija näkee kyselyssä koulutusohjelman asteikko- ja valintakysymykset heti yliopistotason kysymysten jälkeen ja sen avoimet kysymykset opettajan omien kysymysten jälkeen, ennen yliopistotason avoimia kysymyksiä.

### Vastausten julkisuus {#programme-questions-public}

Uusi koulutusohjelman kysymys on [[common:notPublic]]: sen vastaukset näkevät vain kurssin vastuuopettajat ja koulutusohjelman hallinnoijat. Jos haluat asteikko- tai valintakysymyksen vastausten näkyvän myös kurssin opiskelijoille ja opettajille:

<!-- Remove the reload step once a new programme question's publicity works without it (until a reload, its card shows Public and has no id). -->

1. Lataa sivu uudelleen kysymyksen tallentamisen jälkeen.
2. Valitse kysymyksen [[common:notPublic]]-painike.
3. Valitse [[common:publicInfo]].

Kun koulutusohjelma on tehnyt kysymyksestä julkisen, se on julkinen kaikilla koulutusohjelman kursseilla, eikä opettaja voi muuttaa sitä. Avointen kysymysten vastauksia ei voi tehdä julkisiksi täällä; vastuuopettaja voi tehdä ne julkisiksi omalla kurssillaan kyselyn päätyttyä. Katso [Julkiset vastaukset](/guide/results#public-answers).

## Palautevastaavan lisääminen {#feedback-liaison}

Palautevastaava saa koulutusohjelman hallinnointioikeudet Norpassa: hän näkee kaikki sen kurssien vastaukset ja voi tehdä kaiken tällä sivulla kuvatun. Koulutusohjelman hallinnoijat lisäävät palautevastaavat:

1. Avaa koulutusohjelman sivulla [[organisationSettings:settingsTab]]-välilehti.
2. Kirjoita kohtaan [[organisationSettings:newCorrespondent]] vähintään viisi merkkiä henkilön sähköpostiosoitteesta tai nimestä.
3. Valitse oikean henkilön kohdalla [[organisationSettings:setAsCorrespondent]] ja vahvista.

Haku löytää vain yliopiston henkilökuntaa. Jos henkilöä ei löydy, pyydä häntä kirjautumaan kerran Norppaan ja yritä uudelleen.

[[organisationSettings:feedbackCorrespondents]]-listassa näkyy jokainen palautevastaava ja se, miten hänet on lisätty. [[organisationSettings:remove]] poistaa palautevastaavan. Merkintä [[organisationSettings:addedInNorppa]] tarkoittaa, että hänet on lisätty tällä sivulla. Merkintä [[organisationSettings:basedOnIam]] tarkoittaa, että hän on palautevastaava IAM-ryhmän perusteella: Norpassa poisto on voimassa vain siihen asti, kun hän kirjautuu seuraavan kerran, joten pyydä poistamaan hänet IAM-ryhmästä.

## Asetukset {#settings}

[[organisationSettings:settingsTab]]-välilehdellä (vain hallinnoijat) ovat palautevastaavat, [[organisationSettings:generalSettings]] ja [[organisationSettings:courseSettings]]. Jokainen muutos tallentuu heti.

### Vastanneiden näkyvyys {#student-list}

Kyselyn [[feedbackTargetView:studentsWithFeedbackTab]]-välilehdellä kurssin vastuuopettajat näkevät listan sen opiskelijoista. Kohdassa [[organisationSettings:studentListVisibility]] valitset, näkyykö listassa myös se, _kuka on vastannut_:

- [[organisationSettings:studentListVisible]]: näkyy kaikilla koulutusohjelman kursseilla.
- [[organisationSettings:studentListHidden]]: ei näy millään kurssilla.
- [[organisationSettings:studentListByCourse]]: kohtaan [[organisationSettings:courseSettings]] tulee jokaiselle opintojaksolle kytkin [[organisationSettings:courseStudentListVisible]]. Kytke se päälle niillä kursseilla, joilla tieto näytetään.

Asetus koskee opintojaksoja, joiden ensisijainen organisaatio koulutusohjelma on. Jos opintojakso kuuluu useaan koulutusohjelmaan, ratkaisee ensisijaisen koulutusohjelman asetus.

Silloinkin kun näyttäminen on sallittu, tieto näkyy vain tietyin ehdoin; katso [Ketkä ovat vastanneet](/guide/results#who-answered).

### Palautteen poistaminen käytöstä kurssilta {#disable-feedback}

Kohdassa [[organisationSettings:courseSettings]] jokaisella koulutusohjelman opintojaksolla on kytkin [[organisationSettings:feedbackEnabled]]. Etsi kurssi kentällä [[organisationSettings:findByCourseUnit]] ja kytke kytkin pois, esimerkiksi jos kurssin palaute kerätään muulla tavalla.

Kytkin koskee opintojakson kaikkia toteutuksia. Kurssin opettajat näkevät silloin [[navBar:myCourses]]-sivulla ilmoituksen [[teacherView:disabledCourseWarning]] ja kurssin sivulla ilmoituksen [[feedbackTargetView:feedbackDisabled]]. Opiskelijat eivät pääse kyselyyn, eikä Norppa lähetä siitä sähköposteja. Kun kytket kytkimen takaisin päälle, palautetta kerätään taas.

## Avoimet kysymykset {#open-questions}

[[organisationSettings:openQuestionsTab]]-välilehdellä (vain hallinnoijat) ovat yhdessä paikassa kaikkien koulutusohjelman kurssien yliopistotason ja koulutusohjelman avointen kysymysten vastaukset kursseittain ja toteutuksittain. Opettajien omat kysymykset eivät ole mukana.

- Valitse [[courseSummary:all]], jos haluat nähdä kaikki vuodet, tai [[courseSummary:filter]], jos haluat valita lukuvuoden, lukukauden tai periodin. Toteutus näytetään, jos sen kurssin päivämäärät osuvat valitulle ajalle.
- Kurssin nimestä pääset sen yhteenvetoon ja toteutuksen nimestä sen vastauksiin.
- Hyvin lyhyet, alle viiden merkin vastaukset jätetään pois.
- [[feedbackTargetResults:export]] > [[common:exportPdf]] tulostaa vastaukset tai tallentaa ne PDF-tiedostoksi.
