{
  description = "maych.in for Nix (Astro)";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        packages.maych-in = pkgs.buildNpmPackage {
          pname = "maych-in";
          version = "25.05";
          src = ./.;

          npmDepsHash = "sha256-L2Lg+mDto1c11Ea0dJl/zGXVGTw/iXMU1UADC69O00o=";

          nativeBuildInputs = with pkgs; [
            nodejs_20
          ];

          buildPhase = ''
            runHook preBuild
            npm run build
            runHook postBuild
          '';

          installPhase = ''
            runHook preInstall
            cp -r dist $out
            runHook postInstall
          '';

          # Skip npm audit and other unnecessary checks
          dontNpmInstall = false;
          npmBuildScript = "build";

          meta = with pkgs.lib; {
            description = "Personal blog and website built with Astro";
            homepage = "https://maych.in";
            license = licenses.mit;
            maintainers = [ ];
          };
        };

        packages.default = self.packages.${system}.maych-in;

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
            nodePackages.npm
            nodePackages.typescript
            nodePackages.prettier
          ];

          shellHook = ''
            echo "Welcome to maych.in development environment!"
            echo "Available commands:"
            echo "  npm run dev     - Start development server"
            echo "  npm run build   - Build for production"
            echo "  npm run preview - Preview production build"
            echo ""
            echo "Node.js version: $(node --version)"
            echo "npm version: $(npm --version)"
          '';
        };

        # Legacy attribute for backward compatibility
        defaultPackage = self.packages.${system}.default;
        devShell = self.devShells.${system}.default;
      }
    );
}
