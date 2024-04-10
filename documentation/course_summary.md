# Norppa Course Summary - a Manifesto

The Course Summary is easily the most complicated area of code in Norppa, and has gone through many design iterations and complete rewrites.
This writeup presents some of the challenges and solutions, and tries to document for posterity
why the latest implementation is the way it is.

## Overview

The main purpose of Course Summary is to quickly show a user an overview of their
courses' Likert-scale feedback. In addition, statistics such as number of students
and feedback response percentage are shown.

There are at least ~~three~~ ~~four~~ ~~five~~ six requirements that contribute to Course Summary having a
non-trivial technical implementation:

- **Show a very high-level aggregation**
  - Levels of aggregation from individual CURs to the university
- **Data visibility rights**
  - Users must see different levels of feedback stats defined by their access rights
- **Filtering parameters**
  - Filter data by academic periods & some organisation associations
- **Ease of use**
  - Acting as both a navigation element and a visualization, must be straightforward to browse
- **Speed**
  - Directly affects TTI experienced by many users
- **Sufficiently up to date**
  - Data should be no older than 24 hours

The number one culprit for why the Course Summary code is as complicated as it is,
is the complex university data model. It complicates especially the first and second items above.

Computing of the feedback data aggregation for an entity (such as an organisation)
is complicated, because it is "responsible" for course instances through multiple paths.
There are also many (in fact, N) levels of aggregation that need to happen.

Similarly, knowing what data should be shown to a user is complicated.
To keep the visibility rights logic somewhat under control, many simplifications are taken
but the code is still quite complicated.

## Caching

To achieve the speed requirement, we are forced to bring the number #1 performance tool in a
web programmers toolbox: caching (aka kakku, cake). The summary has gone through multiple iterations
but all of them had in common a similar process: every 24 hours, a cron job computes the summary aggregates,
and caches them. Clients then query the cached data and possibly also some mixture of freshly computed data.
In the past, Redis and PostgreSQL materialized views have been tried, but the latest iteration
uses a simple database table as a cache, called `summaries`.

Caching is not quite a walk in the park: since there are multiple levels of aggregation and different filtering parameters, we cannot just cache
the entire view, nor every entity as they are. The current implementation caches `every entity x every parameter combination`. This is a limitation:
specifying new parameters causes increasingly large cache storage requirements. Luckily, since we cache in the DB, we have quite a lot of room to grow,
and I'm also hopeful that Course Summary won't see many new filtering parameters.
