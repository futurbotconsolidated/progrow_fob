#!/usr/bin/env bash
set -e
# Source the variables
SCRIPT_DIR=$(cd $(dirname $BASH_SOURCE[@]) && pwd)
ROOT_DIR=$(cd $SCRIPT_DIR/.. && pwd)

[ -f ${SCRIPT_DIR}/static_vars.sh ] && source $SCRIPT_DIR/static_vars.sh
export SCRIPT_NAME="INSTALL-DEPENDENCIES"
[ -f ${SCRIPT_DIR}/func_utils ] && source ${SCRIPT_DIR}/func_utils
##################################################################

log_message "Need to implement"

log_message "###########################DONE##############################"
log_message "===========================DONE=============================="