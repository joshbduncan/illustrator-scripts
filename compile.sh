#!/bin/bash

# Wrapper for ExtendScript Compiler to compile all modular scripts in base directory.

# Copyright 2023 Josh Duncan
# https://joshbduncan.com

# This script is distributed under the MIT License.

# set -x
set -Eeuo pipefail

while IFS= read -r FILE; do
    BASE_NAME=$(basename "$FILE")
    echo "compiling $BASE_NAME..."
    DEST_PATH="compiled_scripts/$BASE_NAME"
    DATA=$(/Users/jbd/Dropbox/DEV/projects/extend-script-compiler/escompile.sh "$FILE")
    printf '%s' "$DATA" >"$DEST_PATH"
done <<<"$(find . -type f -name "[^_]*.jsx" -d 1)"
