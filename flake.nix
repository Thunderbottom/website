{
  description = "maych.in for Nix";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        packages.maych-in = pkgs.stdenv.mkDerivation rec {
          pname = "maych-in";
          version = "2023-12-01";
          src = ./.;
          nativeBuildInputs = [pkgs.zola];
          buildPhase = "zola build";
          installPhase = "cp -r public $out";
        };
        defaultPackage = self.packages.${system}.maych-in;
        devShell = pkgs.mkShell {
          packages = with pkgs; [
            zola
          ];
        };
      }
    );
}
