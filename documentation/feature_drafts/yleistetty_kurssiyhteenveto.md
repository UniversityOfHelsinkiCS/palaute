# Yhteenvetonäkymän päivitys

Myös nimillä: _yleistetty kurssiyhteenveto_, _MINTufied kurssiyhteenveto_, _sellainen kun sen olisi alusta alkaen pitänyt olla_

Kurssiyhteenvedolla tarkoitetaan pääasiassa näkymää osoitteessa `/course-summary`, eli johon siirrytään navigointipalkin Yhteenveto-napista. Muutokset tulisivat myös vaikuttamaan vähintään teknisellä tasolla myös organisaation omaan yhteenvetoon osoitteessa `/organisations/:code/summary` ja opintojakson yhteenvetoon `/course-summary/:courseCode`.

Muutosesityksen yksityiskohdat ovat vielä mietinnässä mutta kommentteja kaivataan.

## Ongelmat

Kurssiyhteenvetonäkymä teknisesti olettaa pitkälti organisaatiorakenteen olevan HY:n mukainen: ylimpänä yliopisto, niiden alla tiedekunnat ja erillislaitokset, niiden alla koulutusohjelmat joiden alla opintojaksot. Tämä rakenne ei kuitenkaan näy kovin hyvin käyttäjälle, sillä tiedekunnat näyttäytyvät koulutosohjelmien kanssa samanarvoisina riveinä näkymässä. Seurauksena on **ongelma no. 1**, eli yliopiston johdolle näkyy ~140 riviä organisaatioita, joissa on sekaisin koulutusohjelmia, erillislaitoksia ja tiedekuntia:

