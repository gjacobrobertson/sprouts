var width = 768,
    height=576;

var radius=5;

var segmentLength = 1;
var reductionFactor = 20;

var paper = Raphael(document.getElementById('graph'), width, height);
var frame = paper.rect(0, 0, width, height)
                 .attr({fill: 'white'});

var nodes = [],
    paths = [];

var action = null;

create_nodes(3);

function Node(x, y) {
  this.x = x;
  this.y = y;
  this.tracePath = function() {
  };
  this.draw = function() {
    if(this.circle != null) {
      this.circle.remove();
    }
    this.circle = paper.circle(this.x, this.y, radius)
                       .mousedown(mousedownHandler)
                       .mouseup(mouseupHandler)
                       .attr('fill', 'black');
  };
  nodes.push(this);
}

function Path() {
  this.points = [];
  this.append = function(x, y) {
    this.points.push([x, y]);
  }

  this.drawPolyline = function() {
    if (this.path != null) {
      this.remove();
    }
    p = [["M", this.points[0][0], this.points[0][1]]];
    for(i = 1; i < this.points.length; i ++) {
      p.push(["L", this.points[i][0], this.points[i][1]]);
    }
    this.path = paper.path(p);
  }

  this.drawSmooth = function() {
    if (this.path != null) {
      this.remove();
    }
    p = [["M", this.points[0][0], this.points[0][1]]];
    curve = ["R"];
    for(i = 1; i < this.points.length; i++) {
      curve.push(this.points[i][0]);
      curve.push(this.points[i][1]);
    }
    p.push(curve);
    console.log(p);
    this.path = paper.path(p);
  }

  this.length = function() {
    return this.path.getTotalLength();
  }

  this.midpoint = function() {
    return this.path.getPointAtLength(this.length() / 2);
  }

  this.split = function() {
    subpath1 = this.parse(this.path.getSubpath(0, this.length() / 2));
    subpath2 = this.parse(this.path.getSubpath(this.length() / 2, this.length()));
    return [subpath1, subpath2];
  }

  this.parse = function(pString) {
    newPath = new Path();
    length = Raphael.getTotalLength(pString);
    for(l = 0; l < length - reductionFactor; l += reductionFactor) {
      point = Raphael.getPointAtLength(pString, l);
      newPath.append(point.x, point.y);
    }
    point = Raphael.getPointAtLength(pString, length);
    newPath.append(point.x, point.y);
    return newPath;
  }

  this.remove = function() {
    this.path.remove();
  }
}

function Action(source, target, path) {
  this.source = source;
  this.target = target;
  this.path = path;
  this.play = function() {
    midpoint = this.path.midpoint();
    new Node(midpoint.x, midpoint.y).draw();
    subpaths = path.split();
    subpaths.forEach(function(subpath) {
      paths.push(subpath);
      subpath.drawSmooth();
    });
    this.path.remove();
  };
}

function mouseupHandler() {
  if (action != null) {
    action.path.append(this.attr('cx'), this.attr('cy'));
    action.path.drawPolyline();
    action.play();
    action = null;
    frame.unmousemove(mousemoveHandler);
  }
}

function mousedownHandler() {
  if (action == null) {
    action = new Action(this,null, new Path());
    action.path.append(this.attr('cx'), this.attr('cy'));
    frame.mousemove(mousemoveHandler);
  }
}
function mousemoveHandler(e) {
    cursor = [e.offsetX, e.offsetY];
    if (distance(action.path.points[action.path.points.length - 1], cursor) > segmentLength) {
      action.path.append(cursor[0], cursor[1]);
    }
    action.path.drawPolyline();
}
function create_nodes(n) {
  for (i=0;i<n;i++){
    x = Math.random() * (width - 2 * radius) + radius;
    y = Math.random() * (height - 2 * radius) + radius;
    node = new Node(x, y);
    node.draw();
  }
}

function distance(v1, v2) {
  return Math.sqrt(Math.pow(v1[0] - v2[0], 2) + Math.pow(v1[1] - v2[1], 2))
}
