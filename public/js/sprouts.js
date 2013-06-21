var width = 768,
    height=576;

var radius=5;

var segment_length = 1;

var paper = Raphael(document.getElementById('graph'), width, height);
var frame = paper.rect(0, 0, width, height)
                 .attr({fill: 'white'});

var source = null,
    target = null;

var path_coords = null,
    path = null;

create_nodes(3);

function create_nodes(n) {
  for (i=0;i<n;i++){
    var x = Math.random() * (width - 2 * radius) + radius;
    var y = Math.random() * (height - 2 * radius) + radius;
    create_node(x, y);
  }
}

function create_node(x, y) {
  //paper.circle(x, y, radius)
  //     .click(node_handler);
  paper.circle(x, y, radius)
       .mousedown(node_mousedown)
       .mouseup(node_mouseup)
       .attr('fill', 'black');
}

function node_mousedown(e) {
  if (source == null) {
    source = this;
    path_coords = [[this.attr('cx'), this.attr('cy')]]
    frame.mousemove(trace_path);
  }
}

function node_mouseup() {
  if (source != null) {
    path_coords.push([this.attr('cx'), this.attr('cy')]);
    draw_path();
    play_path();
    source = null;
    frame.unmousemove(trace_path);
  }
}

function trace_path(e) {
  cursor = [e.offsetX, e.offsetY];
  if (distance(path_coords[path_coords.length - 1], cursor) > segment_length) {
    path_coords.push(cursor);
  }
  draw_path();
}

function draw_path() {
  p = [["M", path_coords[0][0], path_coords[0][1]]];
  for(i = 1; i < path_coords.length; i ++) {
    p.push(["L", path_coords[i][0], path_coords[i][1]]);
  }
  if (path != null) {
    path.remove();
  }
  path = paper.path(p);
}

function play_path() {
  length = path.getTotalLength();
  midpoint = path.getPointAtLength(length / 2);
  create_node(midpoint.x, midpoint.y);
  subpath1 = path.getSubpath(0, length/2);
  subpath2 = path.getSubpath(length/2, length);
  reduce_path(subpath1);
  reduce_path(subpath2);
  path.remove()
}

function reduce_path(pString) {
  reduced = [];
  length = Raphael.getTotalLength(pString);
  for(l = 0; l < length - 20; l += 20) {
    var point = Raphael.getPointAtLength(pString, l);
    reduced.push(point);
  }
  reduced.push(Raphael.getPointAtLength(pString, length));
  draw_reduced_path(reduced);
}

function draw_reduced_path(reduced) {
  p = [["M", reduced[0].x, reduced[0].y]];
  curve = ["R"];
  for(i = 1; i < reduced.length; i++) {
    curve.push(reduced[i].x);
    curve.push(reduced[i].y);
  }
  p.push(curve);
  paper.path(p);
}

function distance(v1, v2) {
  return Math.sqrt(Math.pow(v1[0] - v2[0], 2) + Math.pow(v1[1] - v2[1], 2))
}
