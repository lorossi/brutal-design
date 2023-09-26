class Partition {
  constructor(x, y, size, probability, level = 0) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._probability = probability;
    this._level = level;

    this._triangle_probability = 1 - probability;
    this._children = [];
    this._border = 8;
    this._rotation = ((Math.random() * 2 - 1) * Math.PI) / 360;
    this._cols = 2;
  }

  setColors(background, foreground) {
    this._background = background;
    this._foreground = foreground;
  }

  split() {
    this._children = [];

    if (this._size < 4 * this._border) return;
    if (Math.random() ** 2 > this._probability) return;

    const n_size = this._size / this._cols;

    // leave one empty if level is 0
    const empty = Math.floor(Math.random() * this._cols ** 2);

    for (let i = 0; i < this._cols * this._cols; i++) {
      const x = this._x + (i % this._cols) * n_size;
      const y = this._y + Math.floor(i / this._cols) * n_size;

      let probability;
      if (this._level == 0) {
        if (i == empty) probability = 0;
        else probability = 1;
      } else probability = this._probability * 0.5;

      const p = new Partition(
        x,
        y,
        this._size / 2,
        probability,
        this._level + 1
      );

      p.setColors(this._background, this._foreground);
      p.split();
      this._children.push(p);
    }
  }

  _draw(ctx) {
    ctx.save();

    // draw the dark background
    ctx.fillStyle = this._foreground;
    ctx.strokeStyle = this._background;
    ctx.lineWidth = this._border;

    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.rotate(this._rotation);

    // random chance of being half filled if empty
    if (
      this._children.length == 0 &&
      Math.random() > this._triangle_probability
    ) {
      ctx.beginPath();
      ctx.rotate(Math.floor(Math.random() * 4) * (Math.PI / 2));

      ctx.beginPath();
      ctx.moveTo(-this._size / 2, -this._size / 2);
      ctx.lineTo(this._size / 2, -this._size / 2);
      ctx.lineTo(this._size / 2, this._size / 2);

      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.rect(-this._size / 2, -this._size / 2, this._size, this._size);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  show(ctx) {
    if (this._children.length > 0) this._children.forEach((c) => c.show(ctx));
    else this._draw(ctx);
  }

  biggestEmptyChild() {
    // non recursive function to find the biggest empty child of a partition
    if (this._children.length == 0) return this;

    let biggest = null;
    let biggest_size = 0;
    for (let i = 0; i < this._children.length; i++) {
      const child = this._children[i];
      if (child._children.length == 0 && child._size > biggest_size) {
        biggest = child;
        biggest_size = child._size;
      }
    }

    return biggest;
  }

  get size() {
    return this._size;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get border() {
    return this._border;
  }

  get rotation() {
    return this._rotation;
  }
}

export { Partition };
