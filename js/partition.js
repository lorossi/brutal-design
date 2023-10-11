class Partition {
  constructor(x, y, size, random, probability = 1) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._probability = probability; // probability of splitting
    this._random = random; // random number generator
    this._triangle_probability = 1 - probability; // probability of being a triangle

    this._level = 0; // current level of the partition
    this._children = []; // children partitions
    this._border = 8; // size of the border
    this._rotation = (this._random.random_interval(0, 1) * Math.PI) / 360; // rotation of the partition
    this._cols = 2; // number of columns of children partitions
  }

  setColors(background, foreground) {
    // setting colors in the constructor makes it too big
    this._background = background;
    this._foreground = foreground;
  }

  setLevel(level) {
    // set the level of the partition
    this._level = level;
  }

  split() {
    this._children = [];

    // if the size is too small, stop splitting
    if (this._size < 4 * this._border) return;
    // if the probability is too small, stop splitting
    if (this._random.random() ** 2 > this._probability) return;

    // size of the children partitions
    const n_size = this._size / this._cols;

    // leave one empty if level is 0
    const empty = this._random.random_int(this._cols * this._cols);

    for (let i = 0; i < this._cols * this._cols; i++) {
      // 1d to 2d index
      const x = this._x + (i % this._cols) * n_size;
      const y = this._y + Math.floor(i / this._cols) * n_size;

      let probability;
      // compute the probability of the child partition
      if (this._level == 0) {
        if (i == empty) probability = 0;
        else probability = 1;
      } else probability = this._probability * 0.5;

      const p = new Partition(x, y, this._size / 2, this._random, probability);

      p.setColors(this._background, this._foreground);
      p.setLevel(this._level + 1);

      // recursively split the child partition
      p.split();
      // add the child partition to the list of children
      this._children.push(p);
    }
  }

  _draw(ctx) {
    ctx.save();

    // draw the dark background
    ctx.fillStyle = this._foreground;
    ctx.strokeStyle = this._background;
    ctx.lineWidth = this._border;

    // translate to the center of the partition
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.rotate(this._rotation);

    if (
      this._children.length == 0 &&
      this._random.random() > this._triangle_probability
    ) {
      // if the partition has no children and the probability is high enough, draw as a triangle
      ctx.beginPath();

      const theta = this._random.random_int(4) * (Math.PI / 2);
      ctx.rotate(theta);

      ctx.beginPath();
      ctx.moveTo(-this._size / 2, -this._size / 2);
      ctx.lineTo(this._size / 2, -this._size / 2);
      ctx.lineTo(this._size / 2, this._size / 2);

      ctx.fill();
      ctx.stroke();
    } else {
      // draw as a rectangle
      ctx.beginPath();
      ctx.rect(-this._size / 2, -this._size / 2, this._size, this._size);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  show(ctx) {
    // if the partition has children, show them
    // otherwise, draw the partition
    if (this._children.length > 0) this._children.forEach((c) => c.show(ctx));
    else this._draw(ctx);

    // this allows to call draw only on the first partition, and all the children will be drawn recursively
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
