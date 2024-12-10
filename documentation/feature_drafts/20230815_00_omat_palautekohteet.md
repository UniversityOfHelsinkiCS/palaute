# Omat palautekohteet

Myös nimillä _custom palaute_, _any palaute_, _välipalaute_, _lukukausipalaute_.

Tämä on lyhyt esittely ominaisuudesta ja toivomme kommentteja nyt varhaisessa vaiheessa ennen kuin mietimme tarkemmin toteutusta.

## Lyhyesti

Norppa luo palautekohteita kurssitoteutuksille, yksi yhteen -suhteella, mutta HY:llä on noussut kiinnostus tehdä Norpassa muitakin kuin yhden kurssin lopussa avautuvia kyselyitä.
Kaksi konkreettista esimerkkiä ovat

- Lukukausipalaute. Eläinlääketieteellinen ohjelma tekee lukukauden lopussa palautekyselyn kaikille vuosikurssin opiskelijoille. He haluaisivat tehdä kyselyn Norpan avulla.
- Välipalaute. Useilla kursseilla on esitetty toiveita jonkinlaisesta välipalautteesta, joka voitaisiin kysellä kesken kurssia ja mahdollisesti vain tietyltä osalta opiskelijoita.

Ratkaisuksi esitetään ominaisuutta omien palautekohteiden luomiseen.

## MVP

Opettaja tai koulutusohjelman hallinnon jäsen voi luoda palautekohteen valitsemalleen opiskelijajoukolle omalla aikataululla ja omilla kysymyksillään.
Oma palautekohde on irrallinen muusta kurssistatistiikasta ja siihen ei välttämättä tule yliopiston tai koulutusohjelman omia kysymyksiä.

## Jatkokehitys

Käyttöoikeudet määrittelevät, keitä opiskelijoita käyttäjä voi lisätä palautekohteeseensa.
Koulutusohjelman johto esim. voi lisätä opiskelijoita koulutusohjelman kursseilta, opettaja taas opiskelijoita omilta kursseiltaan.

Omia palautekohteita voi lisätä omien kurssien yhteyteen, ja ne näkyvät kurssin palautesivulla. Ne erotellaan edelleen kuitenkin (jollakin tapaa) kurssin pääasiallisesta palautekohteesta.

Omille palautekohteille voi lisätä muita vastuuhenkilöitä.

## Haasteita

- Vaatii melko paljon käyttöliittymä/frontendkehitystä. Nykyinen palautenäkymä olettaa kurssin olemassaolon, joten sellaisenaan sitä ei voi soveltaa omille palautekohteille.
- Konfliktoiko tämä ominaisuus TAU:n kehittämän opintojaksokysymysten kanssa?

## Aikataulu

Toivotaan tuotantokäyttöön viimeistään ennen Joulukuuta
