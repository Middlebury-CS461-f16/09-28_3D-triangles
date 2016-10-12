let vertexShader = `
attribute vec4 a_Position;
attribute vec4 a_Color;

uniform mat4 u_Transform;
uniform mat4 u_Projection;

varying vec4 v_Color;

void main(){
  v_Color = a_Color;
  gl_Position = u_Projection * u_Transform * a_Position;
}`;

var fragmentShader = `
precision mediump float;
varying vec4 v_Color;
void main(){
  gl_FragColor = v_Color;
}`;


var createTriangles = function(gl, program){
  // vertices and their colors (arranged x1,y1,z1, r1,g1,b1, x2, y2, z2, r2,g2.b2, etc...)
  var vertices  = new Float32Array([
      -0.5, -0.3,  0.0,  1.0, 0.4, 0.4, // front face
       0.5, -0.3,  0.0,  1.0, 0.4, 0.4,
       0.5,  0.8,  0.0,  1.0, 0.4, 0.4,

      -0.5, -0.3, -0.5,  0.4, 0.4, 1.0, // back face
       0.5, -0.3, -0.5,  0.4, 0.4, 1.0,
      -0.5,  0.8, -0.5,  0.4, 0.4, 1.0,

      -0.5, -0.3, -0.25,  0.4, 1.0, 0.4, // middle face
       0.5, -0.3, -0.25,  0.4, 1.0, 0.4,
       0.0,  0.8, -0.25,  0.4, 1.0, 0.4


  ]);
  // calculate the number of vertices
  var n = vertices.length/6;


  // Push the vertex attributes down to the VBO
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var FSIZE = vertices.BYTES_PER_ELEMENT;


  return function(){
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(program.a_Position, 3, gl.FLOAT, false, FSIZE*6,0);
    gl.vertexAttribPointer(program.a_Color, 3, gl.FLOAT, false,  FSIZE*6, FSIZE*3);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 6);
  };

};



var createAxis = function(gl, program){
  // vertices and their colors (arranged x1,y1,z1, r1,g1,b1, x2, y2, z2, r2,g2.b2, etc...)
  var vertices  = new Float32Array([
      0, 0,  0,  1, 0, 0, // x - axis
      1, 0,  0,  1, 0, 0,

      0, 0,  0,  0, 1, 0, // y - axis
      0, 1,  0,  0, 1, 0,

      0, 0,  0,  0, 0, 1, // Z - axis
      0, 0,  1,  0, 0, 1,
  ]);
  // calculate the number of vertices
  var n = vertices.length/6;


  // Push the vertex attributes down to the VBO
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var FSIZE = vertices.BYTES_PER_ELEMENT;


  return function(){
    let originalWidth = gl.getParameter(gl.LINE_WIDTH);
    gl.lineWidth(5);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(program.a_Position, 3, gl.FLOAT, false, FSIZE*6,0);
    gl.vertexAttribPointer(program.a_Color, 3, gl.FLOAT, false,  FSIZE*6, FSIZE*3);
    gl.drawArrays(gl.LINES, 0, vertices.length / 6);
    gl.lineWidth(originalWidth);
  };

};



window.onload = function(){
  let canvas = document.getElementById('canvas');
  let gl;
  // catch the error from creating the context since this has nothing to do with the code
  try{
    gl = middUtils.initializeGL(canvas);
  } catch (e){
    alert('Could not create WebGL context');
    return;
  }

  // don't catch this error since any problem here is a programmer error
  let program = middUtils.initializeProgram(gl, vertexShader, fragmentShader);

  // load referneces to the vertex attributes as properties of the program
  program.a_Position = gl.getAttribLocation(program, 'a_Position');
  if (program.a_Position < 0) {
      console.log('Failed to get storage location');
      return -1;
  }
  gl.enableVertexAttribArray(program.a_Position);

 // specify the association between the VBO and the a_Color attribute
  program.a_Color = gl.getAttribLocation(program, 'a_Color');
  if (program.a_Color < 0) {
      console.log('Failed to get storage location');
      return -1;
  }
  gl.enableVertexAttribArray(program.a_Color);

  // create the triangle drawing function
  let drawTriangles = createTriangles(gl, program);
  let drawAxis = createAxis(gl, program);


  let transform = mat4.create();


  //mat4.translate(transform, transform, [0, 0, -0.2]);
  //mat4.rotateX(transform, transform, Math.PI/4);
  //mat4.rotateY(transform, transform, -Math.PI/4);

  let eye = vec3.fromValues(.6, .3, 0.5);
  let up = vec3.fromValues(0,1,0);
  let at = vec3.fromValues(0,0,0);

  mat4.lookAt(transform, eye, at, up);

  let u_Transform = gl.getUniformLocation(program, 'u_Transform');
  gl.uniformMatrix4fv(u_Transform, false, transform);

  let projection = mat4.create();
  mat4.ortho(projection, -1, 1, -1, 1, 0.1, 5);
  let u_Projection = gl.getUniformLocation(program, 'u_Projection');
  gl.uniformMatrix4fv(u_Projection, false, projection);


  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0,0,0,1);
  // clear the canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // draw the triangles
  drawAxis();
  drawTriangles();


};
