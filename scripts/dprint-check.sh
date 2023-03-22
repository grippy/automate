#!/bin/bash
set -e

# TODO: check back later if we make this a deno task
#       (requires glob support)

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
AUTOMATE_CORE=${AUTOMATE_CORE:-$SCRIPT_DIR/..}
ARGS="README.md ./core/*.ts ./core/**/*.ts ./core/**/**/*.ts ./ext/*.ts ./ext/**/*.ts ./ext/**/**/*.ts ./cli/*.ts ./cli/**/*.ts ./cli/**/**/*.ts --excludes ./cli/template/"

echo 'dprint checking these files...'
cd $AUTOMATE_CORE
dprint output-file-paths $ARGS | sort
echo '---'
dprint check $ARGS
echo 'dprint done checking files'