import { WORKLOAD_QUESTION_ID } from '../../util/config'

// The university-wide questions every student sees in the course feedback form from 2026-08-01, for the manual videos
export const MANUAL_UNIVERSITY_QUESTIONS = [
  {
    type: 'TEXT',
    required: true,
    data: {
      content: {
        fi: 'Vastaa seuraaviin väittämiin asteikolla 1 = täysin eri mieltä, 2 = osin eri mieltä, 3 = ei samaa eikä eri mieltä, 4 = osin samaa mieltä, 5 = täysin samaa mieltä, eos = en osaa sanoa',
        sv: 'Besvara följande påståenden med skalan 1 = helt av annan åsikt, 2 = delvis av annan åsikt, 3 = varken av samma eller annan åsikt, 4 = delvis av samma åsikt, 5 = helt av samma åsikt, n/a = ingen uppgift',
        en: 'Answer the following question using the scale 1 = Completely disagree, 2 = Partly disagree, 3 = Neither disagree nor agree, 4 = Partly agree, 5 = Completely agree, N/A = Cannot answer',
      },
    },
  },
  {
    type: 'LIKERT',
    required: true,
    data: {
      label: {
        fi: 'Kurssin rakenne ja aikataulu olivat selkeät',
        sv: 'Kursens struktur och tidtabell var tydliga',
        en: 'The course structure and schedule were clear',
      },
      shortLabel: { fi: 'Rakenne ja aikataulu', sv: 'Struktur och tidtabell', en: 'Structure and schedule' },
    },
  },
  {
    type: 'LIKERT',
    required: true,
    data: {
      label: {
        fi: 'Kurssilla oli selvästi esitetty se, mitä meidän tulisi oppia',
        sv: 'Det framgick tydligt på kursen vad vi förväntades lära oss',
        en: 'The intended learning outcomes of the course were clearly communicated',
      },
      shortLabel: { fi: 'Oppimistavoitteet', sv: 'Inlärningsmål', en: 'Learning objectives' },
    },
  },
  {
    type: 'LIKERT',
    required: true,
    data: {
      label: {
        fi: 'Opetustilanteissa opiskelijoita kannustettiin keskustelemaan ajatuksistaan ja näkökulmistaan',
        sv: 'Under undervisningstillfällena uppmuntrades studenterna att diskutera sina tankar och perspektiv',
        en: 'Students were encouraged to discuss their ideas and perspectives during teachings',
      },
      shortLabel: {
        fi: 'Kannustaminen keskusteluun',
        sv: 'Uppmuntran till diskussion',
        en: 'Encouraging discussion',
      },
    },
  },
  {
    type: 'LIKERT',
    required: true,
    data: {
      label: {
        fi: 'Oppimisen arvioinnin vaatimukset (tentti, harjoitus, kurssisuoritus) olivat minulle selvät',
        sv: 'Bedömningsgrunderna (tentamen, övning, kursprestation) var tydliga för mig',
        en: 'The requirements for assessment (examination, assignment, course performance) were clear to me',
      },
      shortLabel: {
        fi: 'Arvioinnin vaatimukset',
        sv: 'Bedömningsgrunderna',
        en: 'Requirements for assessment',
      },
    },
  },
  {
    type: 'LIKERT',
    required: true,
    data: {
      label: {
        fi: 'Kurssilla käytetyt menetelmät auttoivat minua luomaan yhteyksiä opiskeltavien asioiden ja aikaisempien tietojeni välillä',
        sv: 'De metoder som användes på kursen hjälpte mig att skapa kopplingar mellan det studerade innehållet och mina tidigare kunskaper',
        en: 'The methods used in the course helped me make connections between the course content and my prior knowledge',
      },
      shortLabel: {
        fi: 'Uuden ja aiemman tiedon yhdistäminen',
        sv: 'Koppling mellan ny och tidigare kunskap',
        en: 'Connecting new and prior knowledge',
      },
    },
  },
  {
    id: WORKLOAD_QUESTION_ID,
    type: 'SINGLE_CHOICE',
    required: true,
    data: {
      label: {
        fi: 'Työmäärä suhteessa opintopisteisiin oli',
        sv: 'Arbetsmängden i förhållande till studiepoängen var',
        en: 'The workload in relation to the credits awarded was',
      },
      options: [
        { id: 'ae8bccc7-1c4f-4f22-9c4c-2879d4e123d5', label: { fi: 'raskas', sv: 'tung', en: 'heavy' } },
        {
          id: 'b2dab0a2-4139-4dfc-949c-fdca744495c2',
          label: { fi: 'melko raskas', sv: 'ganska tung', en: 'fairly heavy' },
        },
        { id: 'e35a20ca-8e0e-4c44-8c26-6a197be3d422', label: { fi: 'sopiva', sv: 'lämplig', en: 'appropriate' } },
        {
          id: '2ea2b421-5c85-47cd-9008-1acc008e009f',
          label: { fi: 'melko kevyt', sv: 'ganska lätt', en: 'fairly light' },
        },
        { id: 'c5ecf5aa-76cc-4ded-985c-8cbd091a4a95', label: { fi: 'kevyt', sv: 'lätt', en: 'light' } },
      ],
    },
  },
  {
    type: 'OPEN',
    required: false,
    data: {
      label: {
        fi: 'Muita huomioita (avoin kysymys)',
        sv: 'Övriga kommentarer (öppen fråga)',
        en: 'Additional comments (open-ended question)',
      },
    },
  },
]
