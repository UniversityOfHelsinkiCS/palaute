#!/bin/bash
#Original script from https://github.com/UniversityOfHelsinkiCS/mobvita

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FILES_WITH_ONLY=$(git grep -lE --cached "(test|describe)\.only" $(git diff --cached --name-only) ./e2e)

if [[ -n "$FILES_WITH_ONLY" ]]; then
    echo -e "${RED}Do not commit .only-tests.${NC} Found in the following files:"
    echo -e "${YELLOW}$FILES_WITH_ONLY${NC}"
    exit 1
else
    # echo "No .only-tests found"
    exit 0
fi