variable "ami_name" {
  type = string
  default = "${env("AMI_NAME")}"
}

variable "region" {
  type    = string
  default = "${env("AWS_REGION")}"
}

source "amazon-ebs" "ui" {
  ami_name      = var.ami_name
  instance_type = "t2.micro"
  region        = "${var.region}"
  source_ami_filter {
    filters = {
        name              = "CentOS Linux 7 x86_64 HVM EBS *",
        product-code      = "aw0evgkw8e5c1q413zgy5pjce"
    }
    owners      = ["679593333241"]
    most_recent = true
  }
  ssh_username = "centos"
}

# a build block invokes sources and runs provisioning steps on them.
build {
  sources = ["source.amazon-ebs.ui"]

  provisioner "shell" {
    inline = [
      "sudo mkdir /opt/ui",
      "sudo mkdir /opt/scripts",
      "sudo chmod -R 777 /opt/"
    ]
  }

  provisioner "file" {
    destination = "/opt/ui"
    source      = "dist/fob2-angular"
  }
  provisioner "file" {
    destination = "/opt/scripts"
    source      = "bake-scripts"
  }
  provisioner "shell" {
    inline = [
      "sudo chmod -R 755 /opt/scripts",
      "sudo /opt/scripts/bake-scripts/01-install-dependencies.sh",
    ]
  }

  post-processor "manifest" {
    output = "manifest.json"
    strip_path = true
  }
}