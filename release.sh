#!/bin/bash

set -e

if [ "$(git rev-parse --abbrev-ref HEAD)" != "main" ]; then
  echo 'wrong branch: not on main';
  exit 1;
fi

# run tests
npm run test

# bump the package version
npm version "$1" --git-tag-version

# build the package
npm run build

# git commit
git add .
git commit --amend -C HEAD

# publish to npm
npm publish
git push

# create a github release + tag
version="$(jq -r '.version' < 'package.json')"
release="$(gh release create "$version" --title "$version" --generate-notes --target develop)"
open "$release"
