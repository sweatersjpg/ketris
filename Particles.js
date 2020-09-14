function Score(game) {
  this.score = 0;
  this.destScore = 0;

  this.draw = () => {
    let oldC = new Vector(camera.x, camera.y);
    setCamera(game.shake.x,game.shake.y);

    let makeWhite = false;
    if(round(this.score) < this.destScore) {
      this.score += (this.destScore-this.score)/2;
      makeWhite = true;
    }

    let x = (D.W/2)+6*16;
    let y = 26;

    if(makeWhite) {
      let v = round(this.score);
      put(v, x-1, y, 3);
      put(v, x, y-1, 3);
      put(v, x+1, y, 3);
      put(v, x, y+1, 3);
      put(v, x, y, 48);
    } else {
      put(round(this.score), x, y, 3);
    }

    setCamera(oldC.x, oldC.y);
  }

  this.add = (score) => {
    this.destScore += score * (game.level + 1);
    // console.log(score, this.destScore);
  }
}

function ScoreParticle(game, x, y, score) {
  game.particles.push(this);

  this.pos = new Vector(x, y);
  this.vel = new Vector(0, 0);
  this.dest = new Vector((D.W/2)+6*16, 26);
  this.a = radians(random(15, 30) * random([-1, 1]));

  this.draw = () => {

    let oldC = new Vector(camera.x, camera.y);
    setCamera(0,0);

    put(score, this.pos.x, this.pos.y, 16);

    let dir = this.dest.copy().sub(this.pos.copy());
    if(dir.mag() < 8) {
      this.kill();
      // new PopParticle(game, x, y); // to be made lol wait nvm I forgot abt the particle fn
      let frames = [100,100,101,101,102,102,103,103];
      new Particle(game, this.pos.x-4-oldC.x, this.pos.y-4-oldC.y, frames, [16,64,64,64,64]);
      game.score.add(score);
    }
    this.vel.set(dir.setMag(dir.mag()/6).rotate(dir.heading()+this.a));
    // if(degrees(this.a) > -1 && degrees(this.a) < 1) this.a = radians(degrees(this.a) - 1);
    this.pos.add(this.vel);

    setCamera(oldC.x, oldC.y);
  }

  this.kill = () => {
    game.particles.splice(game.particles.indexOf(this), 1);
  }
}

function HeadParticle(game, x, y, angle, pal) {
  game.particles.push(this);
  this.pos = new Vector(x, y);
  this.vel = new Vector(random(-2,2),random(-5,-8));
  this.angle = angle;
  this.avel = random([-5,5,-10,10]);
  this.draw = () => {
    this.vel.y += 0.5;
    this.pos.add(this.vel);
    this.angle += this.avel;

    lset(3);

    palset([pal[0],pal[1],pal[2],64,64]);
    spr(6, this.pos.x, this.pos.y, 1, 1, false, this.angle);

    palset([16, 64,64,64,64]);
    spr(7, this.pos.x, this.pos.y, 1, 1, false, this.angle+180);

    palset([64,64,64,63,64]);
    spr(6, this.pos.x, this.pos.y, 1, 1, false, this.angle);

    if(this.pos.y > 240) this.kill();
  }
  this.kill = () => {
    game.particles.splice(game.particles.indexOf(this), 1);
  }
}

function Animation(game, x, y, frames, pal, ...rest) {
  game.particles.push(this);
  this.t = 0;
  this.draw = () => {
    palset(pal);
    lset(0);
    spr(frames[this.t], x, y, ...rest);
    this.t++;
    if(this.t == frames.length) this.t = 0;
  }
  this.kill = () => {
    game.particles.splice(game.particles.indexOf(this), 1);
  }
}

function Dog(game, x, y, ...rest) {
  Animation.call(this, game, x, y, ...rest);
  this.timer = 0;

  this.dog = true;
  this.encourage = () => {
    this.timer = 30;
    new Bark(game, x-16, y);
  }
  this.defDraw = this.draw;
  this.draw = () => {
    this.defDraw();

    if(this.timer) {
      this.timer--;

      palset([0,1,2,3,64]);
      lset(0);
      spr(234, x-8, y+8, 2, 1);
    }
  }
}

function Bark(game, x, y) {
  game.particles.push(this);
  this.pos = new Vector(x,y);
  this.word = random([256, 258, 272, 274]);
  this.vel = new Vector(0, -1);

  this.draw = () => {

    let cycle = [0,0,1,1,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,1,1,0,0];
    let pal = [64,64,64,64,64];
    pal[3] = cycle[y - this.pos.y];

    palset(pal);

    spr(this.word, this.pos.x, this.pos.y, 2, 1);

    this.pos.add(this.vel);
    if(y-this.pos.y >= cycle.length) this.kill();
  }

  this.kill = () => {
    game.particles.splice(game.particles.indexOf(this), 1);
  }
}

function Murderer(game) {
  game.particles.push(this);
  this.pos = new Vector((D.W/2)-16, -32);
  this.vel = new Vector(0,0);
  this.hasKilled = false;

  this.draw = () => {

    this.vel.add(0,1);
    this.pos.add(this.vel);

    if(this.pos.y > 120-16) {
      this.pos.y = 120-16;
      this.vel.y = 0;
      if(!this.hasKilled) {
        game.addShake(5);
        this.hasKilled = true;
        game.particles[0].kill();
        // for (let i = 0; i < 3; i++)
        // new Blood(game, (D.W/2), 120+20);
      }
    }

    lset(1);
    palset([0,1,2,3,64]);
    spr(26, this.pos.x, this.pos.y, 2, 2, false, 180);

    if(this.hasKilled) {
      palset([16,64,64,64,64]);
      spr(160, (D.W/2)-32, 120, 4, 2);
    }

  }

  this.kill = () => {
    game.particles.splice(game.particles.indexOf(this), 1);
  }
}

