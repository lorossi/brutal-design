class Palette {
  constructor(foreground, background) {
    this._foreground = foreground;
    this._background = background;
  }

  get foreground() {
    return this._foreground;
  }

  get background() {
    return this._background;
  }
}

const PALETTES = [
  new Palette("#1e211e", "#89fc00"),
  new Palette("#1e211e", "#dc0073"),
  new Palette("#1e211e", "#008bf8"),
  new Palette("#1e211e", "#deff0a"),
  new Palette("#1e211e", "#08E8DE"),
];

class PaletteFactory {
  static random() {
    return PALETTES[Math.floor(Math.random() * PALETTES.length)];
  }
}

export { Palette, PaletteFactory };
