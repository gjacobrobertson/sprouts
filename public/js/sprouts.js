var width = 768,
    height=576;

var id_seed = 0;

var radius=5;

var segmentLength = 1;
var reductionFactor = 20;

var paper = Raphael(document.getElementById('graph'), width, height);
var frame = paper.rect(0, 0, width, height)
                 .attr({fill: 'white'});

var nodes = [],
    paths = [];

var action = null;

function Node(x, y) {
  this.x = x;
  this.y = y;
  this.id = id_seed++;
  this.neighbors = [];
  this.addNeighbor = function(neighbor) {
    this.neighbors.push(neighbor);
    neighbor.neighbors.push(this);
  }
  this.isSurvivor = function() {
    return this.neighbors.length < 3;
  }
  this.draw = function() {
    if(this.circle != null) {
      this.circle.remove();
    }
    this.circle = paper.circle(this.x, this.y, radius)
                       .mousedown(mousedownHandler)
                       .mouseup(mouseupHandler)
                       .attr('fill', 'black')
                       .data('id', this.id);
    if (this.isSurvivor()) {
      this.circle.attr('fill', 'green');
    }
  };
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
    if (this.points.length <= 2) {
      this.drawPolyline();
      return;
    }
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
    for(l = 0; l < length; l += reductionFactor) {
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
    if (this.isValid()) {
      var midpoint = this.path.midpoint();
      node = new Node(midpoint.x, midpoint.y);
      node.addNeighbor(this.source);
      node.addNeighbor(this.target);
      nodes.push(node)
      subpaths = path.split();
      subpaths.forEach(function(subpath) {
        paths.push(subpath);
      });
      redraw();
    };
    this.path.remove();
  };

  this.isValid = function() {
    a = [this.source, this.target];
    for (i = 0; i < a.length; i++) {
      endpoint = a[i];
      sum = endpoint.neighbors.length;
      sum += (endpoint == this.source);
      sum += (endpoint == this.target);
      if (sum > 3) {
        return false;
      }
    }
    return true
  }
}

function findNode(element) {
  id = element.data('id');
  found = null;
  nodes.forEach(function(node) {
    if (node.id == id) {
      found = node;
    }
  });
  return found;
}

function mouseupHandler() {
  if (action != null) {
    action.target = findNode(this);
    action.path.append(this.attr('cx'), this.attr('cy'));
    action.path.drawPolyline();
    action.play();
    action = null;
    frame.unmousemove(mousemoveHandler);
  }
}

function mousedownHandler() {
  if (action == null) {
    action = new Action(findNode(this),null, new Path());
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
    nodes.push(new Node(x, y));
  }
}

function distance(v1, v2) {
  return Math.sqrt(Math.pow(v1[0] - v2[0], 2) + Math.pow(v1[1] - v2[1], 2))
}

function redraw() {
  paths.forEach(function(p) {
    p.drawSmooth();
  });
  nodes.forEach(function(n) {
    n.draw();
  });
}

create_nodes(3);
redraw();
