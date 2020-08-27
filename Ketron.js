function Ketron(I, game) {
  this.type = I;
  this.index = ketronIndex.indexOf(I);
  this.name = ketronNames[this.index];
  this.spr = ketronSpr[this.index];
  this.matrix = Object.assign([], ketrons[this.index]);
  this.time = game.speed/2;
  this.keytime = {
    'left':0,
    'right':0
  };

  this.pos = new Vector(5-floor(this.matrix.length/2),-1);

  this.angle = 0;

  this.ketbits = [];

  this.update = () => { // this is in charge of falling
    this.time--;

    if(btn('left') && !pbtn('left')) {
      this.keytime['left'] = 8;
      this.pos.x -= 1;
      this.makeBits();
      if(this.collided()) {
        this.pos.x += 1;
        this.makeBits();
      }
    }
    if(btn('right') && !pbtn('right')) {
      this.keytime['right'] = 8;
      this.pos.x += 1;
      this.makeBits();
      if(this.collided()) {
        this.pos.x -= 1;
        this.makeBits();
      }
    }
    if(btn('left')) {
      if(this.keytime['left']<=0) {
        this.keytime['left'] = 1;
        this.pos.x -= 1;
        this.makeBits();
        if(this.collided()) {
          this.pos.x += 1;
          this.makeBits();
        }
      } else this.keytime['left']--;
    }
    if(btn('right')) {
      if(this.keytime['right']<=0) {
        this.keytime['right'] = 1;
        this.pos.x += 1;
        this.makeBits();
        if(this.collided()) {
          this.pos.x -= 1;
          this.makeBits();
        }
      } else this.keytime['right']--;
    }

    if(btn('up') && !pbtn('up')) {
      this.rotate('right');
    }
    if(btn('down') && this.time > 1) {
      // this.rotate('right');
      this.time = 1;
    }

    if(this.time <= 0) {
      this.time = game.speed;
      this.pos.y += 1;
      this.makeBits();
      if(this.landed()) {
        this.pos.y -= 1;
        this.makeBits();
        for (var k of this.ketbits) if(k) {
          k.friends = [];
          function findFriend(xof, yof, ketron) {
            let ki = ketron.ketbits.indexOf(k);
            let pos = new Vector(floor(ki%ketron.matrix.length),floor(ki/ketron.matrix.length));
            let i = (pos.x + xof)+(pos.y+yof)*ketron.matrix.length;
            if(i >= 0 && i < ketron.ketbits.length) return ketron.ketbits[i];
            return false;
          }
          k.friends[0] = findFriend(0,-1, this);
          k.friends[1] = findFriend(1,0, this);
          k.friends[2] = findFriend(0,1, this);
          k.friends[3] = findFriend(-1,0, this);
          k.body = Object.assign([], this.ketbits);

          game.ketbits.push(k);
        }
        this.dead = true;
        return;
      }
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
      let moveLeft = false, moveRight = false, moveUp;
      for (var k of this.ketbits) if(k) {
        if(k.pos.x < 0) moveRight = true;
        if(k.pos.x >= 10) moveLeft = true;
        if(k.pos.y >= 15) moveUp = true;
      }
      if(moveLeft) this.pos.x -= 1;
      if(moveRight) this.pos.x += 1;
      if(moveUp) this.pos.y -= 1;
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
          new Ketbit(x+this.pos.x, y+this.pos.y, this.angle*90, frame, this.matrix[y][x], I, game)
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
    for (var k of this.ketbits) if(k) k.update();
    for (var k of this.ketbits) if(k) k.draw();
  }
}
