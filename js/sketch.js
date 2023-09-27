import { Engine } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Partition } from "./partition.js";
import { PaletteFactory } from "./palette.js";

class Sketch extends Engine {
  setup() {
    const timestamp = new Date().getTime();
    this._random = new XOR128(timestamp);
    this._createTexture();

    this._palette = PaletteFactory.randomPalette(this._random);
    this._scl = 0.95;
    this._font = "VioletSans";

    this._partition = new Partition(0, 0, this.width, this._random);
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

    const theta = this._random.random_int(4) * (Math.PI / 2);
    this.ctx.rotate(theta);

    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);
    this._partition.show(this.ctx);
    const biggest = this._partition.biggestEmptyChild();
    this._drawText(biggest);
    this.ctx.restore();

    this._drawTexture();

    this.noLoop();
  }

  _createTexture() {
    this._dark_texture = document.createElement("canvas");
    this._dark_texture.width = this.width;
    this._dark_texture.height = this.height;

    const ctx = this._dark_texture.getContext("2d");

    const scl = 3;

    // draw background
    for (let x = 0; x < this.width; x += scl) {
      for (let y = 0; y < this.height; y += scl) {
        const c = this._random.random_int(127);
        ctx.fillStyle = `rgba(${c}, ${c}, ${c}, 0.1)`;
        ctx.fillRect(x, y, scl, scl);
      }
    }
  }

  _drawTexture() {
    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);

    const theta = this._random.random_int(4) * (Math.PI / 2);
    this.ctx.rotate(theta);

    this.ctx.translate(-this.width / 2, -this.height / 2);

    this.ctx.save();
    this.ctx.globalCompositeOperation = "darken";
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

    const replicas = this._random.random_int(3, 7);

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
      partition.x + partition.size - partition.border * 2,
      partition.y + partition.size - partition.border * 2
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

  keyPress(_, c) {
    if (c == 13) {
      const timestamp = new Date().getTime();
      const filename = `brutal-design-${timestamp}.png`;
      this.saveFrame(filename);
    }
  }
}

export { Sketch };
