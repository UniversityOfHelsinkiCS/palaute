# Koulutusohjelman sivu

Jokaisella koulutusohjelmalla ja tiedekunnalla on Norpassa oma sivunsa. Siellä seuraat sen kurssien palautetta. Jos sinulla on admin-oikeudet, lisäät sivulla myös [kysymyksiä kaikkiin sen kurssikyselyihin](/guide/programme-questions), valitset sen [asetukset](/guide/settings) ja teet [koulutusohjelman kyselyitä](/guide/programme-surveys).

## Sivun avaaminen ja välilehdet {#programme-page}

Avaa ylävalikosta [[navBar:myProgrammes]] (nimeltään [[navBar:myOrganisations]], jos sinulla on oikeuksia muuhunkin kuin koulutusohjelmiin) ja valitse koulutusohjelma tai tiedekunta. Jos valikossa ei ole kumpaakaan, sinulla ei ole oikeuksia yhteenkään koulutusohjelmaan; katso [Oikeudet koulutusohjelmassa tai tiedekunnassa](/guide/roles#organisation-rights).

Sivun välilehdet riippuvat oikeuksistasi. Lukuoikeuksilla näet:

- [[organisationSettings:summaryTab]]: koulutusohjelman [kurssiyhteenveto](/guide/course-summary), jossa ovat mukana myös koulutusohjelman omien asteikkokysymysten keskiarvot.
- [[organisationSettings:courseRealisationsTab]]: koulutusohjelman valitun ajanjakson kurssitoteutukset, niiden kurssi- ja palautejaksot, vastausmäärät ja vastuuopettajat. Valitsemalla kurssin pääset sen kyselyyn.
- [[organisationSettings:responsiblesTab]]: koulutusohjelman opettajat ja kunkin kurssien määrä valitulla ajanjaksolla. Listan saa ladattua painikkeella [[common:exportXLSX]].

Hallinnoijat eli koulutusohjelman johtaja, muut IAM-ryhmien kautta hallinnointioikeudet saaneet ja koulutusohjelman palautevastaavat näkevät lisäksi:

- [[organisationSettings:settingsTab]]: palautevastaavat, vastanneiden näkyvyys ja se, millä kursseilla palautetta kerätään. Katso [Asetukset](/guide/settings).
- [[organisationSettings:openQuestionsTab]]: kaikkien koulutusohjelman kurssien avointen kysymysten vastaukset. Katso [Avoimet kysymykset](#open-questions).
- [[organisationSettings:surveyTab]] (tiedekunnan sivulla [[organisationSettings:surveyFacultyTab]]): kysymykset, jotka lisätään kaikkiin koulutusohjelman kurssikyselyihin. Katso [Koulutusohjelman kysymykset](/guide/programme-questions).
- [[organisationSettings:organisationSurveysTab]] (tiedekunnan sivulla [[organisationSettings:organisationFacultySurveysTab]]): koulutusohjelman omat kyselyt. Katso [Koulutusohjelman kyselyt](/guide/programme-surveys).

Hallinnoijat näkevät kaikki koulutusohjelman kurssien vastaukset, kun taas lukuoikeuksilla näkee vain julkisten kysymysten vastaukset; katso [Kuka näkee mitkäkin vastaukset](/guide/anonymity#public-answers).

## Avoimet kysymykset {#open-questions}

[[organisationSettings:openQuestionsTab]]-välilehdellä (vain hallinnoijat) ovat yhdessä paikassa kaikkien koulutusohjelman kurssien yliopistotason ja koulutusohjelman avointen kysymysten vastaukset kursseittain ja toteutuksittain. Opettajien omat kysymykset eivät ole mukana.

- Valitse [[courseSummary:all]], jos haluat nähdä kaikki vuodet, tai [[courseSummary:filter]], jos haluat valita lukuvuoden, lukukauden tai periodin. Toteutus näytetään, jos sen kurssin päivämäärät osuvat valitulle ajalle.
- Kurssin nimestä pääset sen yhteenvetoon ja toteutuksen nimestä sen vastauksiin.
- Hyvin lyhyet, alle viiden merkin vastaukset jätetään pois.
- [[feedbackTargetResults:export]] > [[common:exportPdf]] tulostaa vastaukset tai tallentaa ne PDF-tiedostoksi.

## Kurssikyselyt hallinnoijana {#course-surveys}

Admin-oikeuksilla voit toimia myös koulutusohjelmasi kurssikyselyissä. Avaa kysely [[organisationSettings:courseRealisationsTab]]-välilehdeltä valitsemalla kurssi. Toimit kyselyn sivulla samoin kuin vastuuopettajat, ja voit:

- muokata kysymyksiä ennen kyselyn avautumista; katso [Kysymysten muokkaaminen](/guide/questions#edit-questions)
- piilottaa avoimia vastauksia; katso [Avointen vastausten piilottaminen](/guide/results#hide-answers)
- lähettää muistutusviestejä; katso [Muistutusviestin lähettäminen](/guide/collecting-answers#send-reminder)
- nähdä, ketkä ovat vastanneet; katso [Ketkä ovat vastanneet](/guide/results#who-answered)
- ottaa jatkuvan palautteen käyttöön ja lukea sitä; katso [Jatkuva palaute](/guide/during-the-course#continuous-feedback).

Koulutusohjelman oikeudet eivät tee sinusta kurssin opettajaa: kurssikyselyn päivämäärien muuttamiseen tai vastapalautteen kirjoittamiseen tarvitset vastuuopettajan roolin Sisussa.
