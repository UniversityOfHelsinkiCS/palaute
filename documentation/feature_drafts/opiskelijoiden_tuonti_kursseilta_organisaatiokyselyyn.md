# Ominaisuusluonnos: Opiskelijoiden tuonti kursseilta organisaatiokyselyyn

**RELATED TO #1357**

## Tavoite

Luodaan uusi tietokantataulu, joka mahdollistaa opiskelijoiden tietojen hallinnan, kun heidät tuodaan kursseilta (`courserealisations`) organisaatiokyselyyn.

### Uuden taulun sisältö:

- **Organisaatiokyselyn ID** (`feedbacktargetId`)
- **Kurssin ID** (`courserealisationId`)
- **Käyttäjän palaute kohde ID** (`userfeedbackTargetId`)

Tämä rakenne mahdollistaa kurssilta tuotujen opiskelijatietojen tallentamisen organisaatiokyselyyn.

---

## Toiminnallisuus: Opiskelijoiden tuonti

### Kuvaus

Opiskelijat voidaan tuoda kursseilta organisaatiokyselyyn.

### Toiminnan vaiheet

1. Käyttäjä syöttää jonkin tunnisteen, kuten kurssikoodin.
2. Järjestelmä näyttää kurssit, joista opiskelijoita voi tuoda.
3. Käyttäjä valitsee kurssit, joista opiskelijat halutaan tuoda organisaatiokyselyyn.

### Hyöty

Tämä ominaisuus helpottaa opiskelijatietojen käsittelyä ja vähentää manuaalista työtä, kun kursseilta voidaan tuoda tiedot suoraan organisaatiokyselyyn.

---
