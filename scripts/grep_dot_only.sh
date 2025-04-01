#!/bin/bash
#Original script from https://github.com/UniversityOfHelsinkiCS/mobvita

if git grep -qE --cached "(it|describe)\.only" $(git diff --cached --name-only) ./cypress; then
    echo "Do not commit .only-tests. Did you remember to git add?"
    exit 1
else
    # echo "No .only-tests found"
    exit 0
fi