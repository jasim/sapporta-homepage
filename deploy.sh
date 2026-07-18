#!/usr/bin/env bash

set -euo pipefail

printf '\nUpdating package sources and switching the workspace to npm packages...\n'
pnpm package-sources update-npm
pnpm package-sources use:npm

printf '\nRemoving package-specific dependencies and lockfiles for a clean install...\n'
rm -rf \
  packages/api/node_modules \
  packages/api/pnpm-lock.yaml \
  packages/docs/node_modules \
  packages/docs/pnpm-lock.yaml \
  packages/frontend/node_modules \
  packages/frontend/pnpm-lock.yaml

printf '\nInstalling dependencies and building the application...\n'
pnpm install
pnpm build

printf '\nThe package-related files are ready. Add and commit them to git now.\n'
printf 'When that is complete, type "yes" to push main to origin and dokku: '
read -r confirmation

if [[ "$confirmation" != "yes" ]]; then
  printf 'Deployment aborted; nothing was pushed.\n'
  exit 1
fi

printf '\nPushing main to origin...\n'
git push origin main

printf '\nPushing main to dokku...\n'
git push dokku main

printf '\nDeployment pushes completed.\n'
