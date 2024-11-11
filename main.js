function main(){
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  
    if (!gl) {
        throw new Error('WebGL not supported');
    }
  
    var vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
    var fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;
  
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  
    var program = createProgram(gl, vertexShader, fragmentShader);
  
    gl.useProgram(program);
  
    const positionBuffer = gl.createBuffer();
  
    const positionLocation = gl.getAttribLocation(program, `position`);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    

    const matrixUniformLocation = gl.getUniformLocation(program, `matrix`);
    const colorUniformLocation = gl.getUniformLocation(program, `color`);
    
    let matrix = m4.identity();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    let positionVector = [
        -0.5,-0.5,
        -0.5, 0.5,
         0.5,-0.5,
        -0.5, 0.5,
         0.5,-0.5,
         0.5, 0.5,
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionVector), gl.STATIC_DRAW);

  
    let colorVector = [0.0,0.0,0.0];
    gl.uniform3fv(colorUniformLocation,colorVector);

    const player1ScoreElement = document.getElementById("player1-score");
    const player2ScoreElement = document.getElementById("player2-score");
    

    const bodyElement = document.querySelector("body");
    bodyElement.addEventListener("keydown", (event) => {
    switch(event.key) {
        case "w":
            barra_esqY = Math.min(barra_esqY + velocidade, 1 - tam/2);
            break;
        case "s":
            barra_esqY = Math.max(barra_esqY - velocidade, -1 + tam/2);
            break;
        case "ArrowUp":
            barra_dirY = Math.min(barra_dirY + velocidade, 1 - tam/2);
            break;
        case "ArrowDown":
            barra_dirY = Math.max(barra_dirY - velocidade, -1 + tam/2);
            break;
    }
});
    

  //BARRINHAS
  let barra_esqY = 0;
  let barra_dirY = 0;
  const velocidade = 0.2;
  const tam = 0.5;

  const vertices = [
    -0.1, -0.5,  // Vértice inferior esquerdo
    -0.1,  0.5,  // Vértice superior esquerdo
     0.1, -0.5,  // Vértice inferior direito
    -0.1,  0.5,  // Vértice superior esquerdo
     0.1, -0.5,  // Vértice inferior direito
     0.1,  0.5,  // Vértice superior direito
];
  
    let theta = 0.0
    let tx = 0.0;
    let ty = 0.0;
    let tx_step = 0.01;
    let ty_step = 0.02;

    let player1Score = 0;
    let player2Score = 0;

    const ballSize = 0.05;
    const paddleWidth = 0.05;
    const paddleHeight = tam;
  
    function pong(){
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // Desenhar barra esquerda
        matrixBarra = m4.identity();
        matrixBarra = m4.translate(matrixBarra, -1.0, barra_esqY, 0.0);
        matrixBarra = m4.scale(matrixBarra, 0.5, tam, 1.0);
        gl.uniformMatrix4fv(matrixUniformLocation, false, matrixBarra);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Desenhar barra direita
        matrixBarra = m4.identity();
        matrixBarra = m4.translate(matrixBarra, 1.0, barra_dirY, 0.0);
        matrixBarra = m4.scale(matrixBarra, 0.5, tam, 1.0);
        gl.uniformMatrix4fv(matrixUniformLocation, false, matrixBarra);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Desenha a bolinha
        theta += 5.0;
        if (tx + ballSize > 1.0) {  // Saiu pela direita
           player1Score ++;
            resetBall();
        } else if (tx - ballSize < -1.0) {  // Saiu pela esquerda
           player2Score ++;
            resetBall();
        } else if ((tx + ballSize >= 1.0 - paddleWidth && Math.abs(ty - barra_dirY) <= paddleHeight / 2) || 
                  (tx - ballSize <= -1.0 + paddleWidth && Math.abs(ty - barra_esqY) <= paddleHeight / 2)) {
            tx_step = -tx_step;  // Inverte a direção em x ao colidir
        }
        
        if (ty > 1.0 || ty < -1.0) {
            ty_step = -ty_step;  // Inverte a direção em y ao colidir com o topo ou o fundo
        }
        tx += tx_step;
        ty += ty_step;

        matrix = m4.identity();
        matrix = m4.translate(matrix, tx, ty, 0.0);
        matrix = m4.zRotate(matrix, degToRad(theta));
        matrix = m4.scale(matrix, 0.25, 0.05, 1.0);
        gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        player1ScoreElement.textContent = `Player 1: ${player1Score}`;
        player2ScoreElement.textContent = `Player 2: ${player2Score}`;

        requestAnimationFrame(pong);
    }
  
    pong();

    function resetBall() {
      tx = 0.0;
      ty = 0.0;
      tx_step = 0.01 * (Math.random() < 0.5 ? 1 : -1);
      ty_step = 0.02 * (Math.random() < 0.5 ? 1 : -1);
  }
}
  
