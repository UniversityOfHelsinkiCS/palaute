# Vastausten kerääminen

Kysely aukeaa itsestään avautumispäivänään, ja kurssin kyselyn opiskelijat saavat siitä sähköpostin. Saat lisää vastauksia, kun jaat kyselyn linkin opetuksessasi ja lähetät muistutuksen kyselyn ollessa auki. Välipalautteesta ja koulutusohjelman kyselystä opiskelijat eivät saa sähköpostia automaattisesti, joten niissä linkki ja muistutusviesti ovat ainoat keinot tavoittaa opiskelijat.

## Linkin ja QR-koodin jakaminen {#share-link}

Jokaisella kyselyllä on linkki, jonka kautta opiskelijat vastaavat siihen. Linkin jakaminen:

1. Avaa kysely [[navBar:myCourses]]-sivulta.
2. Avaa [[feedbackTargetView:shareTab]]-välilehti.
3. Valitse kohdan [[feedbackTargetView:studentLinkTitle]] vierestä [[common:copyToClipBoard]].

Välilehdellä on myös [[feedbackTargetView:studentLinkQRTitle]], jonka opiskelijat voivat lukea puhelimellaan esimerkiksi viimeisen luennon dialta. Helpoiten sen saa jaettua ottamalla siitä kuvakaappauksen.

Linkki toimii jo ennen kyselyn aukeamista, joten voit lisätä sen etukäteen esimerkiksi Moodleen. Jos opiskelija avaa sen etuajassa, hän näkee, milloin kysely on auki. Vastata voivat vain kyselyn omat opiskelijat: kurssille Sisussa ilmoittautuneet tai koulutusohjelman kyselyn vastaajiksi lisätyt.

[[feedbackTargetView:shareTab]]-välilehti näkyy kaikille kurssin opettajille ja koulutusohjelman hallinnoijille. Kurssin sivun [[feedbackTargetView:copyLink]]-painike kopioi saman linkin. Kun kysely on sulkeutunut, välilehdellä on myös [[feedbackTargetView:studentResultsLinkTitle]], ks. [Vastapalaute](/guide/counter-feedback).

## Muistutusviestin lähettäminen {#send-reminder}

Kun kysely on auki, voit lähettää sähköpostin niille sen opiskelijoille, jotka eivät ole vielä vastanneet. Tämä toimii samoin kaikissa kyselytyypeissä, ja se on helpoin tapa saada lisää vastauksia. Muistutuksen lähettäminen:

1. Avaa kyselyn [[feedbackTargetView:shareTab]]-välilehti.
2. Valitse [[feedbackTargetResults:sendReminder]].
3. Muokkaa halutessasi viestiä kentässä [[feedbackTargetResults:writeAMessage]].
4. Valitse [[feedbackTargetResults:sendReminderButton]].

Viesti lähtee kaikille kyselyn opiskelijoille, jotka eivät ole vielä vastanneet, ja siinä on aina linkki kyselyyn.

- Viestikenttään on valmiiksi kirjoitettu viesti kurssin opetuskielellä. Jos lähetät sen sellaisenaan, jokainen opiskelija saa Norpan vakiomuistutuksen omalla kielellään. Jos muokkaat sitä, kaikki opiskelijat saavat tekstisi sellaisenaan, joten kirjoita se kaikilla kielillä, joita opiskelijasi tarvitsevat.
- Muistutuksen voi lähettää kerran vuorokaudessa kyselyä kohden, lähetti sen kuka tahansa. Lähettämisen jälkeen välilehdellä näkyy, milloin muistutus on viimeksi lähetetty, eikä painike ole käytössä 24 tuntiin.
- Muistutuksen voivat lähettää kurssin vastuuopettajat ja hallintohenkilöt, koulutusohjelman hallinnoijat sekä koulutusohjelman kyselyn vastuuhenkilöt.

## Norpan lähettämät sähköpostit {#emails}

Norppa lähettää kyselyjä koskevat automaattiset sähköpostinsa kerran päivässä kello 11.15.

Kurssin kysely:

