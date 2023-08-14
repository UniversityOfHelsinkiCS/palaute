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

## Toteutus

Yksityiskohdat työn alla.

### Muutokset backendiin

Tulevat koskemaan erityisesti `services/summary` -hakemiston koodia. Suurin osa yhteenvedon "välimuistitaulujen" päivityksestä ja yhteenvedon hakemisesta vastaavista funktioista tehdään kokonaan uudestaan.

### Tietokantamuutokset

Nykyinen materialized view `course_results_view` tullaan poistamaan.

Tilalle tulee uudenlainen materialized view tai volatile table, johon tallennetaan kaikki yhteenvedon rivit. Kuten nykyään, uusi välimuistitaulu päivitetään sopivin väliajoin.

### Muutokset fronttiin

Yhteenvetorivien komponentit pysyvät pääosin samanlaisena, erona se että rakenne muuttuu enemmän puurakenteeksi.

Yhteenvedon tiedekuntavalitsin poistetaan.

### Haasteita

- Sisun organisaatiodatassa on PALJON epärelevantteja organisaatioita. Esimerkiksi HY:n alla on suoraan 318 organisaatiota, joista noin 15 on Norpassa relevantteja. Ne täytyy osata filtteröidä jollain järkevällä logiikalla. Jamiin kovakoodattu organisaatiorakenne on yksi vaihtoehto, Toskassa se on yleinen ratkaisu.
- Kurssien palautemääriä ei saa laskea kahteen kertaan (#1052). Koska kurssin järjestäjänä voi olla useita organisaatioita, laskettaessa organisaatioiden statistiikkaa on muistettava, mitkä kurssit on jo laskettu mukaan.
- Muitakin tulee varmaan...

## Miten edetään

Kun eri Norpan osapuolet hyväksyvät muutosten hyödyllisyyden ja pääpiirteittäin teknisen lähestymistavan, Toska tekee uudesta kurssiyhteenvetonäkymästä nopeasti prototyyppiversion vanhan rinnalle. Prototyyppiversio tulee ensin näkymään vain admineille mutta se viedään HY:n tuotantoon heti kun se on käyttökelpoinen. Kun se on todettu riittävän vakaaksi ja toimivaksi eri käyttäjäryhmille (Yliopistohallinto, johtoryhmien jäsenet, opettajat), korvataan vanha näkymä uudella.
