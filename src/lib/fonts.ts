interface FontData {
  name: string;
  data: ArrayBuffer;
  weight: number;
  style: "normal" | "italic";
}

export async function loadSiteFonts(): Promise<FontData[]> {
  const fonts: FontData[] = [];

  try {
    const { readFile, access } = await import("fs/promises");
    const path = await import("path");

    const possibleDirs = [
      path.join(process.cwd(), "public/fonts"),
      path.join(process.cwd(), "public", "fonts"),
      path.resolve(process.cwd(), "public", "fonts"),
    ];

    let fontsDir = null;

    for (const dir of possibleDirs) {
      try {
        await access(dir);
        fontsDir = dir;
        break;
      } catch (e) {
        // Directory doesn't exist, try next
      }
    }

    if (!fontsDir) {
      throw new Error("Could not find fonts directory");
    }

    const loadFont = async (filename: string, name: string, weight: number) => {
      try {
        const fontPath = path.join(fontsDir, filename);
        const fontData = await readFile(fontPath);

        const arrayBuffer = fontData.buffer.slice(
          fontData.byteOffset,
          fontData.byteOffset + fontData.byteLength,
        );

        fonts.push({
          name,
          data: arrayBuffer,
          weight,
          style: "normal",
        });
      } catch (e) {
        console.warn(`Failed to load ${name} ${weight}:`, e);
      }
    };

    // Load Commit Mono fonts (OTF should work with Satori)
    await loadFont(
      "atkinson-hyperlegible-next/atkinson-hyperlegible-next-v6-latin-regular.ttf",
      "Atkinson Hyperlegible Next",
      400,
    );

    await loadFont(
      "atkinson-hyperlegible-next/atkinson-hyperlegible-next-v6-latin-600.ttf",
      "Atkinson Hyperlegible Next",
      600,
    );

    await loadFont(
      "atkinson-hyperlegible-next/atkinson-hyperlegible-next-v6-latin-700.ttf",
      "Atkinson Hyperlegible Next",
      700,
    );

    if (fonts.length > 0) {
      return fonts;
    }

    throw new Error("All font loading attempts failed");
  } catch (error) {
    console.warn(
      "All fonts failed to load, using system font fallback:",
      error,
    );

    return [];
  }
}