- Noin viikkoa ennen kyselyn aukeamista vastuuopettajat ja hallintohenkilöt saavat muistutuksen, jossa ovat kyselyn päivämäärät, linkki sen muokkaamiseen ja opettajien siihen mennessä lisäämät kysymykset, jotta he ehtivät vielä lisätä omiaan.
- Avautumispäivänä opiskelijat saavat sähköpostin, jossa on linkki kyselyyn ja sen sulkeutumispäivä. Myöhemmin ilmoittautuneet saavat viestin myöhempänä päivänä kyselyn ollessa auki. Jos vastuuopettaja avaa kyselyn [[editFeedbackTarget:openImmediately]]-painikkeella, viesti lähtee heti (ks. [Kurssien kyselyt](/guide/course-surveys#change-dates)).
- Kyselyn sulkeutumista seuraavana päivänä vastuuopettajat ja hallintohenkilöt saavat muistutuksen vastapalautteen kirjoittamisesta, jos kyselyyn on vastattu eikä vastapalautetta ole vielä kirjoitettu.

Koulutusohjelman kysely: vain vastapalautemuistutus kyselyn vastuuhenkilöille sulkeutumista seuraavana päivänä. Opiskelijat eivät saa viestiä kyselyn auetessa.

Välipalaute: ei lainkaan automaattisia sähköposteja.

Näiden lisäksi [jatkuvan palautteen](/guide/continuous-and-interim-feedback#continuous-feedback) kooste lähtee klo 8 niiltä kursseilta, joilla se on kytketty päälle, ja Norppa lähettää viestit, jotka käyttäjät lähettävät sen kautta: muistutuksesi, [vastapalautteen](/guide/counter-feedback#send-email), jos päätät lähettää sen sähköpostilla, sekä vastaukset jatkuvaan palautteeseen.

## Mitä opiskelija näkee {#student-view}

- Opiskelija näkee kyselynsä Norpassa kohdassa [[navBar:myFeedbacks]]. Avoimet kyselyt, joihin hän ei ole vastannut, ovat välilehdellä [[userFeedbacks:waitingForFeedbackTab]], ja niissä on [[userFeedbacks:giveFeedbackButton]]-painike.
- Vastattuaan opiskelija näkee yhteenvedon julkisten kysymysten siihen mennessä annetuista vastauksista. Katso [Kuka näkee vastaukset](/guide/results#public-answers).
- Kyselyn ollessa auki opiskelija voi muokata tai poistaa vastauksensa kohdassa [[navBar:myFeedbacks]].
- Vastaaminen on nimetöntä. Et näe, kuka vastasi mitä, joten et voi palkita yksittäisiä opiskelijoita vastaamisesta. Mitä voit nähdä, kerrotaan kohdassa [Ketkä ovat vastanneet](/guide/results#who-answered).

Opettaja ei voi vastata oman kurssinsa kyselyyn, vaan näkee sen [[common:preview]]-näkymänä.

## Alle viiden opiskelijan kurssit {#small-courses}

Pienellä kurssilla opiskelijan vastaukset voisi tunnistaa ilman nimeäkin. Siksi kysely toimii toisin, jos kurssille on ilmoittautunut alle viisi opiskelijaa:

- Kun opiskelija avaa kyselyn, häntä varoitetaan, että vastaukset voi olla mahdollista yhdistää häneen. Hän voi perua tai jatkaa.
- Lähettääkseen vastauksensa opiskelijan on rastitettava kohta, jolla hän hyväksyy, että opettaja näkee vastaukset, vaikka ilmoittautuneita on vähän.
- Vastaukset näkevät vain kurssin vastuuopettajat ja hallintohenkilöt. Opiskelijat, muut opettajat ja koulutusohjelman henkilöstö näkevät ilmoituksen, ettei tuloksia näytetä.
- Viikkoa ennen aukeamista lähetettävä muistutus kertoo vastuuopettajille, että kurssi on pieni.

Raja lasketaan Norpassa kurssille ilmoittautuneista opiskelijoista, ei vastauksista. Se koskee kaikkia kyselytyyppejä.
