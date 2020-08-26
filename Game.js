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

  this.ketbits = [];
  this.particles = [];
  this.ketron = new Ketron(random(ketronIndex), this);
  this.next = new Ketron(random(ketronIndex), this);

  this.drawUI = () => {
    palset([64,64,64,63,64]);
    spr(58, 16, 0, 6, 4);
  }

  this.gameLoop = () => {
    cls(48);
    for (var i = 0; i < floor(random(1,4)); i++) ketronNames[5] = changeStringRandom(ketronNames[5]);

    this.drawUI();

    if("O".includes(this.next.type)) setCamera(-16, 48);
    if("SZJLT".includes(this.next.type)) setCamera(-24, 48);
    if("I".includes(this.next.type)) setCamera(-16, 40);
    if(this.next) this.next.draw();

    setCamera(200-5*16, 0);

    if(this.ketron) this.ketron.update(); // in charge of peices falling!!!!
    if(this.ketron.dead) {
      this.ketron = this.next;
      this.next = new Ketron(random(ketronIndex), this);
    }
    if(this.ketron) this.ketron.draw();

    for (var k of this.ketbits) k.update(); // not in charge of falling!!!!
    for (var k of this.ketbits) k.draw();
    for (var i = this.particles.length-1; i >= 0; i--) this.particles[i].draw();

    for (var i = 0; i < 15; i++) {
      palset([63,64,64,64,64]);
      spr(1, -16, i*16);
      spr(1, 10*16, i*16, 1, 1, true);
    }

    let rowCount = new Array(15).fill(0);
    for (var k of this.ketbits) {
      for (var i = 0; i < rowCount.length; i++) if(k.pos.y == i) rowCount[i] += 1;
    }

    for (var k of this.ketbits) {
      for (var i = 0; i < rowCount.length; i++) if(rowCount[i] >= 10) {
        if(k.pos.y < i) k.fall();
        else if(k.pos.y == i) k.dead = true;
      }
    }
    for (var i = this.ketbits.length-1; i >= 0; i--) if(this.ketbits[i].dead) this.ketbits[i].kill();
  }
  this.draw = this.gameLoop;

  this.gameOver = () => {
    this.draw = () => {
      cls(48);

      setCamera(200-5*16, 0);
      for (var k of this.ketbits) k.draw();

      for (var i = 0; i < 15; i++) {
        palset([63,64,64,64,64]);
        spr(1, -16, i*16);
        spr(1, 10*16, i*16, 1, 1, true);
      }

      if(btn('a') && !pbtn('a')) drawFN = new Game();

      setCamera(0, 0);
      put("GAME OVER", 199-9*4, 120-4, 48);
      put("GAME OVER", 201-9*4, 120-4, 48);
      put("GAME OVER", 200-9*4, 121-4, 48);
      put("GAME OVER", 200-9*4, 119-4, 48);

      put("GAME OVER", 200-9*4, 120-4, 63);

      put("PRESS R", 199-7*4, 120-4+8, 48);
      put("PRESS R", 201-7*4, 120-4+8, 48);
      put("PRESS R", 200-7*4, 121-4+8, 48);
      put("PRESS R", 200-7*4, 119-4+8, 48);

      put("PRESS R", 200-7*4, 120-4+8, 63);
      // noLoop();
    }
  }
}

function Particle(game, x, y, frames, pal, speed, ...rest) {
  game.particles.push(this);
  this.life = 0;
  this.draw = () => {
    palset(pal);
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

let eventsToAdd = ['keydown', 'mousedown', 'dblclick', 'blur', 'focus'];
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
