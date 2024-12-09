# NorButton-komponentti [#1377](https://github.com/UniversityOfHelsinkiCS/palaute/issues/1377)


## Ongelma
Sovelluksen Material UI-kirjaston painikkeet ja niiden tyylittely vaihtelee paikkakohtaisesti. Lisäksi jotkin painiketyylit ovat käytettävyydeltään puutteellisia. Sovellus kaipaa universaaleja painikkeita ja määrittelyä sille millaisia tyylejä missäkin paikassa olisi käytettävä. 

## Tavoite
Luodaan uusi NorButton-komponentti Material UI'n Button-komponentin pohjalta. Luodaan style guide, jossa määritellään eri variantit. Korvataan sovelluksen Material-painikkeet uudella NorButton-painikkeella ja läpikäydään samalla sovelluksen painikkeet muokaten niistä style guiden mukaiset.

## Style guide
![NorButton style guide(1)](https://github.com/user-attachments/assets/a69f31ab-dd3e-40dd-ba86-2a9fc2677605)

## Hyödyt
- Yksi universaali painikekomponentti koko sovelluksessa sekä universaalit säännöt tyylittelylle
- Koherentimpi käyttöliittymä 
- Painikkeiden ymmärrettävyyden ja käyttökokemuksen parantaminen
- Mikäli tulevaisuudessa painikkeiden visuaalista ilmettä halutaan muuttaa, voidaan NorButton-komponenttia muokkaamalla vaihtaa painikkeiden tyyliä universaalisti

## Jatkokehitys
Ensimmäisessä toteutuksessa korvataan vain tavalliset painikekomponentit, tulevaisuudessa voidaan siirtää sovelluksen muut custom-painikekomponentit (esim. TooltipButton) NorButtonin variantiksi.

## Aikataulu
NorButton-komponentti ja style guide on lokaalisti jo toteutettu ja valmiina releaseen. Feature draft luotu poikkeuksellisesti jälkikäteen dokumentaatioksi ja kommunikaation tueksi.
