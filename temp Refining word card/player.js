export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 5;
  }

  update(input) {
    if (input.isKeyDown("ArrowUp")) {
      this.y -= this.speed;
    }
    if (input.isKeyDown("ArrowDown")) {
      this.y += this.speed;
    }
    if (input.isKeyDown("ArrowLeft")) {
      this.x -= this.speed;
    }
    if (input.isKeyDown("ArrowRight")) {
      this.x += this.speed;
    }
  }

  render(ctx) {
    ctx.fillStyle = "blue";
    ctx.fillRect(this.x, this.y, 20, 20);
  }
}


