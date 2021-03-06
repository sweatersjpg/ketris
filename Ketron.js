const keyDelay = 4;
const keyRepeat = 1;

function Ketron(I, game) {
  this.type = I;
  this.index = ketronIndex.indexOf(I);
  this.name = ketronNames[this.index];
  this.spr = ketronSpr[this.index];
  this.matrix = Object.assign([], ketrons[this.index]);
  this.time = game.speed/2;
  this.keytime = {
    'left':0,
    'right':0,
    'down':0
  };

  this.landTimer = 0;

  this.pos = new Vector(5-floor(this.matrix.length/2),-1);

  this.angle = 0;

  this.ketbits = [];

  this.drawGhost = () => {
    let count = 0;
    while(!this.landed()) {
      for (var k of this.ketbits) if(k) k.pos.y++;
      count++;
    }
    this.makeBits();

    palset([64,64,64,8,64]);
    let pos = new Vector(this.pos.x, this.pos.y+count).mult(16);
    spr(this.spr+11*16, pos.x, pos.y, this.matrix.length, this.matrix.length, false, this.angle*90);

  }

  this.update = () => { // this is in charge of falling
    this.time--;
    this.makeCount = 0;

    if(this.landTimer) this.landTimer--;
    if(this.landTimer) this.time = 0;

    if(this.time <= 0) {
      let speed = game.speed - game.level;
      if(speed < 0) speed = 0;
      this.time = speed;
      if(!this.landTimer) {
        this.pos.y += 1;
        this.makeBits();
        if(this.collided()) {
          this.pos.y -= 1;
          this.makeBits();
        }
      }
      if(!this.landed()) this.landTimer = 0;
      if(!this.landTimer && this.landed()) {
        this.landTimer = 11;
        if(btn('down')) game.addShake();
      } else if(this.landTimer == 1) {
        // this.pos.y -= 1;
        // this.makeBits();
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
    this.makeBits();

    if(btn('left') && !pbtn('left')) {
      this.keytime['left'] = keyDelay;
      this.pos.x -= 1;
      this.makeBits();
      if(this.collided()) {
        this.pos.x += 1;
        this.makeBits();
      }
    }
    if(btn('right') && !pbtn('right')) {
      this.keytime['right'] = keyDelay;
      this.pos.x += 1;
      this.makeBits();
      if(this.collided()) {
        this.pos.x -= 1;
        this.makeBits();
      }
    }
    if(btn('left')) {
      if(this.keytime['left']<=0) {
        this.keytime['left'] = keyRepeat;
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
        this.keytime['right'] = keyRepeat;
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

    if(btn('down') && !pbtn('down')) {
      this.keytime['down'] = keyDelay;
      this.time = 0;
    }
    if(btn('down')) {
      if(this.keytime['down']==1) {
        this.keytime['down'] = keyRepeat;
        this.time = 0;
      } else this.keytime['down']--;
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
      if(k.pos.y+1 >= 15) return true;
      for (var gk of game.ketbits)  {
        if(k.pos.x == gk.pos.x && k.pos.y+1 == gk.pos.y) return true;
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
    if(this.makeCount == 0 && this.ketbits.length && btn('down')) {
      for (var k of this.ketbits) if(k) {
        let frames = [9,9,10,10,11,11,12,12];
        let col = k.pal[0];
        if(col == 0) col = 8;
        new Particle(game, k.pos.x*16, k.pos.y*16, frames, [col,64,64,64,64], 1, 1, false, random([0,90,180,270]));
      }
    }
    this.makeCount++;
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
      if(k.pos.equals(gk.pos)) {
        game.gameOver();
        return;
      }
    }
  }

  this.draw = () => {
    if(game.next != this && game.held != this) this.drawGhost();
    for (var k of this.ketbits) if(k) k.update();
    if(this.landTimer) {
      // for (var k of this.ketbits) if(k) k.draw();
      if (frameCount % 2 == 0) {
        for (var k of this.ketbits) if(k) k.draw(true);
      }
      else for (var k of this.ketbits) if(k) k.draw();
    } else for (var k of this.ketbits) if(k) k.draw();
  }
}
