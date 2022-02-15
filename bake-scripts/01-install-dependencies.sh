#!/usr/bin/env bash
set -e
# Source the variables
SCRIPT_DIR=$(cd $(dirname $BASH_SOURCE[@]) && pwd)
ROOT_DIR=$(cd $SCRIPT_DIR/.. && pwd)

[ -f ${SCRIPT_DIR}/static_vars.sh ] && source $SCRIPT_DIR/static_vars.sh
export SCRIPT_NAME="INSTALL-DEPENDENCIES"
[ -f ${SCRIPT_DIR}/func_utils ] && source ${SCRIPT_DIR}/func_utils
##################################################################

# Install node js
log_message "Install nginx"
sudo yum install -y epel-release
sudo yum install -y nginx

sudo rm -rf /usr/share/nginx/html/*
sudo cp -rf /opt/ui/fob2-angular/* /usr/share/nginx/html/
systemctl enable nginx
cat > /etc/nginx/default.d/ui.conf << EOF
location / {
    try_files \$uri \$uri/ /index.html =404;
}
EOF

## Install SSM agent
log_message "Install SSM agent"
cd /tmp
sudo yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm
sudo systemctl enable amazon-ssm-agent
log_message "SSM agent has been setup"

# curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo -E bash -
# sudo yum install -y nodejs

# # Install angular cli and pm2
# sudo npm install -g @angular/cli
# sudo npm install -g pm2

# # Configure pm2 to run hellonode on startup
# mkdir -p ~/code/app-dist
# mv /tmp/hellonode.js ~/code/app-dist/hellonode.js
# cd  ~/code/app-dist/
# sudo pm2 start hellonode.js
# sudo pm2 startup systemd
# sudo pm2 save
# sudo pm2 list

log_message "###########################DONE##############################"
log_message "===========================DONE=============================="