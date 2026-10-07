import type { TestUser } from '../fixtures/headers'

// Made-up people for the videos, with example.com addresses
const person = (id: string, givenname: string, sn: string, extra: Partial<TestUser> = {}): TestUser => ({
  uid: id,
  hyPersonSisuId: id,
  givenname,
  sn,
  mail: `${givenname}.${sn}@example.com`.toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o'),
  ...extra,
})

export const teacher = person('manual-teacher', 'Laura', 'Mäkelä', {
  hygroupcn: ['hy-employees'],
})

const studentNames = [
  ['Olli', 'Oppilas'],
  ['Aino', 'Virtanen'],
  ['Eetu', 'Korhonen'],
  ['Sanni', 'Mäkinen'],
  ['Leevi', 'Nieminen'],
  ['Iida', 'Laine'],
  ['Onni', 'Heikkinen'],
  ['Emma', 'Koskinen'],
  ['Väinö', 'Järvinen'],
  ['Ella', 'Lehtonen'],
  ['Eino', 'Lehtinen'],
  ['Helmi', 'Saarinen'],
  ['Elias', 'Salminen'],
  ['Venla', 'Heinonen'],
  ['Niilo', 'Niemi'],
  ['Lilja', 'Heikkilä'],
  ['Oliver', 'Kinnunen'],
  ['Pihla', 'Salonen'],
  ['Toivo', 'Turunen'],
  ['Kerttu', 'Salo'],
  ['Leo', 'Laitinen'],
  ['Isla', 'Tuominen'],
  ['Hugo', 'Rantanen'],
  ['Selma', 'Karjalainen'],
]

export const students = studentNames.map(([givenname, sn], index) =>
  person(`manual-student-${index}`, givenname, sn, {
    studentNumber: `012345${String(600 + index * 7)}`,
  })
)

// Logs in to give feedback, so the seed never gives feedback for them
export const [student] = students
