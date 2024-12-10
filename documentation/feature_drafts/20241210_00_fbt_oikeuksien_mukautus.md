# Palautekohteen oikeuksien tarkastelu ja mukautus

`feedbackTarget.getAccess`-funktio palauttaa vain yhden `accessStatus`-arvon, mikä ei ole ihanteellinen ratkaisu. Tällä hetkellä on ongelmia (#1391), joissa käyttäjä, jolla on sekä organisaatio- että opiskelijapääsy palautteenantokohteeseen, tunnistetaan vain organisaation lukijana tai jonain muuna korkeamman tason statuksena.

Tämän seurauksena opiskelijapääsyn status ylikirjoitetaan "korkeammalla" pääsystatuksella, eikä henkilö voi antaa esimerkiksi palautetta.

Ongelman lähde on [tässä commitissa](https://github.com/UniversityOfHelsinkiCS/palaute/commit/d4df64fb70d504437c6e8d1679e2f03f17790cd4), jossa yritettiin palauttaa korkein pääsystatus. Tämä kuitenkin rikkoi aiemman logiikan, joka tarkisti ensin opiskelijastatuksen ja palautti sen ennen muiden statusten arviointia.

[Tätä committia](https://github.com/UniversityOfHelsinkiCS/palaute/commit/51789694a1c09fa490ed269a50bd5e2d1cd5c807) käytettiin pikakorjauksena, jotta ongelmasta kärsineet käyttäjät voisivat antaa palautetta.

## Korjausehdotus

Ehdotuksena korjaukselle, kuten aiemmin jo Slackissä keskusteltiin pikaisesti, on muuttaa `getAccess` -funktio palauttamaan lista henkilön oikeuksista. Näin ollen voidaan haluttuja oikeuksia tarkastella johonkin listalla oleviin oikeuksiin nähden.

Korjaukset on tällä hetkellä tehty "MVP" -mielessä, ja ovat saatavilla [Pull Requestissa](https://github.com/UniversityOfHelsinkiCS/palaute/pull/1414).

## Testaus ja jatkokehitys

Nopean testauksen perusteella tästä ei aiheudu mitään suuria ongelmia. Ainoa miinus on se, että kaikki tekstit mitkä kuuluvat opiskelijoille feedbacktargetilla, tulevat myös näkyviin opettajille (ja muille korkeamman oikeuden omaaville). Tämän voisi kuitenkin korjata varmaan melko helposti katsomalla opettajan oikeuksia, ja sen perusteella näyttäen.
