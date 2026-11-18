---
description: Palautevastaavat, vastanneiden näkyvyys ja palautteen poistaminen käytöstä kurssilta.
---

# Koulutusohjelman asetukset

Koulutusohjelman [[organisationSettings:settingsTab]]-välilehdellä (näkyy vain admineille, eli koulutusohjelmajohtajille ja palautevastaaville) on listattu palautevastaavat, [[organisationSettings:generalSettings]] ja [[organisationSettings:courseSettings]]. Jokainen muutos tallentuu heti.

## Palautevastaavan lisääminen {#feedback-liaison}

Palautevastaava lisätään Norpassa. Palautevastaava saa koulutusohjelman (admin- eli) hallinnointioikeudet.

1. Avaa koulutusohjelman sivulla [[organisationSettings:settingsTab]]-välilehti.
2. Kirjoita kohtaan [[organisationSettings:newCorrespondent]] vähintään viisi merkkiä henkilön sähköpostiosoitteesta tai nimestä.
3. Valitse oikean henkilön kohdalla [[organisationSettings:setAsCorrespondent]] ja vahvista.

Haku löytää vain yliopiston henkilökuntaa. Jos henkilöä ei löydy, pyydä häntä kirjautumaan kerran Norppaan ja yritä uudelleen.

[[organisationSettings:feedbackCorrespondents]]-listassa näkyvät koulutusohjelman palautevastaavat. [[organisationSettings:remove]] poistaa palautevastaavan.

## Vastanneiden näkyvyys {#student-list}

Kyselyn [[feedbackTargetView:studentsWithFeedbackTab]]-välilehdellä kurssin vastuuopettajat näkevät listan sen opiskelijoista. Koulutusohjelman adminit (koulutusohjelmajohtaja ja palautevastaava) voivat valita kohdassa [[organisationSettings:studentListVisibility]], näkyykö listassa myös se, _kuka on vastannut_:

- [[organisationSettings:studentListVisible]]: näkyy kaikilla koulutusohjelman kursseilla.
- [[organisationSettings:studentListHidden]]: ei näy millään kurssilla.
- [[organisationSettings:studentListByCourse]]: kohtaan [[organisationSettings:courseSettings]] tulee jokaiselle opintojaksolle kytkin [[organisationSettings:courseStudentListVisible]]. Kytke se päälle niillä kursseilla, joilla tieto halutaan näyttää.

Asetus koskee opintojaksoja, joiden ensisijainen organisaatio koulutusohjelma on. Jos opintojakso kuuluu useaan koulutusohjelmaan, ensisijainen koulutusohjelma voi tehdä asetuksen.

Jos vastanneiden näkyvyys -asetus on päällä, tieto näkyy, kun kysely on sulkeutunut ja vähintään viisi opiskelijaa on vastannut; katso [Ketkä ovat vastanneet](/guide/anonymity#who-answered).

## Palautteen poistaminen käytöstä kurssilta {#disable-feedback}

Kohdassa [[organisationSettings:courseSettings]] jokaisella koulutusohjelman opintojaksolla on kytkin [[organisationSettings:feedbackEnabled]]. Etsi kurssi kentällä [[organisationSettings:findByCourseUnit]] ja kytke palautteen keruu pois päältä, esimerkiksi jos kurssin palaute kerätään muulla tavalla.

Kytkin koskee opintojakson kaikkia toteutuksia. Kurssin opettajat näkevät silloin [[navBar:myCourses]]-sivulla ilmoituksen [[teacherView:disabledCourseWarning]] ja kurssin sivulla ilmoituksen [[feedbackTargetView:feedbackDisabled]]. Opiskelijat eivät pääse kyselyyn, eikä Norppa lähetä siitä sähköposteja. Kun kytket kytkimen takaisin päälle, palaute on jälleen normaalisti käytössä.
