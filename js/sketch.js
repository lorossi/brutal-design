import { Engine, SimplexNoise } from "./engine.js";
import { Partition } from "./partition.js";
import { PaletteFactory } from "./palette.js";

class Sketch extends Engine {
  preload() {
    this._createTexture();
  }

  setup() {
    this._palette = PaletteFactory.random();
    this._scl = 0.95;
    this._font = "VioletSans";

    this._partition = new Partition(0, 0, this.width, 1);
    this._partition.setColors(
      this._palette.background,
      this._palette.foreground
    );
    this._partition.split();
  }

  draw() {
    this.ctx.save();
    this.background(this._palette.background);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);
    this._partition.show(this.ctx);
    const biggest = this._partition.biggestEmptyChild();
    this._drawText(biggest);
    this.ctx.restore();

    this._addTexture();

    this.noLoop();
  }

  _createTexture() {
    this._texture = document.createElement("canvas");
    this._texture.width = this.width;
    this._texture.height = this.height;

    const ctx = this._texture.getContext("2d");
    const noise = new SimplexNoise();
    noise.setDetail(5, 0.25);
    const n_scl = 0.01;
    const scl = 2;

    // draw background
    for (let x = 0; x < this.width; x += scl) {
      for (let y = 0; y < this.height; y += scl) {
        const n = noise.noise(x * n_scl, y * n_scl);
        const c = Math.floor((64 * (n + 1)) / 2);
        ctx.fillStyle = `rgba(${c}, ${c}, ${c}, 0.1)`;
        ctx.fillRect(x, y, scl, scl);
      }
    }
  }

  _addTexture() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "lighter";

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.rotate(Math.floor(Math.random() * 4) * (Math.PI / 2));
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this.ctx.drawImage(this._texture, 0, 0);

    this.ctx.restore();
  }

  _drawText(biggest) {
    this.ctx.save();

    const height = Math.floor(biggest.size / 10);

    this.ctx.fillStyle = this._palette.background;
    this.ctx.font = `bold ${height}px ${this._font}`;
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";

    const text = "BRUTAL DESIGN";

    this.ctx.translate(biggest.border * 2, biggest.border * 2);

    const replicas = 5;
    for (let i = 0; i < replicas; i++) {
      this.ctx.save();
      this.ctx.translate(0, i * height * 0.85);
      this.ctx.fillText(text, biggest.x, biggest.y);
      this.ctx.restore();
    }

    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
