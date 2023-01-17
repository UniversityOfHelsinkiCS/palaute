# Norpan oikeusryhmät Helsingin yliopistolla

## Organisaatiotaso

Organisaatiotason oikeudet periytyvät ylhäältä alas: tiedekuntaoikeus periytyy kaikkiin ohjelmiin, 
ja ohjelmaoikeus (Norppa-slangilla organisaatio-oikeus) periytyy kaikkiin ohjelman kursseihin, joissa se on vastuullisena.



| Oikeusryhmä | Ketkä saavat | IAM   | Kuvaus  |
| :---        |    :----:    | :---: | ------: |
| Superadmin | Norpan vastuuhenkilöt ja kehittäjät | Käyttäjänimet kovakoodattu |  |
| Yliopistotason lukuoikeus | rehtoraatti, opintoasiainpäälliköt, ospa | hy-ypa-opa-opintoasiainpaallikot, hy-rehtoraatti, grp-ospa | |
| Kaikkien tohtoriohjelmien lukuoikeus | Tohtorikoulutuksen johtoryhmä ja Tine | hy-tohtorikoulutus-johtoryhma, hy-tine |
| Tiedekuntien admin | Opetusvaradekaani | hy-varadekaanit-opetus `JA` hy-[tdk]-dekanaatti | |
| Tiedekuntien lukuoikeus | Dekanaatti | hy-[tdk]-dekanaatti | |
| Organisaation admin | Koulutusohjelmien johtajat, Palautevastaavat | Koulutusohjelman johtoryhmän IAM JA saman tdk:n ko-johtaja IAM. palautevastaava ei perustu IAMeihin |
| Organisaation kirjoitusoikeus | Ei kukaan tällä hetkellä | ei ole | Voi muokata organisaation kysymyksiä ja aktivoida kursseja |  |  |
| Organisaation lukuoikeus | Johtoryhmä | Koulutusohjelman johtoryhmän IAM `JA` henkilö on ryhmässä hy-employees | 

---

## Kurssitaso

| Käyttäjäryhmä | Kuvaus |
| :---          | ------: |
| Vastuuopettaja | näkee kaikki palautteet ja voi muokata asetuksia |
| Opettaja | näkee julkisten kysymysten tulokset |
| Ilmoittautunut opiskelija | voi antaa palautetta ja näkee julkisten kysymysten tulokset |
| Organisaation lukuoikeus | näkee julkisten kysymysten tulokset |
| Organisaation adminoikeus | näkee kaikki palautteet | 

---

HUOM. kaikki dokumentaatio on korkeintaan *best effort*. Ajantasainen ja täsmällinen spesifikaatio löytyy **ainoastaan koodista**.

Kurssitason oikeudet on koodissa määritelty [tässä tiedostossa](https://github.com/UniversityOfHelsinkiCS/palaute/blob/master/src/server/services/feedbackTargets/Access.js)
