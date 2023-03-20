#!/bin/bash

# We expect to run this script after we build
# the `core/test/workspace-example` packages.

# Deno taks are limited with what they accept as
# string inputs. As of now, file globs and setting ENV vars
# aren't supported

# TODO: check back later if we make this a deno task
AUTOMATE_HOME=${AUTOMATE_HOME:-$HOME}
deno lint ${AUTOMATE_HOME}/.automate/cache/**/*.ts