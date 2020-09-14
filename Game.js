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
  this.score = new Score(this);
  this.rowsCleared = 0;

  this.ketbits = [];
  this.particles = [];
  this.ketron = new Ketron(random(ketronIndex), this);
  this.next = new Ketron(random(ketronIndex), this);
  this.background = 48;
  this.held = false;

  this.shake = new Vector(0,0);

  this.drawUI = () => {
    setCamera((D.W/2)-5*16+this.shake.x, this.shake.y);

    for (var i = 0; i < 15; i++) {
      palset([63,64,64,64,64]);
      spr(1, -16, i*16);
      spr(1, 10*16, i*16, 1, 1, true);
    }

    setCamera(0,0);

    if(DEBUG) {
      put(JSON.stringify(this.ketron.keytime), 0.1, 0.1, 63);

    }
    // put(this.shake.mag());

    setCamera(this.shake.x,this.shake.y);

    // put(sprImg.length);

    palset([64,64,64,63,64]);
    spr(58, 16+8, 8, 5, 3);
    put("NEXT", 35, 49, 63);

    spr(58, 16+8, 48+8, 5, 3);
    put("HOLD", 35, 97, 63);

    setCamera((D.W/2)+6*16+this.shake.x, this.shake.y + 16);
    put("-SCORE-", 0.1, 0.1);
    // put(this.score, 0.1, 10);
    this.score.draw();
    put("-LINES-", 0.1, 22, 3);
    put(this.rowsCleared, 0.1, 32, 3);
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

    setCamera((D.W/2)-5*16 + this.shake.x, 0 + this.shake.y);

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
      let scores = [40, 60, 200, 900];
      this.addShake(4);
      new ScoreParticle(this, (D.W/2), i*16, scores[rows]);
      rows++;
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

    this.updateScore(rows);
    if(rows) for (var p of this.particles) if(p.dog) p.encourage(rows);

    for (var i = this.ketbits.length-1; i >= 0; i--) if(this.ketbits[i].dead) this.ketbits[i].kill();
  }
  // this.draw = this.gameLoop;

  this.updateScore = (rows) => {
    // let score = [0, 40, 100, 300, 1200];
    // [40, 60, 200, 900]

    this.rowsCleared += rows;
    this.level = floor(this.rowsCleared/10);

    // this.score.add(score);
     // += score[rows] * (this.level + 1);
  }

  this.start = () => {
    this.speed = 30;
    this.level = 0;
    this.score = new Score(this);
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
    new Dog(this, (D.W/2)-16, 120-24, frames, pal, 2, 3, false, -90);

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

      if(floor(frameCount/16)%2) put("PRESS ANY KEY", (D.W/2) - 13*4, 240-10);

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

      setCamera((D.W/2)-5*16+this.shake.x, this.shake.y);
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
