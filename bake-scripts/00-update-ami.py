#!/usr/bin/env python3
import boto3, os, json

def main():
    # Get values from Lambda environment variables.
    launch_template_id = os.environ.get("launch_template_id", "lt-04cf6e5b5eeb4f991")
    asg_name = os.environ.get("asg_name", "terraform-20220119014405456800000003")
    new_ami = os.environ.get("new_ami", "ami-09a8a56b3464e3284")

     # Create boto3 clients
    ec2 = boto3.client("ec2")
    asg = boto3.client("autoscaling")

    response = ec2.create_launch_template_version(
        LaunchTemplateId=launch_template_id,
        SourceVersion="$Latest",
        VersionDescription="Latest-AMI",
        LaunchTemplateData={
            "ImageId": new_ami
        }
    )
    print("Updated AMI ID in launch template")
    print(f"{response}")

    response = ec2.modify_launch_template(
        LaunchTemplateId=launch_template_id,
        DefaultVersion="$Latest"
    )
    print("Set launch template default to $Latest")
    print(f"{response}")

    strategy = "Rolling"
    response = asg.start_instance_refresh(
        AutoScalingGroupName=asg_name,
        Strategy=strategy
    )
    print("Triggered autoscaling to bring new AMI")
    print(f"{response}")

if __name__ == "__main__":
    main()