![image](https://github.com/UniversityOfHelsinkiCS/palaute/assets/54055199/4e5d4cd9-1323-47a7-9e06-9015d202bc5e)

Tiedekuntien jaottelu on hoidettu erillisillä valitsimella, joka oli nopea teippiratkaisu:

![image](https://github.com/UniversityOfHelsinkiCS/palaute/assets/54055199/9378762d-b220-404b-bd18-fe82fd683680)

Valitsimen ongelma, eli **ongelma no. 2** on se, että se olettaa tietyn tiedekunta/koulutusohjelma-rakenteen. Esimerkiksi TAU:lla, jolla ei ole samanlaisia tiedekuntien alaisia koulutusohjelmia, valitsin ei käy järkeen.

## Ratkaisut

Muutetaan näkymän rakennetta sellaiseksi, että vastaa organisaatioiden puurakennetta. Puun juuressa on yliopisto, sen alle tulevat niiden organisaatioiden yhteenvetorivit, joiden parent_id = yliopisto. HY:lle nämä olisivat tiedekunnat ja erillislaitokset, samoin TAU:lle. Tiedekuntien alla olisivat koulutusohjelmat ja tiedekuntien kurssit.

Yleistäen, organisaation O alla on kaikki ne organisaatiot joiden parent_id = O.id, sekä kaikki ne kurssit (Norpan "opintojaksot"), joiden järjestäjänä O on (liitostaulun `course_unit_organisations` kautta).

Kursseja ja organisaatioita voi siis olla rinnakkain yhden organisaation alla. Tämä on yleistä ainakin HY:n datassa.

Näin ratkaistaan **ongelma no. 1** ja **ongelma no. 2**.

## Muita muutoksia

Vanhasta ns "flatlistasta" haluttaisiin samalla säilyttää eri organisaatioiden vertailumahdollisuus, esimerkiksi järjestäminen palauteprosentin perusteella yms. Puurakenteessa se ei oikein onnistu, joten puurakennenäkymän rinnalle ehdotetaan jonkinlaista uutta flatlistaa. Tämän mietintä on vielä todella kesken mutta prototyypissä on sille yksinkertainen toteutus.

Mietitään myös aikarajauksen parantamista. Nykyään ei voida tarkastella yhtä lukuvuotta pidempää aikaväliä, vaikka backend sen periaatteessa mahdollistaakin. Esimerkiksi jonkinlainen vedettävä rajaus voisi toimia nykyisen sijaan (tästä on ollut jo kauan suunnitelmia).

### Näkyvyyden laajennukset

Nykyiseen näkyvyyteen liittyy useita epäloogisuuksia ja parannuskohteita. HY:ssä olemme todenneet seuraavien muutosten olevan tarpeellisia:

- Opettajien pitäisi voida verrata omien kurssiensa statistiikkoja kurssien organisaatioiden keskiarvoon. Vanhastaan se ei ole mahdollista ellei opettajalla ole lisäksi organisaatio-oikeuksia. Ratkaisu on se, että opettaja näkee kurssin järjestävän (pää)organisaation yhteenvedon (ei kuitenkaan vielä muita organisaation rinnakkaisia kursseja).
- Organisaation jäsenten tulisi voida nähdä enemmän vertailustatistiikkaa. Esim: TKT:n ohjelman johtaja ei näe muuta kuin TKT:n keskiarvon, mutta suotavaa olisi että näkisi myös yläorganisaation eli MatLun keskiarvon. Lisäksi voitaisiin näyttää yliopisto-organisaation sekä yliopiston alaisten organisaatioiden keskiarvot (eli HY:ssä kaikkien tiedekuntien keskiarvot).

### Käyttökokemusparannuksia

- Haku- ja rajausvalinnat tallennetaan URL:n hakuparametreihin

### Muita yleisiä hyötyjä päivityksestä

Korjataan bugit ja epäselvyydet statistiikan laskennassa (esim. #1052).

Uusi laskentatapa tuottaa luotettavampaa dataa. HY:llä huomasimme, että vanha laskentatapa jätti useita organisaatioita näkymättömiin.

Parannetaan ylläpidettävyyttä. Nykyinen yhteenveto lasketaan parilla isolla "SQL-matolla", joiden ymmärtäminen ja muuttaminen on haastava jopa alkuperäisille toteuttajille.

Parannetaan tehokkuutta. Vaikka aiempi toteutus on melko optimoitu, HY:n uudessa tietokantaklusterissa yhteenvetonäkymän laskeminen isoille pomoille kestää hiukan liikaa.
Uudella logiikalla näkymästä on tarkoitus saada tehokas ilman ihmeempiä erikoiskikkoja.

## Toteutus

Tässä kuvaillaan toteutus pääpiirteittäin.

## Koodimuutosten sijainti.

### Muutokset backendiin

Tulevat koskemaan erityisesti `services/summary` -hakemiston koodia ja `routes/courseSummary/courseSummaryController.js` tiedostoa. Suurin osa yhteenvedon "välimuistitaulujen" päivityksestä ja yhteenvedon hakemisesta vastaavista funktioista tehdään kokonaan uudestaan.

### Tietokantamuutokset

Nykyinen materialized view `course_results_view` poistetaan.

Tilalle tulee Summary-modeli (taulun nimi `summaries`), johon statistiikkadata tallennetaan.

### Muutokset fronttiin

Yhteenvetonäkymä tehdään käytännössä kokonaan uusiksi. Muutokset kohdistuvat `client/pages/Summary` hakemistoon.

## Vielä ratkaisemattomia haasteita

- Puurakenne perustuu Sisun tietorakenteeseen, eikä välttämättä vastaa sitä mitä oikeasti näkymässä halutaan nähdä. Esim HY:n tohtoriohjelmat ovat organisaatiorakenteessa omissa tutkijakouluissaan mutta niiden statistiikka käytännössä haluttaisiin tiedekuntien alle. Lisäksi puurakenteessa on paljon näennäisesti turhia "väliorganisaatioita", jotka olisi järkevä jotenkin ohittaa.

## Miten edetään

Kun eri Norpan osapuolet hyväksyvät muutosten hyödyllisyyden ja pääpiirteittäin teknisen lähestymistavan, Toska tekee uudesta kurssiyhteenvetonäkymästä nopeasti prototyyppiversion vanhan rinnalle. Prototyyppiversio tulee ensin näkymään vain admineille mutta se viedään HY:n tuotantoon heti kun se on käyttökelpoinen. Kun se on todettu riittävän vakaaksi ja toimivaksi eri käyttäjäryhmille (Yliopistohallinto, johtoryhmien jäsenet, opettajat), korvataan vanha näkymä uudella.
