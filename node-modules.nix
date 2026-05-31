{
  lib,
  stdenvNoCC,
  bun,
  src,
  version,
}:

stdenvNoCC.mkDerivation {
  pname = "maych-in-node-modules";
  inherit version src;

  nativeBuildInputs = [ bun ];

  impureEnvVars = lib.fetchers.proxyImpureEnvVars ++ [
    "GIT_PROXY_COMMAND"
    "SOCKS_SERVER"
  ];

  dontConfigure = true;
  dontFixup = true;

  buildPhase = ''
    runHook preBuild

    export HOME=$(mktemp -d)
    export BUN_INSTALL_CACHE_DIR=$(mktemp -d)

    bun install \
      --frozen-lockfile \
      --no-progress \
      --linker=hoisted

    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall
    cp -R ./node_modules $out
    runHook postInstall
  '';

  outputHash = "sha256-BjoYMug35u2pua3157Hvt6CFVjFsg5BMWjfAlWSd3V4=";
  outputHashAlgo = "sha256";
  outputHashMode = "recursive";
}
