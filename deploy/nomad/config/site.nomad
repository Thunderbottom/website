job "maychin-site" {
  datacenters = ["asgard", "alfheim"]
  type        = "service"

  group "site" {
    count = 1

    network {
      mode = "bridge"
      port "http" {
        to = 80
      }
    }

    restart {
      attempts = 2
      interval = "2m"
      delay    = "30s"
      mode     = "fail"
    }

    service {
      name = "maychin-http"
      port = "http"

      check {
        type     = "http"
        port     = "http"
        path     = "/"
        interval = "5s"
        timeout  = "2s"
      }
    }

    task "maychin" {
      driver = "docker"

      config {
        image = "thunderbottom/site:latest"
        ports = ["http"]
      }

      resources {
        cpu    = 100
        memory = 100
      }
    }
  }
}
