function Vector(x, y) {
  this.x = x || 0;
  this.y = y || 0;

  this.copy = () => { return new Vector(this.x, this.y); }

  this.set = (v, y) => {
    this.mult(0).add(v, y);
    return this;
  }

  this.add = (v, y) => {
    let x = v;
    if(typeof y == 'undefined') {
      x = v.x;
      y = v.y;
    }
    this.x += x;
    this.y += y;
    return this;
  }

  this.sub = (v) => {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  this.mult = (c) => {
    this.x *= c;
    this.y *= c;
    return this;
  }

  this.div = (c) => {
    if(!c) return this;
    this.mult(1/c);
    return this;
  }

  this.setMag = (mag) => {
    if(!this.mag()) this.x += mag;
    else this.normalize().mult(mag);
    return this;
  }

  this.mag = () => {return Math.sqrt(this.x*this.x + this.y*this.y);}

  this.normalize = () => {
    this.div(this.mag());
    return this;
  }

  this.norm = () => { return this.copy().div(this.mag()); }

  this.limit = (limit) => {
    if(this.mag() > limit) {
      this.normalize();
      this.mult(limit);
    }
    return this;
  }

  this.dist = (v) => {
    let x = abs(this.x - v.x);
    let y = abs(this.y - v.y);
    return Math.sqrt(x*x + y*y);
  }

  this.heading = () => { return Math.atan2(this.y, this.x); }

  this.rotate = (angle) => {
    let mag = this.mag();
    this.mult(0);
    this.add(mag * Math.cos(angle), mag * Math.sin(angle));
    return this;
  }

  this.equals = (v, y) => {
    if(typeof y == 'undefined') return this.equals(v.x, v.y);
    return this.x == v && this.y == y;
  }
}