function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}
  
function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}
  
var m4 = {
    identity: function() {
      return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];
    },

    multiply: function(a, b) {
      var a00 = a[0 * 4 + 0];
      var a01 = a[0 * 4 + 1];
      var a02 = a[0 * 4 + 2];
      var a03 = a[0 * 4 + 3];
      var a10 = a[1 * 4 + 0];
      var a11 = a[1 * 4 + 1];
      var a12 = a[1 * 4 + 2];
      var a13 = a[1 * 4 + 3];
      var a20 = a[2 * 4 + 0];
      var a21 = a[2 * 4 + 1];
      var a22 = a[2 * 4 + 2];
      var a23 = a[2 * 4 + 3];
      var a30 = a[3 * 4 + 0];
      var a31 = a[3 * 4 + 1];
      var a32 = a[3 * 4 + 2];
      var a33 = a[3 * 4 + 3];
      var b00 = b[0 * 4 + 0];
      var b01 = b[0 * 4 + 1];
      var b02 = b[0 * 4 + 2];
      var b03 = b[0 * 4 + 3];
      var b10 = b[1 * 4 + 0];
      var b11 = b[1 * 4 + 1];
      var b12 = b[1 * 4 + 2];
      var b13 = b[1 * 4 + 3];
      var b20 = b[2 * 4 + 0];
      var b21 = b[2 * 4 + 1];
      var b22 = b[2 * 4 + 2];
      var b23 = b[2 * 4 + 3];
      var b30 = b[3 * 4 + 0];
      var b31 = b[3 * 4 + 1];
      var b32 = b[3 * 4 + 2];
      var b33 = b[3 * 4 + 3];
      return [
        b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
        b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
        b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
        b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
        b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
        b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
        b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
        b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
        b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
        b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
        b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
        b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
        b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
        b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
        b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
        b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
      ];
    },

    translation: function(tx, ty, tz) {
      return [
          1,  0,  0,  0,
          0,  1,  0,  0,
          0,  0,  1,  0,
          tx, ty, tz, 1,
      ];
    },

    xRotation: function(angleInRadians) {
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);

      return [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1,
      ];
    },

    yRotation: function(angleInRadians) {
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);

      return [
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1,
      ];
    },

    zRotation: function(angleInRadians) {
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);

      return [
          c, s, 0, 0,
        -s, c, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1,
      ];
    },

    scaling: function(sx, sy, sz) {
      return [
        sx, 0,  0,  0,
        0, sy,  0,  0,
        0,  0, sz,  0,
        0,  0,  0,  1,
      ];
    },

    translate: function(m, tx, ty, tz) {
      return m4.multiply(m, m4.translation(tx, ty, tz));
    },

    xRotate: function(m, angleInRadians) {
      return m4.multiply(m, m4.xRotation(angleInRadians));
    },

    yRotate: function(m, angleInRadians) {
      return m4.multiply(m, m4.yRotation(angleInRadians));
    },

    zRotate: function(m, angleInRadians) {
      return m4.multiply(m, m4.zRotation(angleInRadians));
    },

    scale: function(m, sx, sy, sz) {
      return m4.multiply(m, m4.scaling(sx, sy, sz));
    },

};
  
function radToDeg(r) {
  return r * 180 / Math.PI;
}

function degToRad(d) {
  return d * Math.PI / 180;
}

main();
