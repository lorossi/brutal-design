import { Engine, SimplexNoise } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Partition } from "./partition.js";
import { PaletteFactory } from "./palette.js";

class Sketch extends Engine {
  preload() {
    this._scl = 0.95; // size of the image in the canvas
    this._noise_scl = 0.0025; // noise scale for the background texture
    this._texture_scl = 4; // size of the background texture
    this._font = "VioletSans"; // font used for the text
  }

  setup() {
    this._timestamp = new Date().getTime();
    // initialize random number generator and noise
    this._random = new XOR128(this._timestamp);
    this._noise = new SimplexNoise(this._timestamp);
    this._noise.setDetail(3, 0.75);
    // select a random palette
    this._palette = PaletteFactory.randomPalette(this._random);
    // create the partition
    this._partition = new Partition(0, 0, this.width, this._random);
    this._partition.setColors(
      this._palette.background,
      this._palette.foreground
    );
    // start partitioning, automatically stops when the partition is too small
    this._partition.split();
  }

  draw() {
    this.noLoop();

    this.ctx.save();
    this.background(this._palette.background);
    // set the page (body) background color
    this._setPageBackground(this._palette.background);

    this.ctx.translate(this.width / 2, this.height / 2);

    // random rotation
    const theta = this._random.random_int(4) * (Math.PI / 2);
    this.ctx.rotate(theta);

    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);
    // draw the top partition, all other partitions are drawn recursively
    this._partition.show(this.ctx);
    // draw the text on the biggest empty child
    const biggest = this._partition.biggestEmptyChild();
    this._drawText(biggest);
    this.ctx.restore();
    // draw the background texture
    this._drawTexture();
  }

  _drawTexture() {
    // draw a noise texture on top of the canvas
    this.ctx.save();
    // random rotation
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.rotate(this._random.random_int(4) * (Math.PI / 2));
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this.ctx.globalCompositeOperation = "multiply";

    for (let x = 0; x < this.width; x += this._texture_scl) {
      for (let y = 0; y < this.height; y += this._texture_scl) {
        const n = this._noise.noise(x * this._noise_scl, y * this._noise_scl);
        const ch = this._polyEaseInOut((n + 1) / 2, 2) * 255;
        this.ctx.fillStyle = `rgba(${ch}, ${ch}, ${ch}, 0.25)`;
        this.ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }

    this.ctx.restore();
  }

  _drawText(partition) {
    this.ctx.save();

    const title = "BRUTAL DESIGN";
    const subtitle = "soon next to you™";

    const title_height = Math.floor(partition.size / 10);
    const subtitle_height = Math.floor(title_height * 0.3);

    const replicas = this._random.random_int(4, 8);

    // draw title
    this.ctx.save();
    this.ctx.translate(partition.border * 4, partition.border * 4);

    // setup the text style
    this.ctx.fillStyle = this._palette.background;
    this.ctx.strokeStyle = this._palette.background;
    this.ctx.font = `bold ${title_height}px ${this._font}`;

    // make a few replicas of the title
    for (let i = 0; i < replicas; i++) {
      this.ctx.save();
      this.ctx.textAlign = "left";
      this.ctx.textBaseline = "top";
      this.ctx.translate(0, i * title_height * 0.25);
      this.ctx.rotate(partition.rotation);

      // the first replica is filled, the others are stroked
      if (i == replicas - 1) this.ctx.fillText(title, partition.x, partition.y);
      else this.ctx.strokeText(title, partition.x, partition.y);

      this.ctx.restore();
    }

    this.ctx.restore();

    this.ctx.save();
    // setup the text style
    this.ctx.fillStyle = this._palette.background;
    this.ctx.font = `bold ${subtitle_height}px ${this._font}`;
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "bottom";
    // draw subtitle
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

  _polyEaseInOut(x, n = 3) {
    // polynomial ease in out
    if (x < 0.5) return Math.pow(x * 2, n) / 2;
    return 1 - Math.pow(2 - x * 2, n) / 2;
  }

  click() {
    // on click, create a new canvas
    this.setup();
    this.draw();
  }

  keyPress(_, c) {
    // on enter, save the current canvas
    switch (c) {
      case 13: // enter
        const filename = `brutal-design-${this._timestamp}.png`;
        this.saveFrame(filename);
        break;
      default:
        break;
    }
  }
}

export { Sketch };
