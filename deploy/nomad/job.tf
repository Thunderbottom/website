resource "nomad_job" "site" {
  jobspec = file("${path.module}/config/site.nomad")

  hcl2 {
    enabled = true
  }
}
