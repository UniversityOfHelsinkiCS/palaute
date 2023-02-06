# Norppa dictionary

Some Norppa-related terminology and "koodari slang" is explained here

## Common entities

| Code name | Short name | Finnish | Sisu | Additional info |
| :-------: | :--------: | :------: | :-------: | :-------: |
| `feedbackTarget` | `fbt` | Palautekohde | - |
| `courseRealisation` | `cur` | Instanssi/Toteutus | CourseUnitRealisation | |
| `courseUnit` | `cu` | Opintojakso | CourseUnit | |
| `organisation` | `org` | Organisaatio | Organisation | Mostly study programmes, also faculties |
| `user` | - | Käyttäjä | Person | |
| `userFeedbackTarget` | `ufbt`| Käyttäjä-kurssitoteutus -assosiaatio? | Enrolment or responsibility | Represent student's enrolment or a teacher's responsibility association |
| `survey` | - | Palautekysely | - | Many levels: one by teacher, one by `org`, one by university |
| `question` | - | Kysymys | - | `survey` has many |
| `feedback` | `fb` | Opiskelijan palaute | - | json contains all of one student's answers to questions of survey |
| `feedbackResponse` | - | Vastapalaute | - | Given by teacher after feedback period over |

---

## Infra and services

| Name | type | description |
| :------: | :-------------------:| :-------- |
| Importer | not-so-micro service | imports parts of Sisu from export APIs to its DB and provides REST API  |
| Updater | NodeJS cronjob | updates Norppa DB from Importer every night |
| Pate | microservice | Sends emails with predefined templates |
| Jami | microservice | Provides different access rights to `org`s based on hy IAM-groups |

---

## Norppa Features

| Name | description |
| :------: | :-------- |
| Feedback target view | Stuff for one feedback target. Includes many sub-tabs |
| Feedback view | The feedback form student's fill |
| Feedback results | The result view of one feedback target. Sections for multiple choice and textual question answers |
| Feedback response | Given by teacher after feedback period over. An email is sent to students to notify of it |
| Course summary | A summary of all feedback stats visible to the `user` |
| Organisation summary | Same as above, but stats for one `org` |
| Course unit summary | Stats for feedback on one `cu`, identified by course code |

More slang will be added later