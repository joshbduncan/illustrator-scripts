SHELL := /bin/bash
PWD := $(realpath $(dir $(abspath $(firstword $(MAKEFILE_LIST)))))
CSV_URL = https://docs.google.com/spreadsheets/d/1T-pBrLAOL3WuF1K7h6Wo_vIUa0tui9YiX591YqqKMdA

.DEFAULT_GOAL := help
.PHONY: help
##@ General
help: ## Display this help section
	@echo $(MAKEFILE_LIST)
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

compile:  ## compile source scripts to jsx folder
	@echo "⚙️ compiling from source..."
	./tools/compile.sh