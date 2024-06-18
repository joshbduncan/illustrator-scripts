#!/bin/bash

# Wrapper for ExtendScript Compiler to compile all modular scripts in base directory.

# Copyright 2024 Josh Duncan
# https://joshbduncan.com

# This script is distributed under the MIT License.

# set -x
set -Eeuo pipefail

# compile scripts
while IFS= read -r FILE; do
    BASE_NAME=$(basename "$FILE")
    echo "compiling $BASE_NAME..."
    DEST_PATH="jsx/$BASE_NAME"
    /Users/jbd/Dropbox/DEV/projects/escompile/escompile.sh "$FILE" >"$DEST_PATH"
done <<<"$(find src -type f -name "[^_]*.jsx*" -d 1)"

# compile helper functions
while IFS= read -r FILE; do
    BASE_NAME=$(basename "$FILE")
    echo "compiling $BASE_NAME..."
    DEST_PATH="jsx/helper_functions/$BASE_NAME"
    /Users/jbd/Dropbox/DEV/projects/escompile/escompile.sh "$FILE" >"$DEST_PATH"
done <<<"$(find src/utils -type f -name "[^_]*.jsx*" -d 1)"
