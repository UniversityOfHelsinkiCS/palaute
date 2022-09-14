export const links = {
  teacherInstructions: {
    fi: 'https://wiki.helsinki.fi/display/CF/3.+Opettajan+ohje',
    en: 'https://wiki.helsinki.fi/display/CF/3.+Teacher%27s+guide',
    sv: 'https://wiki.helsinki.fi/display/CF/3.+Teacher%27s+guide',
  },
  organisationInstructions: {
    fi: 'https://wiki.helsinki.fi/display/CF/4.+Koulutusohjelman+ohje',
    en: 'https://wiki.helsinki.fi/display/CF/4.+Degree+programme%27s+guide',
  },
  getCoursePage: (feedbackTarget) =>
    `https://studies.helsinki.fi/opintotarjonta/cur/${feedbackTarget.courseRealisation.id}`,
}
