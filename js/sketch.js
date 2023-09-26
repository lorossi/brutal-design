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
    this._setPageBackground(this._palette.background);

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.rotate(Math.floor(Math.random() * 4) * (Math.PI / 2));
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
    this._dark_texture = document.createElement("canvas");
    this._dark_texture.width = this.width;
    this._dark_texture.height = this.height;

    const ctx = this._dark_texture.getContext("2d");
    const noise = new SimplexNoise();
    noise.setDetail(3, 0.75);
    const n_scl = 0.0125;
    const scl = 4;

    // draw background
    for (let x = 0; x < this.width; x += scl) {
      for (let y = 0; y < this.height; y += scl) {
        const n = noise.noise(x * n_scl, y * n_scl);

        const t = (n + 1) / 2;
        const c = Math.floor(t * 255);

        ctx.fillStyle = `rgba(${c}, ${c}, ${c}, 0.01)`;
        ctx.fillRect(x, y, scl, scl);
      }
    }
  }

  _addTexture() {
    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.rotate(Math.floor(Math.random() * 4) * (Math.PI / 2));
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this.ctx.save();
    this.ctx.globalCompositeOperation = "lighter";
    this.ctx.drawImage(this._dark_texture, 0, 0);
    this.ctx.restore();

    this.ctx.restore();
  }

  _drawText(partition) {
    this.ctx.save();

    const title = "BRUTAL DESIGN";
    const subtitle = "soon next to you™";

    const title_height = Math.floor(partition.size / 10);
    const subtitle_height = Math.floor(title_height * 0.3);

    const replicas = Math.floor(Math.random() * 3 + 4);

    // draw title
    this.ctx.save();
    this.ctx.translate(partition.border * 4, partition.border * 4);

    this.ctx.fillStyle = this._palette.background;
    this.ctx.strokeStyle = this._palette.background;
    this.ctx.font = `bold ${title_height}px ${this._font}`;

    for (let i = 0; i < replicas; i++) {
      this.ctx.save();
      this.ctx.textAlign = "left";
      this.ctx.textBaseline = "top";
      this.ctx.translate(0, i * title_height * 0.25);
      this.ctx.rotate(partition.rotation);

      if (i == replicas - 1) this.ctx.fillText(title, partition.x, partition.y);
      else this.ctx.strokeText(title, partition.x, partition.y);

      this.ctx.restore();
    }

    this.ctx.restore();

    // draw subtitle
    this.ctx.save();
    this.ctx.fillStyle = this._palette.background;
    this.ctx.font = `bold ${subtitle_height}px ${this._font}`;
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "bottom";
    this.ctx.translate(
      partition.x + partition.size - partition.border * 4,
      partition.y + partition.size - partition.border * 4
    );
    this.ctx.rotate(partition.rotation);

    this.ctx.fillText(subtitle, 0, 0);
    this.ctx.restore();

    this.ctx.restore();
  }

  _setPageBackground(color) {
    document.body.style.backgroundColor = color;
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
