#!/usr/bin/env python3
import json
import argparse

parser = argparse.ArgumentParser(description="Transform TRE request to ARM parameters")
parser.add_argument("--input", required=True)
parser.add_argument("--config", required=True)
parser.add_argument("--output", required=True)
args = parser.parse_args()

with open(args.input) as f:
    request = json.load(f)

with open(args.config) as f:
    config = json.load(f)

workspace_name = request.get("workspaceName", "").lower()
department = request.get("requester", {}).get("department", "unknown").lower()

resource_group_name = f"rg-tre-{department}"

tags = {
    "CostCentre": "TRE",
    "DataClassification": "restricted",
    "Environment": "research",
    "Owner": "TRE-Platform",
    "System": "TRE"
}

parameters = {
    "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "workspaceName": { "value": workspace_name },
        "location": { "value": config["location"] },
        "resourceGroupName": { "value": resource_group_name },
        "privateEndpointSubnetId": {
            "value": config["network"]["privateEndpointSubnetId"]
        },
        "privateDnsSubscriptionId": {
            "value": config["dns"]["privateDnsSubscriptionId"]
        },
        "privateDnsResourceGroupName": {
            "value": config["dns"]["privateDnsResourceGroupName"]
        },
        "tags": {
            "value": tags
        }
    }
}

with open(args.output, "w") as f:
    json.dump(parameters, f, indent=2)

print(f"Workspace: {workspace_name}")
print(f"Resource Group: {resource_group_name}")
print("Owner tag: TRE-Platform")
