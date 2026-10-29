# Course summary

The course summary collects the feedback statistics of course surveys: the averages of the university level scale questions, how many students answered and how many courses got counter feedback. Teachers see their own courses, programme staff the courses of their programmes and faculties.

Open [[navBar:courseSummary]] in the top menu. It has two views:

- [[courseSummary:myCourses]]: the courses where you're a responsible teacher or a teacher, grouped by organisation.
- [[courseSummary:myOrganisations]]: the degree programmes, faculties and other organisations you have [rights](/guide/roles#organisation-rights) to, with their course units. Shown only if you have such rights.

A programme's own summary is also on its page, on the [[organisationSettings:summaryTab]] tab; there the programme's own scale questions are included too. See [Degree programmes and faculties](/guide/programmes#programme-page).

Open an organisation to see the rows under it. Clicking a course unit opens its page, with a row for each realisation; from a realisation you get to its survey's answers.

[[video:course-summary]]

## What the figures show {#figures}

Each row has these columns:

- _One column for each university level scale question_ (and on a programme's page, for each of its scale questions): the average answer on the scale 1-5. "Cannot answer" isn't counted. Hold the pointer over a column heading to see the question.
- _Workload_: an arrow showing whether students found the workload heavy or light compared to the credits. Hold the pointer over it to see how the answers were distributed.
- [[courseSummary:feedbackCount]]: answers / enrolled students.
- [[courseSummary:feedbackPercentage]]: the share of students who answered.
- [[courseSummary:feedbackResponsePercentage]]: the share of course realisations that got counter feedback.
- [[courseSummary:censoredCount]]: answers hidden by the course's responsible teachers or the programme's admins. Shown only to the organisation's admins.

The colour of an average shows how high it is: red for low averages, through yellow, to green for high ones. A pale cell means there are no answers.

The figures of a course unit, programme or faculty are calculated from the answers to all of its course realisations, not as an average of averages.

The columns are the university level questions in use at the start of the chosen period. If a course's survey had a different set of questions, its row shows an info icon instead of averages.

Click a column heading to sort the rows by it. [[courseSummary:tableView]] shows the same figures as one table, and [[courseSummary:treeView]] brings back the tree. In [[courseSummary:myOrganisations]], you can pin the organisations you follow most to the top with [[courseSummary:pinOrganisation]].

## Choosing the time period {#filters}

By default the summary shows the current academic year. Above the rows, choose:

- [[courseSummary:year]]: an academic year, from 2020 onwards.
- [[courseSummary:semester]]: autumn or spring of that year.
- [[courseSummary:period]]: a teaching period of that semester.

A course realisation is included if its course dates in Sisu overlap the chosen time, not by when its survey was open.

The menu next to the time period chooses whether Open University courses are included: [[courseSummary:includeOpenUni]], [[courseSummary:excludeOpenUni]] or [[courseSummary:onlyOpenUni]].

## Downloading the figures {#download}

1. Choose the time period.
2. Click [[common:exportXLSX]] at the top of the page.
3. Choose what to include: [[generateReport:organisations]], [[generateReport:courseUnits]] and/or [[generateReport:courseRealisations]]. Each becomes its own sheet.
4. Click [[common:exportXLSX]].

[[video:course-summary-download]]

On the course summary page, the file has your organisations and your own courses. On a programme's [[organisationSettings:summaryTab]] tab, it has only that programme, with its own questions too.

To download the answers of a single survey, use its [[feedbackTargetView:feedbacksTab]] tab instead; see [Downloading the answers](/guide/results#download).

## Why a course is missing {#missing-courses}

The course summary covers _course surveys only_: interim feedback and programme surveys aren't in it. A course may be missing because:

- _The figures haven't been updated yet._ Course unit, programme and faculty figures are recalculated every night, so new answers and new counter feedback show there the next day.
- _Its survey hasn't opened yet._ Surveys that haven't opened aren't counted.
- _It has no students_ in Norppa.
- _It's in another period._ The period goes by the course's dates in Sisu, not by when its survey was open.
- _It belongs to another organisation in Sisu._ An organisation's summary has the courses whose course unit or realisation belongs to it in Sisu. A course unit that's linked to the programme only through its realisation is marked [[common:partiallyResponsible]].
- _You're not its teacher in Sisu._ [[courseSummary:myCourses]] shows only the courses where you're a responsible teacher or a teacher.

If a course is still missing a few days after its data in Sisu has been fixed, [contact support](/guide/support#support).
