class User {
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }

  getUsername() {
    return this.username;
  }

  setUsername(username) {
    this.username = username;
  }

  getPassword() {
    return this.password;
  }

  setPassword(password) {
    this.password = password;
  }
}

function login() {
  try {
    arguments = [];

    logregfirst(arguments, "log");

    let user = null;
    const userCont = localStorage.getItem(arguments[0]);
    if (userCont) {
      user = JSON.parse(userCont);
    }

    if (user === null) {
      throw "User not found.";
    }

    if (user.password !== arguments[1]) {
      throw "Incorrect password.";
    }

    logreglast();
  } catch (err) {
    console.log(err);
  } finally {
    return false;
  }
}

function register() {
  try {
    arguments = [];

    logregfirst(arguments, "reg");

    let user = null;
    const userCont = localStorage.getItem(arguments[0]);
    if (userCont) {
      user = JSON.parse(userCont);
    }

    if (user !== null) {
      throw "User already exists.";
    }

    user = new User(arguments[0], arguments[1]);
    localStorage.setItem(arguments[0], JSON.stringify(user));

    logreglast();
  } catch (err) {
    console.log(err);
  } finally {
    return false;
  }
}

function logregfirst(arguments, prefix) {
  arguments.push(document.getElementById(prefix + "username").value);
  arguments.push(document.getElementById(prefix + "password").value);

  for (let i = 0; i < arguments.length; i++) {
    if (arguments[i] === "") {
      throw "Entry needed.";
    }
  }
}

function logreglast() {
  const el = document.getElementById("logregform");
  const base = el.parentElement;

  base.removeChild(el);
  base.setHTML(`
    <section>
      <h2 class="text" style="--tn: 1s; --sn: 5; --en: 3; --wn: 3.4em;">Stats \n 0 : 0</h2>
    </section>
    <section>
      <canvas id="game" width="800" height="800">
    </section>
    <section>
      <h2 class="text" style="--tn: 1s; --sn: 4; --en: 3; --wn: 2.7em;">Chat</h2>
    </section>`);

  initialize();
}

//////////////////////////////////////////////////////////////////////////////////
//var playerScores;

function initialize() {
  canvas = document.getElementById("game");
  context = canvas.getContext("2d");
  setInterval(loop, 100);
  lastKey = null;
}


enemy = {
  type: "enemy",
  width: 8,
  height: 8,
  color: "#F00",
  history: [],
  current_direction: null
};

player = {
  type: "player",
  width: 8,
  height: 8,
  color: "#00F",
  history: [],
  current_direction: null
};

keys = {
  up: [87],
  down: [83],
  left: [65],
  right: [68],

  start_game: [13],

  e_up: [38],
  e_down: [40],
  e_left: [37],
  e_right: [39]
};

