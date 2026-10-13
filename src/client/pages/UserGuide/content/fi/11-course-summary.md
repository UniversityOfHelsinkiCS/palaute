# Kurssiyhteenveto

Kurssiyhteenvedossa ovat kurssikyselyjen tilastot: yliopistotason asteikkokysymysten keskiarvot, vastanneiden määrä ja se, moniko kurssi on saanut vastapalautteen. Opettajat näkevät omat kurssinsa ja koulutusohjelmien henkilökunta koulutusohjelmiensa ja tiedekuntiensa kurssit.

Avaa ylävalikosta [[navBar:courseSummary]]. Siinä on kaksi näkymää:

- [[courseSummary:myCourses]]: kurssit, joilla olet vastuuopettaja tai opettaja, organisaatioittain.
- [[courseSummary:myOrganisations]]: koulutusohjelmat, tiedekunnat ja muut organisaatiot, joihin sinulla on [oikeudet](/guide/roles#organisation-rights), ja niiden opintojaksot. Näkyy vain, jos sinulla on tällaisia oikeuksia.

Koulutusohjelman oma yhteenveto on myös sen sivulla [[organisationSettings:summaryTab]]-välilehdellä, ja siinä ovat mukana myös koulutusohjelman omat asteikkokysymykset. Katso [Koulutusohjelmat ja tiedekunnat](/guide/programmes#programme-page).

Avaamalla organisaation näet sen alla olevat rivit. Opintojakson nimestä pääset sen sivulle, jossa on rivi jokaiselle toteutukselle; toteutuksesta pääset sen kyselyn vastauksiin.

## Mitä luvut kertovat {#figures}

Jokaisella rivillä on nämä sarakkeet:

- _Sarake jokaiselle yliopistotason asteikkokysymykselle_ (ja koulutusohjelman sivulla jokaiselle sen asteikkokysymykselle): vastausten keskiarvo asteikolla 1–5. Vastausta ”en osaa sanoa” ei lasketa mukaan. Kysymyksen näet viemällä osoittimen sarakkeen otsikon päälle.
- _Työmäärä_: nuoli kertoo, kokivatko opiskelijat työmäärän raskaaksi vai kevyeksi opintopisteisiin nähden. Vastausten jakauman näet viemällä osoittimen sen päälle.
- [[courseSummary:feedbackCount]]: vastaukset / ilmoittautuneet opiskelijat.
- [[courseSummary:feedbackPercentage]]: vastanneiden osuus opiskelijoista.
- [[courseSummary:feedbackResponsePercentage]]: niiden kurssitoteutusten osuus, jotka ovat saaneet vastapalautteen.
- [[courseSummary:censoredCount]]: vastaukset, jotka kurssin vastuuopettajat tai koulutusohjelman hallinnoijat ovat piilottaneet. Näkyy vain organisaation hallinnoijille.

Keskiarvon väri kertoo, kuinka korkea se on: matalat keskiarvot ovat punaisia, keskitason keltaisia ja korkeat vihreitä. Vaalea solu tarkoittaa, ettei vastauksia ole.

Opintojakson, koulutusohjelman tai tiedekunnan luvut lasketaan kaikkien sen kurssitoteutusten vastauksista, eivät keskiarvojen keskiarvona.

Sarakkeina ovat ne yliopistotason kysymykset, jotka olivat käytössä valitun ajanjakson alussa. Jos kurssin kyselyssä oli eri kysymykset, sen rivillä näkyy keskiarvojen sijaan info-kuvake.

Valitsemalla sarakkeen otsikon voit järjestää rivit sen mukaan. [[courseSummary:tableView]] näyttää samat luvut yhtenä taulukkona, ja [[courseSummary:treeView]] palauttaa puunäkymän. [[courseSummary:myOrganisations]]-näkymässä voit kiinnittää useimmin seuraamasi organisaatiot ylimmiksi valinnalla [[courseSummary:pinOrganisation]].

## Ajanjakson valitseminen {#filters}

Oletuksena yhteenveto näyttää kuluvan lukuvuoden. Valitse rivien yläpuolelta:

- [[courseSummary:year]]: lukuvuosi vuodesta 2020 alkaen.
- [[courseSummary:semester]]: lukuvuoden syys- tai kevätlukukausi.
- [[courseSummary:period]]: lukukauden opetusperiodi.

Kurssitoteutus on mukana, jos sen Sisussa olevat kurssin päivämäärät osuvat valitulle ajalle. Kyselyn aukioloaika ei vaikuta tähän.

Ajanjakson vieressä olevasta valikosta valitset, ovatko avoimen yliopiston kurssit mukana: [[courseSummary:includeOpenUni]], [[courseSummary:excludeOpenUni]] tai [[courseSummary:onlyOpenUni]].

## Lukujen lataaminen {#download}

1. Valitse ajanjakso.
2. Valitse sivun yläreunasta [[common:exportXLSX]].
3. Valitse, mitä tiedostoon tulee: [[generateReport:organisations]], [[generateReport:courseUnits]] ja/tai [[generateReport:courseRealisations]]. Kukin tulee omalle välilehdelleen.
4. Valitse [[common:exportXLSX]].

Kurssiyhteenvedon sivulla tiedostossa ovat organisaatiosi ja omat kurssisi. Koulutusohjelman [[organisationSettings:summaryTab]]-välilehdellä siinä on vain kyseinen koulutusohjelma, myös sen omien kysymysten kanssa.

Yksittäisen kyselyn vastaukset ladataan sen [[feedbackTargetView:feedbacksTab]]-välilehdeltä; katso [Vastausten lataaminen](/guide/results#download).

## Miksi kurssi puuttuu {#missing-courses}

Kurssiyhteenvedossa ovat _vain kurssikyselyt_: välipalautteet ja koulutusohjelman kyselyt eivät ole mukana. Kurssi voi puuttua, koska:

- _Lukuja ei ole vielä päivitetty._ Opintojaksojen, koulutusohjelmien ja tiedekuntien luvut lasketaan uudelleen joka yö, joten uudet vastaukset ja uusi vastapalaute näkyvät niissä seuraavana päivänä.
- _Sen kysely ei ole vielä avautunut._ Avautumattomia kyselyitä ei lasketa mukaan.
- _Sillä ei ole Norpassa opiskelijoita._
- _Se on eri ajanjaksolla._ Ajanjakso määräytyy kurssin Sisussa olevien päivämäärien mukaan, ei kyselyn aukioloajan.
- _Se kuuluu Sisussa toiselle organisaatiolle._ Organisaation yhteenvedossa ovat kurssit, joiden opintojakso tai toteutus kuuluu sille Sisussa. Opintojakso, joka liittyy koulutusohjelmaan vain toteutuksensa kautta, on merkitty tekstillä [[common:partiallyResponsible]].
- _Et ole sen opettaja Sisussa._ [[courseSummary:myCourses]] näyttää vain kurssit, joilla olet vastuuopettaja tai opettaja.

Jos kurssi puuttuu yhä muutama päivä sen jälkeen, kun sen tiedot on korjattu Sisussa, [ota yhteyttä tukeen](/guide/support#support).
