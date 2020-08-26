function Ketbit(x, y, angle, frame, head, game) {
  this.pos = new Vector(x, y);
  this.f = frame;
  this.expressions = [3,4,5,6];
  this.ex = 1;
  this.ext = 8;
  this.angle = angle;
  this.friends = [];
  this.body = [];
  this.blood = new Array(4).fill(random(0,1));

  if(head > 1) {
    this.f = this.expressions[this.ex];
    this.angle += head;
  }
  // game.ketbits.push(this);

  this.update = () => {
    if(this.ext) this.ext--;
    if(head > 1 && !this.ext) {
      this.ex = 0;
      this.f = this.expressions[this.ex];
    }

    if(head > 1 && Math.random() < 0.005) {
      this.ext = 3;
      if(Math.random() < 0.5) this.ext = 60;
      this.ex = 2;
      this.f = this.expressions[this.ex];
    }
  }

  this.fall = () => {
    this.pos.y += 1;
  }

  this.collided = () => {
    for (var gk of game.ketbits) if(gk.pos.equals(this.pos)) return true;
    return false;
  }

  this.draw = () => {

    if(head > 1) {
      let isDismembered = false;
      for (var b of this.body) if(b.dead) isDismembered = true;
      if(isDismembered) this.f = this.expressions[3];
    }

    palset([0,1,2,64,64]);
    spr(this.f, this.pos.x * 16, this.pos.y * 16, 1, 1, false, this.angle);

    let rots = [0,90,180,270];
    for (var i = 0; i < 4; i++) {
      if(this.friends[i] && this.friends[i].dead) {
        palset([4,64,64,64,64]);
        spr(7+this.blood[i], this.pos.x * 16, this.pos.y * 16, 1, 1, false, rots[i]);
      }
    }

    palset([64,64,64,3,0]);
    spr(this.f, this.pos.x * 16, this.pos.y * 16, 1, 1, false, this.angle);

    if(!DEBUG) return;
    put(this.pos.y, this.pos.x*16 + 2, this.pos.y*16, 63);
    put(this.pos.x, this.pos.x*16 + 2, this.pos.y*16 + 8, 63);
  }

  this.kill = () => {
    game.ketbits.splice(game.ketbits.indexOf(this), 1);
    // spawn falling block particle
    // add points
    // do something special if head
  }
}