game = {
  over: false,

  start: function () {
    cycle.resetPlayer();
    cycle.resetEnemy();
    game.over = false;
    game.resetCanvas();
  },

  stop: function (cycle) {
    game.over = true;
    context.fillStyle = "#FFF";
    context.font = canvas.height / 18 + "px sans-serif";
    context.textAlign = "center";
    winner = cycle.type == "enemy" ? "PLAYER" : "ENEMY";
    if (winner === "PLAYER") {
      playerScores.player += 1;
    }
    else {
      playerScores.enemy += 1;
    }
    context.fillText(
      "GAME OVER - " + winner + " WINS",
      canvas.width / 2,
      canvas.height / 2
    );
    context.fillText(
      "press enter to contine",
      canvas.width / 2,
      canvas.height / 2 + cycle.height * 3
    );
    cycle.color = "#FFF";
  },
  
  pause: function () {
    game.over = true;
    context.fillStyle = "#FFF";
    context.font = canvas.height / 18 + "px sans-serif";
    context.textAlign = "center";
    context.fillText(
      "Game paused, press enter to restart",
      canvas.width / 2,
      canvas.height / 2
    );
  },

  newLevel: function () {
    cycle.resetPlayer();
    cycle.resetEnemy();
    this.resetCanvas();
  },

  resetCanvas: function () {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
};

cycle = {
  resetPlayer: function () {
    player.x = canvas.width - (canvas.width / (player.width / 2) + 4);
    player.y = canvas.height / 2 + player.height / 2;
    player.color = "#1EF";
    player.history = [];
    player.current_direction = "left";
  },

  resetEnemy: function () {
    enemy.x = canvas.width / (enemy.width / 2) - 4;
    enemy.y = canvas.height / 2 + enemy.height / 2;
    enemy.color = "#EB0";
    enemy.history = [];
    enemy.current_direction = "e_right";
  },

  move: function (cycle, opponent, u, d, l, r) {
    switch (cycle.current_direction) {
      case u:
        cycle.y -= cycle.height;
        break;
      case d:
        cycle.y += cycle.height;
        break;
      case r:
        cycle.x += cycle.width;
        break;
      case l:
        cycle.x -= cycle.width;
        break;
    }
    if (this.checkCollision(cycle, opponent)) {
      game.stop(cycle);
    }
    coords = this.generateCoords(cycle);
    cycle.history.push(coords);
  },

  checkCollision: function (cycle, opponent) {
    if (
      cycle.x < cycle.width / 2 ||
      cycle.x > canvas.width - cycle.width / 2 ||
      cycle.y < cycle.height / 2 ||
      cycle.y > canvas.height - cycle.height / 2 ||
      cycle.history.indexOf(this.generateCoords(cycle)) >= 0 ||
      opponent.history.indexOf(this.generateCoords(cycle)) >= 0
    ) {
      return true;
    }
  },

  isCollision: function (x, y) {
    coords = x + "," + y;
    if (
      x < enemy.width / 2 ||
      x > canvas.width - enemy.width / 2 ||
      y < enemy.height / 2 ||
      y > canvas.height - enemy.height / 2 ||
      enemy.history.indexOf(coords) >= 0 ||
      player.history.indexOf(coords) >= 0
    ) {
      return true;
    }
  },

  generateCoords: function (cycle) {
    return cycle.x + "," + cycle.y;
  },

  draw: function (cycle) {
    context.fillStyle = cycle.color;
    context.beginPath();
    context.moveTo(cycle.x - cycle.width / 2, cycle.y - cycle.height / 2);
    context.lineTo(cycle.x + cycle.width / 2, cycle.y - cycle.height / 2);
    context.lineTo(cycle.x + cycle.width / 2, cycle.y + cycle.height / 2);
    context.lineTo(cycle.x - cycle.width / 2, cycle.y + cycle.height / 2);
    context.closePath();
    context.fill();
  }
};

function inverseDirection(cycle, u, d, l, r) {
  switch (cycle.current_direction) {
    case u:
      return d;
      break;
    case d:
      return u;
      break;
    case r:
      return l;
      break;
    case l:
      return r;
      break;
  }
}

Object.prototype.getKey = function (value) {
  for (var key in this) {
    if (this[key] instanceof Array && this[key].indexOf(value) >= 0) {
      return key;
    }
  }
  return null;
};

addEventListener(
  "keydown",
  function (e) {
    lastKey = keys.getKey(e.keyCode);
    if (
      ["up", "down", "left", "right"].indexOf(lastKey) >= 0 &&
      lastKey != inverseDirection(player, "up", "down", "left", "right")
    ) {
      player.current_direction = lastKey;
    }
    if (
      ["e_up", "e_down", "e_left", "e_right"].indexOf(lastKey) >= 0 &&
      lastKey != inverseDirection(enemy, "e_up", "e_down", "e_left", "e_right")
    ) {
      enemy.current_direction = lastKey;
    } else if (["start_game"].indexOf(lastKey) >= 0 && game.over) {
      game.start();
    }
  },
  false
);

addEventListener("keydown", function(e) {
  if(e.key === "Escape") {
      game.pause();
    }
  }
);


function loop() {
  if (game.over === false) {
    cycle.move(player, enemy, "up", "down", "left", "right");
    cycle.draw(player);
    cycle.move(enemy, player, "e_up", "e_down", "e_left", "e_right");
    cycle.draw(enemy);
  }
}