function Blood(game, x, y) {
  game.particles.push(this);
  this.pos = new Vector(x, y);
  this.vel = new Vector(random(-5,5),random(-5,-12));
  this.size = random([4,2]);

  if(random() < 0.75) new Blood(game, x, y);
  // setTimeout(() => {new Blood(game, x, y)}, 0);

  this.draw = () => {
    this.vel.add(0,1);
    this.pos.add(this.vel);

    lset(0);

    palset([16,64,64,64,64]);
    spr(0, this.pos.x, this.pos.y, 1, 1, false, floor(degrees(this.vel.heading())), this.size*2, this.size);

    if(this.pos.y > 240) this.kill();
  }
  this.kill = () => {
    game.particles.splice(game.particles.indexOf(this), 1);
  }
}

function TitleParticle(game) {
  game.particles.push(this);

  this.pos = new Vector((D.W/2)-14, -80);
  this.vel = new Vector();
  this.timer = 0;

  this.falling = false;

  this.kill = () => {
    game.particles.splice(game.particles.indexOf(this), 1);
  }

  this.draw = () => {
    let oldC = new Vector(camera.x, camera.y);
    this.vel.add(0,0.5);
    this.pos.add(this.vel);

    if(this.timer) this.timer--;

    if(!this.falling) {
      let y = 120-34;
      if(this.pos.y > y) {
        this.pos.y = y;
        if(ceil(this.vel.y) >= 12) {
          game.addShake(4);
          this.timer = 30;
        }
        else if(ceil(this.vel.y) >= 4) game.addShake(2, true);
        this.vel.y *= -0.40;
      }
    } else if(this.pos.y > 240) this.kill();

    setCamera(game.shake.y, game.shake.y);

    lset(2);
    palset([0,1,2,3,64]);
    spr(48, this.pos.x, this.pos.y, 2, 5, false, -90+ round(this.vel.y)*2);

    if(!this.end && this.timer == 1) {
      this.end = true;
      this.timer = 30;
    }
    if(this.end && this.timer == 1) {
      this.killKetron();
      if(game.draw !== game.gameLoop) {
        new Blood(game, (D.W/2), 120);
        new Blood(game, (D.W/2), 120);
        new Blood(game, (D.W/2), 120);
        new Blood(game, (D.W/2), 120);
        new HeadParticle(game, (D.W/2), 120-16, 0, [0,1,2]);
      }
    }

    if(this.end && this.timer && frameCount%2) {
      lset(2);
      palset([16,16,16,16,64]);
      spr(48, this.pos.x, this.pos.y, 2, 5, false, -90+ round(this.vel.y)*2);
    }
    if(this.end && !this.timer) {
      lset(2);
      palset([16,64,64,64,64]);
      spr(50, this.pos.x, this.pos.y, 2, 5, false, -90+ round(this.vel.y)*2);

      // put("OUT NOW", 200 - 4*7, 120+24, 63);
    }
    setCamera(oldC.x, oldC.y);
  }

  this.killKetron = () => {
    if(this.falling) return;
    for (var p of game.particles) if(p.hasOwnProperty('hasKilled')) p.kill();
    cls(16);
    game.addShake(5);
  }
}

function GameOverParticle(game) {
  game.particles.push(this);

  this.pos = new Vector(40, -48);
  this.vel = new Vector();

  this.falling = false;

  this.kill = () => {
    game.particles.splice(game.particles.indexOf(this), 1);
  }

  this.draw = () => {
    this.vel.add(0,0.5);
    this.pos.add(this.vel);

    let y = 96;
    if(!this.falling) {
      if(this.pos.y > y) {
        this.pos.y = y;
        if(ceil(this.vel.y) >= 12) game.addShake(4);
        else if(ceil(this.vel.y) >= 4) game.addShake(2, true);
        this.vel.y *= -0.40;
      }
    } else if(this.pos.y > 240) this.kill();

    if(abs(this.pos.y - y) < 2 && abs(this.vel.y) < 0.2 && !this.timer) {
      this.timer = 8;
      new Blood(game, 4*16, y+24);
      new Blood(game, 5*16, y+24);
      new Blood(game, 6*16, y+24);
    }
    if(this.timer > 1) this.timer --;

    lset(1);
    palset([0,1,2,3,64]);
    spr(154, this.pos.x, this.pos.y, 5, 3, false, round(this.vel.y)*2);

    if(this.timer && !this.falling) {
      palset([16,64,64,64,64]);
      if(this.timer > 1 && frameCount%2) return;
      spr(52, this.pos.x, this.pos.y, 5, 1, false, round(this.vel.y)*2);
      spr(104, this.pos.x, this.pos.y+16, 5, 1, false, round(this.vel.y)*2);
      spr(149, this.pos.x, this.pos.y+32, 5, 1, false, round(this.vel.y)*2);
    }

    // put(round(this.vel.y), 0.1, 0.1);
  }
}

function Particle(game, x, y, frames, pal, ...rest) {
  game.particles.push(this);
  this.life = 0;
  this.draw = () => {
    palset(pal);
    lset(1);
    spr(frames[this.life], x, y, ...rest);
    this.life++;
    if(this.life == frames.length) this.kill();
  }
  this.kill = () => {
    game.particles.splice(game.particles.indexOf(this), 1);
  }
}
