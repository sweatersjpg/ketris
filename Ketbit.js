function Ketbit(x, y, angle, frame, head, game) {
  this.pos = new Vector(x, y);
  this.f = frame;
  // game.ketbits.push(this);

  this.update = () => {

  }

  this.fall = () => {
    this.pos.y += 1;
  }

  this.collided = () => {
    for (var gk of game.ketbits) if(gk.pos.equals(this.pos)) return true;
    return false;
  }

  this.draw = () => {

    palset([0,1,2,3,64]);

    spr(frame, this.pos.x * 16, this.pos.y * 16, 1, 1, false, angle);

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
