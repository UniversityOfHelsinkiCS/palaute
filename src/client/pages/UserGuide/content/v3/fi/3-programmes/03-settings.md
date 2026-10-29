# Asetukset

Koulutusohjelman sivun [[organisationSettings:settingsTab]]-välilehdellä (vain hallinnoijat) ovat palautevastaavat, [[organisationSettings:generalSettings]] ja [[organisationSettings:courseSettings]]. Jokainen muutos tallentuu heti.

## Palautevastaavan lisääminen {#feedback-liaison}

Palautevastaava saa koulutusohjelman hallinnointioikeudet Norpassa: hän näkee kaikki sen kurssien vastaukset ja voi tehdä kaiken, mitä koulutusohjelman hallinnoijat voivat. Koulutusohjelman hallinnoijat lisäävät palautevastaavat:

1. Avaa koulutusohjelman sivulla [[organisationSettings:settingsTab]]-välilehti.
2. Kirjoita kohtaan [[organisationSettings:newCorrespondent]] vähintään viisi merkkiä henkilön sähköpostiosoitteesta tai nimestä.
3. Valitse oikean henkilön kohdalla [[organisationSettings:setAsCorrespondent]] ja vahvista.

Haku löytää vain yliopiston henkilökuntaa. Jos henkilöä ei löydy, pyydä häntä kirjautumaan kerran Norppaan ja yritä uudelleen.

[[organisationSettings:feedbackCorrespondents]]-listassa näkyvät koulutusohjelman palautevastaavat. [[organisationSettings:remove]] poistaa palautevastaavan.

## Vastanneiden näkyvyys {#student-list}

Kyselyn [[feedbackTargetView:studentsWithFeedbackTab]]-välilehdellä kurssin vastuuopettajat näkevät listan sen opiskelijoista. Kohdassa [[organisationSettings:studentListVisibility]] valitset, näkyykö listassa myös se, _kuka on vastannut_:

- [[organisationSettings:studentListVisible]]: näkyy kaikilla koulutusohjelman kursseilla.
- [[organisationSettings:studentListHidden]]: ei näy millään kurssilla.
- [[organisationSettings:studentListByCourse]]: kohtaan [[organisationSettings:courseSettings]] tulee jokaiselle opintojaksolle kytkin [[organisationSettings:courseStudentListVisible]]. Kytke se päälle niillä kursseilla, joilla tieto näytetään.

Asetus koskee opintojaksoja, joiden ensisijainen organisaatio koulutusohjelma on. Jos opintojakso kuuluu useaan koulutusohjelmaan, ratkaisee ensisijaisen koulutusohjelman asetus.

Silloinkin kun näyttäminen on sallittu, tieto näkyy vain, kun kysely on sulkeutunut ja vähintään viisi opiskelijaa on vastannut; katso [Ketkä ovat vastanneet](/guide/anonymity#who-answered).

## Palautteen poistaminen käytöstä kurssilta {#disable-feedback}

Kohdassa [[organisationSettings:courseSettings]] jokaisella koulutusohjelman opintojaksolla on kytkin [[organisationSettings:feedbackEnabled]]. Etsi kurssi kentällä [[organisationSettings:findByCourseUnit]] ja kytke se pois päältä, esimerkiksi jos kurssin palaute kerätään muulla tavalla.

Kytkin koskee opintojakson kaikkia toteutuksia. Kurssin opettajat näkevät silloin [[navBar:myCourses]]-sivulla ilmoituksen [[teacherView:disabledCourseWarning]] ja kurssin sivulla ilmoituksen [[feedbackTargetView:feedbackDisabled]]. Opiskelijat eivät pääse kyselyyn, eikä Norppa lähetä siitä sähköposteja. Kun kytket kytkimen takaisin päälle, palautetta kerätään taas.
