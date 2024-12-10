# Opetukseni rework

Välipalautteiden ja organissatiokyselyiden toteutuksien myötä Opetukseni sivu (/courses) kaipaisi ominaisuuksia, joita on nyt vaikea sovittaa nykyiseen toteutukseen.

Halutaan esimerkiksi jaoitella organisaatiokyselyt ja yliopistokurssit omina näkyminään. Nyt organisaatiopalautteet näkyvät muiden kurssitoteutuksien seassa.

![Opetukseni nykytilanne](2024-02-02_12-11.png 'Opetukseni nykytilanne')

Tarkoituksena on sallia opettajien vaihtaa uuteen näkymään ainakin aluksi ns. feature togglen avulla.

## MVP

Sama tyyli kuin "Kurssipalautteeni" (/feedbacks) sivustolla.

Kurssit jaotellaan kolmeen tabiin: odottaa, annetut ja päättyneet. Jokaisessa tabissa näytetään opettajan yliopistokurssit sekä mahdolliset organisaatiokyselyt omina kokonaisuuksina.

![Opetukseni ehdotus](opetukseni_suggestion.png 'Opetukseni ehdotus')

Samalla toteutetaan järkevät tietorakenteet, joista saadaan selville välipalautteet kurssitoteutuksille. Nyt välipalautteet katsotaan melkoisella himmelillä. Välipalautteet muutenkin saattavat rikkoa [FeedbackResponseChip](/src/client/pages/MyTeaching/FeedbackResponseChip.js) toiminnallisuutta tällä hetkellä.

## Jatkokehitys

Sallitaan lukuvuosi rajaus päättyneiden kurssien osalta. Nyt joillakin opettajilla saattaa olla todella paljon vanhoja kursseja näkymässä.

Mahdollisuus luoda uusia kurssilajitteluita helposti esimerkiksi "Välipalautteet" tms. jos on tarpeellista.

## Hyödyt

- Nopeampi pageload kun haetaan pienempi määrä kursseja / tabi.
- Selkempi rakenne.
- Jatkokehitys ja uusien featureiden sovittaminen helpottuu

## Haasteita

- Backend toiminnot täytyy kirjoittaa ja suunnitella aika pitkälti uusiksi.

## Aikataulu

MVP aika nopeasti saatavilla.
