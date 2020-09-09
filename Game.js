// Co-op game
// sweatersjpg

let DEBUG = false;

function init_() {
  setSpriteSheet("spriteSheet");
  setNumberOfLayers(6);
  lset(1);

  pause_Button_.paused = false;
  drawFN = new Game();

  disableScroll();
}

let ketronIndex = ["I","J","L","O","S","T","Z"];
let ketronNames = [
  "Itsy","Jenny","Lenny","Olly","Steppy","cursed","Zippy"
]
let ketronSpr = [16,20,23,26,28,68,71];
let ketrons = [
  [
    [0,0,0,0],
    [1,1,1,90],
    [0,0,0,0],
    [0,0,0,0]
  ],[
    [360,0,0],
    [1,1,1],
    [0,0,0]
  ],[
    [0,0,1],
    [270,1,1],
    [0,0,0]
  ],[
    [1,1],
    [180,1]
  ],[
    [0,1,90],
    [1,1,0],
    [0,0,0]
  ],[
    [0,360,0],
    [1,1,90],
    [0,0,0]
  ],[
    [1,1,0],
    [0,1,90],
    [0,0,0]
  ]
]

// ------- main loops -------

function Game(level) {
  this.speed = 30;
  this.level = 0;
  this.score = 0;
  this.rowsCleared = 0;

  this.ketbits = [];
  this.particles = [];
  this.ketron = new Ketron(random(ketronIndex), this);
  this.next = new Ketron(random(ketronIndex), this);
  this.background = 48;
  this.held = false;

  this.shake = new Vector(0,0);

  this.drawUI = () => {
    setCamera(200-5*16+this.shake.x, this.shake.y);

    for (var i = 0; i < 15; i++) {
      palset([63,64,64,64,64]);
      spr(1, -16, i*16);
      spr(1, 10*16, i*16, 1, 1, true);
    }

    setCamera(0,0);
    // put(this.shake.mag());

    setCamera(this.shake.x,this.shake.y);

    // put(sprImg.length);

    palset([64,64,64,63,64]);
    spr(58, 16+8, 8, 5, 3);
    put("NEXT", 35, 49, 63);

    spr(58, 16+8, 48+8, 5, 3);
    put("HOLD", 35, 97, 63);

    setCamera(200+6*16+this.shake.x, this.shake.y + 16);
    put("-SCORE-", 0.1, 0.1);
    put(this.score, 0.1, 10);
    put("-LINES-", 0.1, 22);
    put(this.rowsCleared, 0.1, 32);
  }

  this.addShake = (amp, smaller) => {
    let a = amp || 2;
    if(this.shake.mag() >= 1) this.shake.setMag(this.shake.mag()+a);
    else this.shake.set(a > 3 || smaller ? a : 3,0).rotate(radians(random([0, 120, 240])));
  }

  this.gameLoop = () => {
    if(btn('b') && !pbtn('b')) this.gameOver();

    cls(this.background);
    // for (var i = 0; i < floor(random(1,4)); i++) ketronNames[5] = changeStringRandom(ketronNames[5]);

    if(this.shake.mag() >= 1) {
      this.shake.rotate(this.shake.heading()+TWO_PI/3);
      this.shake.setMag(this.shake.mag()-1);
    }

    this.drawUI();

    if("O".includes(this.next.type)) setCamera(-16, 32);
    if("SZJLT".includes(this.next.type)) setCamera(-24, 32);
    if("I".includes(this.next.type)) setCamera(-16, 24);
    if(this.next) this.next.draw();

    if(this.held) {
      if("O".includes(this.held.type)) setCamera(-16, 32+48);
      if("SZJLT".includes(this.held.type)) setCamera(-24, 32+48);
      if("I".includes(this.held.type)) setCamera(-16, 24+48);
      this.held.draw();
    }

    setCamera(200-5*16 + this.shake.x, 0 + this.shake.y);

    if(btn('a') && !pbtn('a') && this.heldHistory != this.ketron) {
      let held = this.held;
      this.held = new Ketron(this.ketron.type, this);
      this.heldHistory = held;
      if(held) this.ketron = held;
      else this.ketron.dead = true;
    }

    if(this.ketron) this.ketron.update(); // in charge of peices falling!!!!
    if(this.ketron.dead) {
      this.ketron = this.next;
      this.next = new Ketron(random(ketronIndex), this);
      if(this.next.type == this.ketron.type) new Ketron(random(ketronIndex), this);
    }
    if(this.ketron) this.ketron.draw();

    for (var k of this.ketbits) k.update(); // not in charge of falling!!!!
    for (var k of this.ketbits) k.draw();
    for (var i = this.particles.length-1; i >= 0; i--) this.particles[i].draw();

    let rowCount = new Array(15).fill(0);
    for (var k of this.ketbits) {
      for (var i = 0; i < rowCount.length; i++) if(k.pos.y == i) rowCount[i] += 1;
    }

    let rows = 0;
    for (var i = 0; i < rowCount.length; i++) if(rowCount[i] >= 10) {
      rows++;
      this.addShake(4);
    }

    let heads = 0;
    for (var k of this.ketbits) {
      for (var i = 0; i < rowCount.length; i++) if(rowCount[i] >= 10) {
        if(k.pos.y < i) k.fall();
        else if(k.pos.y == i) {
          k.dead = true;
          if(k.head > 1) heads++;
        }
      }
    }

    this.updateScore(rows, heads);
    if(rows) for (var p of this.particles) if(p.dog) p.encourage(rows);

    for (var i = this.ketbits.length-1; i >= 0; i--) if(this.ketbits[i].dead) this.ketbits[i].kill();
  }
  // this.draw = this.gameLoop;

  this.updateScore = (rows, heads) => {
    let score = [0, 40, 100, 300, 1200];

    this.rowsCleared += rows;
    this.level = floor(this.rowsCleared/10);

    this.score += score[rows] * (this.level + 1);
  }

  this.start = () => {
    this.speed = 30;
    this.level = 0;
    this.score = 0;
    this.rowsCleared = 0;

    this.ketron = new Ketron(random(ketronIndex), this);
    this.next = new Ketron(random(ketronIndex), this);
    this.held = false;

    for (var p of this.particles) if(p.hasOwnProperty('falling')) p.falling = true;

    this.draw = this.gameLoop;
  }

  this.title = () => {
    this.titleStep = 0;
    this.anyKeyPressed = true;
    this.anyKey = false;
    this.message = "";
    this.particles = [];

    let frames = [250,250,252,254,254];
    let pal = [0,1,2,3,64];
    new Dog(this, 200-16, 120-24, frames, pal, 2, 3, false, -90);

    this.draw = () => {
      cls(this.background);

      if(this.shake.mag() >= 0.01) {
        this.shake.rotate(this.shake.heading()+TWO_PI/3);
        this.shake.setMag(this.shake.mag()-1);
      }

      if(this.anyKey) {
        this.message += this.anyKey;

        if(this.titleStep == 0) {
          this.particles[0].encourage();
          new Murderer(this);
        } else if (this.titleStep == 1) {
          new TitleParticle(this);
        } else if(this.titleStep == 2) {
          for(var p of this.particles) if(p.hasOwnProperty('killKetron')) p.killKetron();
          this.start();
        }

        this.titleStep++;
      }

      setCamera(this.shake.x, this.shake.y);

      if(floor(frameCount/16)%2) put("PRESS ANY KEY", 200 - 13*4, 240-10);

      for (var i = this.particles.length-1; i >= 0; i--) this.particles[i].draw();
      this.anyKey = false;
    }
  }

  this.gameOver = () => {

    if(this.ketron) for (var k of this.ketron.ketbits) if(k) this.ketbits.push(k);

    this.ketron = false;
    new GameOverParticle(this);
    this.addShake(5);
    this.anyKeyPressed = true;
    this.anyKey = false;

    this.draw = () => {
      cls(this.background);

      if(this.shake.mag() >= 0.01) {
        this.shake.rotate(this.shake.heading()+TWO_PI/3);
        this.shake.setMag(this.shake.mag()-1);
      }

      setCamera(200-5*16+this.shake.x, this.shake.y);
      for (var k of this.ketbits) k.draw();

      for (var i = this.ketbits.length-1; i >= 0; i--) this.ketbits[i].kill();

      for (var i = this.particles.length-1; i >= 0; i--) this.particles[i].draw();

      if(this.anyKey) this.start();

      this.drawUI();
      this.anyKey = false;
    }
  }

  this.keydown = (e) => {
    if(!this.anyKeyPressed) {
      this.anyKey = e.key;
      this.anyKeyPressed = true;
    }
  }

  this.keyup = () => {
    this.anyKeyPressed = false;
  }

  this.title();

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
  this.pos = new Vector(200-16, -32);
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
        // new Blood(game, 200, 120+20);
      }
    }

    lset(1);
    palset([0,1,2,3,64]);
    spr(26, this.pos.x, this.pos.y, 2, 2, false, 180);

    if(this.hasKilled) {
      palset([16,64,64,64,64]);
      spr(160, 200-32, 120, 4, 2);
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

  this.pos = new Vector(200-14, -80);
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
        new Blood(game, 200, 120);
        new Blood(game, 200, 120);
        new Blood(game, 200, 120);
        new Blood(game, 200, 120);
        new HeadParticle(game, 200, 120-16, 0, [0,1,2]);
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

    if(!this.falling) {
      let y = 96;
      if(this.pos.y > y) {
        this.pos.y = y;
        if(ceil(this.vel.y) >= 12) game.addShake(4);
        else if(ceil(this.vel.y) >= 4) game.addShake(2, true);
        this.vel.y *= -0.40;
      }
    } else if(this.pos.y > 240) this.kill();

    lset(1);
    palset([0,64,64,63,64]);
    spr(154, this.pos.x, this.pos.y, 5, 3, false, round(this.vel.y)*2);
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

function changeStringRandom(str) {
  str = str.split("");
  str[floor(random(str.length))] = String.fromCharCode(floor(random(33,126)));
  return str.join("");
}

let eventsToAdd = ['keydown', 'mousedown', 'dblclick', 'blur', 'focus', 'keyup'];
for (let EVENT of eventsToAdd)
window.addEventListener(EVENT, e => {
  if(!pause_Button_.paused && drawFN && drawFN[EVENT]) drawFN[EVENT](e);
});

function disableScroll() {
  var keys = {37: 1, 38: 1, 39: 1, 40: 1};
  function preventDefault(e) { e.preventDefault(); }
  function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
      preventDefault(e);
      return false;
    }
  }
  var supportsPassive = false;
  try {
    window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
      get: function () { supportsPassive = true; }
    }));
  } catch(e) {}
  var wheelOpt = supportsPassive ? { passive: false } : false;
  var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
  window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
  window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
  window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
  window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}
