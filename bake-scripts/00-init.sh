#!/usr/bin/env bash
set -e
# Source the variables
SCRIPT_DIR=$(cd $(dirname $BASH_SOURCE[@]) && pwd)
ROOT_DIR=$(cd $SCRIPT_DIR/.. && pwd)

[ -f ${SCRIPT_DIR}/static_vars.sh ] && source $SCRIPT_DIR/static_vars.sh
export SCRIPT_NAME="INIT"
[ -f ${SCRIPT_DIR}/func_utils ] && source ${SCRIPT_DIR}/func_utils
##################################################################

standard_bake() {
    $SCRIPT_DIR/01-install-dependencies.sh
    $SCRIPT_DIR/02-setup-workspace.sh
}

#################################
## Main logic.
#################################
CMD=${1:-std}
log_message "Beginning processing with RUN OPTION: $CMD"

case "$CMD" in
    bake)
        standard_bake
        ;;
    run)
        standard_run
        ;;
    *)
        log_error "$1 command is not recognized."
esac