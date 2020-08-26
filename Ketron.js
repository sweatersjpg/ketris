function Ketron(I, game) {
  this.type = I;
  this.index = ketronIndex.indexOf(I);
  this.name = ketronNames[this.index];
  this.spr = ketronSpr[this.index];
  this.matrix = Object.assign([], ketrons[this.index]);
  this.time = game.speed/2;

  this.pos = new Vector(5-floor(this.matrix.length/2),-2);

  this.angle = 0;

  this.ketbits = [];

  this.update = () => { // this is in charge of falling
    this.time--;
    if(this.time <= 0) {
      this.time = game.speed;
      this.pos.y += 1;
      this.makeBits();
      if(this.landed()) {
        this.pos.y -= 1;
        this.makeBits();
        for (var k of this.ketbits) if(k) {
          game.ketbits.push(k);
        }
        this.dead = true;
        return;
        // push all ketbits to game.ketbits
        // mark this ketron as dead
      }
    }

    if(btn('left') && !pbtn('left')) {
      this.pos.x -= 1;
      this.makeBits();
      if(this.collided()) {
        this.pos.x += 1;
        this.makeBits();
      }
    }
    if(btn('right') && !pbtn('right')) {
      this.pos.x += 1;
      this.makeBits();
      if(this.collided()) {
        this.pos.x -= 1;
        this.makeBits();
      }
    }
    if(btn('up') && !pbtn('up')) {
      this.rotate('right');
    }
    if(btn('down') && this.time > 2) {
      // this.rotate('right');
      this.time = 2;
    }
  }

  this.collided = () => {
    for (var k of this.ketbits) if(k) {
      if(k.pos.x < 0 || k.pos.x >= 10) return true;
      for (var gk of game.ketbits)  {
        if(k.pos.x == gk.pos.x && k.pos.y == gk.pos.y) return true;
      }
    }
  }

  this.landed = () => {
    for (var k of this.ketbits) if(k) {
      if(k.pos.y >= 15) return true;
      for (var gk of game.ketbits)  {
        if(k.pos.x == gk.pos.x && k.pos.y == gk.pos.y) return true;
      }
    }
    return false;
  }

  this.rotate = (dir, recursion) => {
    let oldMat = Object.assign([], this.matrix);
    let oldBits = Object.assign([], this.ketbits);
    let oldPos = this.pos.copy();
    let oldA = this.angle;
    if(dir == 'right') this.matrix = this.matrix[0].map((v, i) => this.matrix.map(row => row[i]).reverse());
    else if(dir == 'left') for (var i = 0; i < 3; i++) // do above but three times lol
    this.matrix = this.matrix[0].map((v, i) => this.matrix.map(row => row[i]).reverse());

    if(dir == 'right') this.angle += 1;
    if(dir == 'left') this.angle -= 1;

    this.makeBits();

    for (var i = 0; i < 2; i++) {
      let moveLeft = false, moveRight = false;
      for (var k of this.ketbits) if(k) {
        if(k.pos.x < 0) moveRight = true;
        if(k.pos.x >= 10) moveLeft = true;
      }
      if(moveLeft) this.pos.x -= 1;
      if(moveRight) this.pos.x += 1;
      this.makeBits();

      for (var y = 0; y < this.matrix.length; y++) {
        let leftk = this.ketbits[0+y*this.matrix.length];
        let rightk = this.ketbits[this.matrix.length-1+y*this.matrix.length];
        let bottom = this.ketbits[y+(this.matrix.length-1)*this.matrix.length];

        if(leftk && leftk.collided()) {
          this.pos.x += 1;
          this.makeBits();
        }
        if(rightk && rightk.collided()) {
          this.pos.x -= 1;
          this.makeBits();
        }
        if(bottom && bottom.collided()) {
          this.pos.y -= 1;
          this.makeBits();
        }
      }
    }

    if(this.collided()) {
      this.rotate(dir);
      // this.matrix = oldMat;
      // this.pos.set(oldPos);
      // this.angle = oldA;
      // this.ketbits = oldBits;
    }


  }

  this.makeBits = () => {
    this.ketbits = [];
    let frames = [];
    for (var y = 0; y < this.matrix.length; y++) {
      frames[y] = [];
      for (var x = 0; x < this.matrix[y].length; x++) {
        frames[y][x] = this.spr+x+16*y;
      }
    }
    if(this.angle > 0) for(var m = 0; m < this.angle; m++)
    frames = frames[0].map((v, i) => frames.map(row => row[i]).reverse());

    if(this.angle < 0) for(var m = 0; m > this.angle; m--) for (var j = 0; j < 3; j++)
    frames = frames[0].map((v, i) => frames.map(row => row[i]).reverse());

    for (var y = 0; y < this.matrix.length; y++) {
      for (var x = 0; x < this.matrix[y].length; x++) {
        let frame = frames[y][x];
        if(this.matrix[y][x])
        this.ketbits.push(
          new Ketbit(x+this.pos.x, y+this.pos.y, this.angle*90, frame, this.matrix[y][x] == 2, game)
        );
        else this.ketbits.push(false);
      }
    }
  }
  this.makeBits();

  for (var k of this.ketbits) if(k) {
    for (var gk of game.ketbits) {
      if(k.pos.equals(gk.pos)) game.gameOver();
    }
  }

  this.draw = () => {
    for (var k of this.ketbits) if(k) k.draw();
  }
}