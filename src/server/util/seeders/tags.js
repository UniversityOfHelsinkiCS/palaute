const { Tag } = require('../../models')

// Kasvatustieteiden kandiohjelma
const ORGANISATION_ID = 'hy-org-116715340'

const tags = [
  {
    fi: 'Erityispedagogiikka',
    sv: 'Specialpedagogik',
    en: 'Special Education',
  },
  {
    fi: 'Kotitalousopettaja',
    sv: 'Lärare i huslig ekonomi',
    en: 'Home Economics Teacher',
  },
  {
    fi: 'Käsityönopettaja',
    sv: 'Lärare i slöjd, design och teknologi',
    en: 'Craft, Design and Technology Teacher',
  },
  {
    fi: 'Luokanopettaja',
    sv: 'Luokanopettaja',
    en: 'Class Teacher (LO)',
  },
  {
    fi: 'Varhaiskasvatuksen opettaja / Varhaiskasvatus',
    sv: 'Varhaiskasvatuksen opettaja / Varhaiskasvatus',
    en: 'Early Education Teacher (VO)',
  },
  {
    fi: 'Yleinen ja aikuiskasvatustiede',
    sv: 'Yleinen ja aikuiskasvatustiede',
    en: 'General and Adult Education (YAKT)',
  },
  {
    fi: 'Allmän pedagogik och vuxenpedagogik',
    sv: 'Allmän pedagogik och vuxenpedagogik',
    en: 'General and Adult Education (PED)',
  },
  {
    fi: 'Klasslärare',
    sv: 'Klasslärare',
    en: 'Class Teacher (KLU)',
  },
  {
    fi: 'Lärare inom småbarnspedagogik',
    sv: 'Lärare inom småbarnspedagogik',
    en: 'Early Education Teacher (SBP)',
  },
  {
    fi: 'Aineenopettajakoulutus (AO)',
    sv: 'Aineenopettajakoulutus (AO)',
    en: 'Subject Teacher (AO)',
  },
  {
    fi: 'Ämneslärarutbildning (ÄLU)',
    sv: 'Ämneslärarutbildning (ÄLU)',
    en: 'Subject Teacher (ÄLU)',
  },
  {
    fi: 'Subject Teacher Education Programme (STEP)',
    sv: 'Subject Teacher Education Programme (STEP)',
    en: 'Subject Teacher Education Programme (STEP)',
  },
  {
    fi: 'Monimuoto: Varhaiskasvatuksen opettaja',
    sv: 'Monimuoto: Varhaiskasvatuksen opettaja',
    en: 'Early education teacher line for multiform learning (VO)',
  },
  {
    fi: 'Flerform: Lärare inom småbarnspedagogik',
    sv: 'Flerform: Lärare inom småbarnspedagogik',
    en: 'Early education teacher line for multiform learning (SBP)',
  },
]

const seedTags = async () => {
  for (const tagName of tags) {
    await Tag.findOrCreate({
      where: {
        name: tagName,
        organisationId: ORGANISATION_ID,
      },
      defaults: {
        name: tagName,
        organisationId: ORGANISATION_ID,
      },
    })
  }
}

module.exports = { seedTags }
