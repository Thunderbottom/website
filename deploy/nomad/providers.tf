terraform {
  backend "s3" {
    bucket                      = "terraform-deku-moe"
    key                         = "maychin-site"
    region                      = "deku"
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    force_path_style            = true
  }
  required_providers {
    nomad = {
      source  = "hashicorp/nomad"
      version = "1.4.14"
    }
  }
}

provider "nomad" {
  address = "http://localhost:4646"
}
