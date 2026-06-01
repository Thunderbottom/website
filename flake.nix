{
  description = "maych.in for Nix (Astro)";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";
  inputs.treefmt-nix.url = "github:numtide/treefmt-nix";

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      treefmt-nix,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        treefmtEval = treefmt-nix.lib.evalModule pkgs {
          projectRootFile = "flake.nix";
          programs.nixfmt.enable = true;
          settings.formatter.prettier = {
            command = "${pkgs.bun}/bin/bun";
            options = [
              "node_modules/.bin/prettier"
              "--write"
            ];
            includes = [
              "*.js"
              "*.ts"
              "*.mjs"
              "*.cjs"
              "*.astro"
              "*.css"
              "*.json"
              "*.jsonc"
              "*.md"
              "*.mdx"
              "*.yaml"
              "*.yml"
            ];
            excludes = [
              "dist/**"
              "node_modules/**"
              ".astro/**"
              "result/**"
            ];
          };
        };

        nodeModules = pkgs.callPackage ./node-modules.nix {
          src = ./.;
          version = "25.05";
        };
      in
      {
        packages.maych-in = pkgs.stdenvNoCC.mkDerivation {
          pname = "maych-in";
          version = "25.05";
          src = ./.;

          nativeBuildInputs = with pkgs; [ bun ];

          configurePhase = ''
            runHook preConfigure
            cp -a ${nodeModules} node_modules
            chmod -R u+w node_modules
            runHook postConfigure
          '';

          buildPhase = ''
            runHook preBuild
            export HOME=$(mktemp -d)
            export LD_LIBRARY_PATH="${pkgs.stdenv.cc.cc.lib}/lib''${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
            NODE_ENV=production bun node_modules/astro/bin/astro.mjs build
            runHook postBuild
          '';

          installPhase = ''
            runHook preInstall
            cp -r dist $out
            runHook postInstall
          '';

          meta = with pkgs.lib; {
            description = "Personal blog and website built with Astro";
            homepage = "https://maych.in";
            license = licenses.mit;
            maintainers = [ ];
          };
        };

        packages.default = self.packages.${system}.maych-in;

        formatter = treefmtEval.config.build.wrapper;

        checks.formatting = treefmtEval.config.build.check self;

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            bun
            stdenv.cc.cc.lib
          ];

          shellHook = ''
            export LD_LIBRARY_PATH="${pkgs.stdenv.cc.cc.lib}/lib''${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
            echo "Welcome to maych.in development environment!"
            echo "Available commands:"
            echo "  bun run dev     - Start development server"
            echo "  bun run build   - Build for production"
            echo "  bun run preview - Preview production build"
            echo ""
            echo "Bun version: $(bun --version)"
          '';
        };

        devShells.images = pkgs.mkShell {
          buildInputs = with pkgs; [
            imagemagick
            oxipng
            jpegoptim
            exiftool
            parallel
            file
            coreutils
          ];

          shellHook = ''
            echo "Image processing environment loaded!"
            echo "Available tools:"
            echo "  - imagemagick (magick command)"
            echo "  - oxipng (PNG optimization)"
            echo "  - jpegoptim (JPEG optimization)"
            echo "  - webp tools (cwebp, dwebp)"
            echo "  - exiftool (EXIF data handling)"
            echo ""
            echo "Run './optimize-images.sh' to process photography images"
          '';
        };

        # Legacy attributes for backward compatibility
        defaultPackage = self.packages.${system}.default;
        devShell = self.devShells.${system}.default;
      }
    );
}
