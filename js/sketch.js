import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Partition } from "./partition.js";

class Sketch extends Engine {
  preload() {
    this._createTexture();
  }

  setup() {
    this._background = "#2be831";
    this._foreground = "#1b1301";
    this._scl = 0.95;
    this._font = "VioletSans";

    this._partition = new Partition(0, 0, this.width, 1);
    this._partition.setColors(this._background, this._foreground);
    this._partition.split();
  }

  draw() {
    this.ctx.save();
    this.background(this._background);
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
    // load the texture from file
    this._texture = new Image();
    this._texture.src = "assets/texture.jpg";
  }

  _addTexture() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "darker";
    this.ctx.filter = "invert(1)";
    this.ctx.globalAlpha = 0.25;
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.rotate(Math.floor(Math.random() * 4) * (Math.PI / 2));
    this.ctx.drawImage(this._texture, 0, 0, this.width, this.height);

    this.ctx.restore();
  }

  _drawText(biggest) {
    this.ctx.save();

    const height = Math.floor(biggest.size / 10);

    this.ctx.fillStyle = this._background;
    this.ctx.font = `bold ${height}px ${this._font}`;
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";

    const text = "GRAPHIC DESIGN";

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
