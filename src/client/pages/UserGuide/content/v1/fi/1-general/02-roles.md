# Roolit ja oikeudet

Se, mitä voit tehdä Norpassa, riippuu kahdesta asiasta: roolistasi kullakin kurssilla ja oikeuksistasi koulutusohjelmiin ja tiedekuntiin. Roolit tulevat Sisusta ja oikeudet yliopiston IAM-ryhmistä, eikä kumpaakaan voi muuttaa Norpassa.

## Roolit kurssilla {#course-roles}

Norppa hakee kunkin kurssitoteutuksen opettajat ja heidän roolinsa Sisusta. Kurssin sivulla Norpassa ne näkyvät otsikoiden [[feedbackTargetView:responsibleTeachers]], [[feedbackTargetView:teachers]] ja [[feedbackTargetView:administrativePersons]] alla.

- _Vastuuopettaja_: Sisun roolit vastuuopettaja ja yhteyshenkilö. Vastuuopettaja voi
  - muokata kyselyn kysymyksiä ja muuttaa sen päivämääriä
  - lukea kaikki vastaukset, piilottaa avoimia vastauksia ja nähdä, ketkä ovat vastanneet
  - lähettää opiskelijoille muistutusviestejä
  - kirjoittaa vastapalautteen
  - käyttää jatkuvaa palautetta ja luoda välipalautteita.
- _Hallintohenkilö_: Sisun rooli hallintohenkilö. Hallintohenkilöllä on täsmälleen samat oikeudet kuin vastuuopettajalla.
- _Opettaja_: mikä tahansa muu opetusrooli Sisussa. Opettaja näkee kyselyn [[common:preview]]-näkymässä, voi kopioida kyselyn linkin [[feedbackTargetView:shareTab]]-välilehdeltä ja näkee vain julkisten kysymysten vastaukset (katso [julkiset vastaukset](/guide/answer-visibility#public-answers)). Opettaja ei voi muokata kyselyä eikä kirjoittaa vastapalautetta.

Vastuuopettajat ja hallintohenkilöt saavat myös Norpan kyselyä koskevat sähköpostit, kuten muistutuksen ennen kyselyn avautumista. Kursseilla, jotka ovat alkaneet ennen vuotta 2023, kaikki Sisussa mainitut opettajat ovat vastuuopettajia.

Samat roolit pätevät kurssin välipalautteisiin. Koulutusohjelman kyselyssä koulutusohjelman valitsemilla vastuuhenkilöillä on vastuuopettajan oikeudet; katso [Koulutusohjelman kyselyt](/guide/programme-surveys).

## Oikeudet koulutusohjelmassa tai tiedekunnassa {#organisation-rights}

Oikeudet koulutusohjelmaan tai tiedekuntaan tulevat yliopiston IAM-ryhmistä. Esimerkiksi koulutusohjelman johtaja saa ohjelmaansa admin-oikeudet ja johtoryhmän jäsenet lukuoikeudet. Jos sinulla on tällaisia oikeuksia, valikossa näkyy [[navBar:myProgrammes]] tai [[navBar:myOrganisations]].

- _Lukuoikeus_ (Read): koulutusohjelman tai tiedekunnan sivu kurssiyhteenvetoineen ja kursseineen sekä sen kurssien julkisten kysymysten vastaukset, kun kyselyt ovat sulkeutuneet.
- _Admin-oikeus_ (Admin): kaikki, mitä lukuoikeus antaa, ja lisäksi
  - kaikki sen kurssien vastaukset, myös avoimet kysymykset [[organisationSettings:openQuestionsTab]]-välilehdellä
  - sen [[organisationSettings:settingsTab]]-, [[organisationSettings:surveyTab]]- ja [[organisationSettings:organisationSurveysTab]]-välilehdet
  - sen kurssikyselyissä: kysymysten muokkaus ennen kyselyn avautumista, avointen vastausten piilottaminen, muistutusviestien lähettäminen ja vastanneiden näkeminen.

Koulutusohjelman oikeudet eivät tee sinusta kurssin opettajaa: kurssikyselyn päivämäärien muuttamiseen tai vastapalautteen kirjoittamiseen tarvitset vastuuopettajan roolin Sisussa.

_Palautevastaavat_ saavat koulutusohjelmaansa admin-oikeudet. Koulutusohjelman admin-käyttäjät lisäävät heidät Norpassa; katso [Palautevastaava](/guide/programmes#feedback-liaison).

## Omien oikeuksien tarkistaminen {#check-your-rights}

- Roolit kurssilla: avaa kurssin sivu ja katso, minkä otsikon alla nimesi on. Koulutusohjelman kyselyn vastuuhenkilöt ovat otsikon [[feedbackTargetView:administrativePersons]] alla. Löydät kurssin valitsemalla [[navBar:myCourses]] ja sieltä kurssin.
- Oikeudet koulutusohjelmiin ja tiedekuntiin: napsauta nimeäsi oikeassa yläkulmassa ja valitse [[navBar:userInformation]]. Ikkunassa näkyvät Norppaan vaikuttavat [[userInformation:iamGroups]] ja kohdassa [[userInformation:organisationAccess]] kunkin organisaation koodi ja oikeutesi, _Admin_ tai _Read_ (aina englanniksi). Organisaation nimi näkyy, kun viet hiiren koodin päälle. Ikkuna ei näytä rooleja kursseilla.

[[video:check-your-rights]]

## Jos roolisi on väärä {#wrong-role}

- Väärä rooli kurssilla tai puutut kurssilta kokonaan: rooli pitää korjata Sisussa. Sen tekee kurssitoteutusta Sisussa ylläpitävä henkilö, usein koulutusohjelman opintohallinnon henkilöstö. Norppa päivittää roolit joka yö, joten muutos näkyy seuraavana aamuna. Esimerkiksi jos vierailevalle luennoitsijalle tulee vastuuopettajien sähköposteja, hänet on lisätty Sisuun vastuuopettajaksi, yhteyshenkilöksi tai hallintohenkilöksi; roolin vaihtaminen Sisussa opettajaksi korjaa asian.
- Oikeudet koulutusohjelmaan tai tiedekuntaan puuttuvat: IAM-ryhmiä ylläpidetään Norpan ulkopuolella. Pyydä koulutusohjelmasi tai tiedekuntasi hallintoa lisäämään sinut oikeaan ryhmään, ja kirjaudu sitten ulos Norpasta ja takaisin sisään. Vaihtoehtoisesti koulutusohjelman admin-käyttäjä voi lisätä sinut palautevastaavaksi.

Jos rooli on Sisussa oikein, mutta Norppa näyttää vielä parin päivän päästä vanhaa roolia, ota yhteyttä osoitteeseen [norppa@helsinki.fi](mailto:norppa@helsinki.fi).
