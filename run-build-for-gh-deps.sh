#!/bin/bash

# TODO: This file is temporary and will be removed after testing

log() {
  echo "=============================== $1 ==============================="
}

run_command() {
  echo "\$ $1"
  eval $1
}

log "Starting deployment script"
run_command "pwd"

# frontend-platform
log "Processing frontend-platform"
run_command "cd node_modules/@edx/" || exit
log "Current directory: $(pwd)"
run_command "rm -rf frontend-platform"
run_command "mkdir frontend-platform" || exit
run_command "ls -l"
run_command "git clone -b dcoa/design-tokens-support --single-branch https://github.com/eduNEXT/frontend-platform.git frontend-platform-temp"
run_command "cd frontend-platform-temp" || exit
log "Current directory: $(pwd)"
run_command "cat package.json" || exit
run_command "ls -l"
run_command "cp -r dist/. ../frontend-platform/" || exit
run_command "cd .." || exit
run_command "ls -l"
log "Current directory: $(pwd)"
run_command "rm -rf frontend-platform-temp"
run_command "cd frontend-platform" || exit
run_command "ls -l"
run_command "cd ../../.."
log "Current directory: $(pwd)"

# frontend-build
log "Processing frontend-build"
run_command "cd node_modules/@openedx/" || exit
log "Current directory: $(pwd)"
run_command "rm -rf frontend-build"
run_command "git clone -b dcoa/design-tokens-support --single-branch https://github.com/eduNEXT/frontend-build.git"
run_command "cd frontend-build" || exit
log "Current directory: $(pwd)"
run_command "npm ci"
run_command "cd ../../.." || exit
log "Current directory: $(pwd)"

# paragon
log "Processing paragon"
run_command "ls -l"
run_command "cd node_modules/@openedx/" || exit
log "Current directory: $(pwd)"
run_command "rm -rf paragon"
run_command "mkdir -p paragon"
run_command "cd paragon" || exit
log "Current directory: $(pwd)"
run_command "npm pack @openedx/paragon@23.0.0-alpha.2"
run_command "tar -xzf openedx-paragon-23.0.0-alpha.2.tgz --strip-components=1"
run_command "rm openedx-paragon-23.0.0-alpha.2.tgz"
run_command "cd ../../.." || exit
log "Current directory: $(pwd)"

# frontend-component-header
log "Processing frontend-component-header"
run_command "cd node_modules/@edx/" || exit
log "Current directory: $(pwd)"
run_command "rm -rf frontend-component-header"
run_command "mkdir frontend-component-header" || exit
run_command "git clone -b Peter_Kulko/support-design-tokens --single-branch https://github.com/PKulkoRaccoonGang/frontend-component-header.git frontend-component-header-temp"
run_command "cd frontend-component-header-temp" || exit
log "Current directory: $(pwd)"
run_command "cp -r dist ../frontend-component-header/" || exit
run_command "cp -r package.json ../frontend-component-header/" || exit
run_command "cd .."
run_command "rm -rf frontend-component-header-temp"
run_command "cd ../.." || exit
log "Current directory: $(pwd)"

# frontend-component-footer
log "Processing frontend-component-footer"
run_command "cd node_modules/@edx/" || exit
log "Current directory: $(pwd)"
run_command "rm -rf frontend-component-footer"
run_command "mkdir frontend-component-footer" || exit
run_command "git clone -b Peter_Kulko/support-design-tokens --single-branch https://github.com/PKulkoRaccoonGang/frontend-component-footer.git frontend-component-footer-temp"
run_command "cd frontend-component-footer-temp" || exit
log "Current directory: $(pwd)"
run_command "cp -r dist ../frontend-component-footer/" || exit
run_command "cp -r package.json ../frontend-component-footer/" || exit
run_command "cd .."
run_command "rm -rf frontend-component-footer-temp"
run_command "cd ../.." || exit
log "Current directory: $(pwd)"

# webpack
log "Running webpack"
run_command "fedx-scripts webpack"

log "Deployment script finished."
