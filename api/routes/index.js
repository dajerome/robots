const dao = require('../dao/dao')();

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.send('ok!');
});

// get all robots and their overall records
router.get('/robots', async function (req, res, next) {
  try {
    let robots = await dao.getRobots({});
    res.status(200).json(robots);
  }
  catch(e) {
    console.error(e);
    res.status(500).send('Internal Error');
  }
});

// get specific robot
router.get('/robots/:id', async function (req, res, next) {
  try {
    let robot = await dao.getRobots({id: req.params.id});
    if (robot.length == 1) {
      res.status(200).json(robot[0]);
    }
    else {
      res.status(404).send('Robot not found');
    }
  }
  catch(e) {
    console.error(e);
    res.status(500).send('Internal Error');
  }
});

// create new robot
router.post('/robots', async function (req, res, next) {
  let result = await dao.createRobot(req.body);
  if (result.success) {
    res.status(200).json({id: result.id});
  }
  else {
    res.status(500).send('Internal Error');
  }
});

// robot fight!
router.post('/fight', async function (req, res, next) {
  // get participant details
  let names = [];
  for (let i in req.body) {
    names.push(req.body[i].name);
  }
  let robots = await dao.getRobots({names});
  const numberOfRobots = robots.length;
  if (numberOfRobots <= 1) {
    res.status(404).send('Could not find enough robots to fight');
  }

  let participantNames = [];
  let health = [];
  for (let i in robots) {
    health.push({
      name: robots[i].name,
      health: 100
    });
    participantNames.push(robots[i].name);
  }

  let winner = false;
  let tie = false;
  let winnerName = undefined;
  let round = 1;
  let roundLog = [];
  const strengths = {
    l: [1, 2, 3, 10],
    m: [1, 2, 9, 10],
    h: [1, 8, 9, 10]
  };
  const accuracies = {
    l: [0, 0, 0, 1],
    m: [0, 0, 1, 1],
    h: [0, 1, 1, 1]
  };
  const moves = ['a', 'd'];

  while (!winner && !tie && round <= 10) {

    let roundMoves = [];
    for (let i in robots) {
      let robot = robots[i];

      // select whether to defend or attack randomly
      const move = moves[Math.floor(Math.random() * 2)];
      const action = move == 'a' ? robot.attack_weapon : robot.defense_weapon;
      // select random strength based on weapon level
      const strength = strengths[action.strength][Math.floor(Math.random() * 4)];
      // select random accuracy based on weapon level
      const accuracy = accuracies[action.accuracy][Math.floor(Math.random() * 4)];
      // select random multiplier
      const multiplier = Math.floor(Math.random() * 5);

      // select random robot to attack or defend from (could be own robot!)
      console.log(health);
      const opponent = health[Math.floor(Math.random() * numberOfRobots)];

      const power = strength * accuracy * multiplier;

      roundMoves.push({
        robot1: robot.name,
        robot2: opponent.name,
        move: move,
        action: action,
        power: power
      });
    }
    winner, tie, winnerName, health = await calculateRound(health, roundMoves, roundLog, round);
    round++;
  }

  let result;
  if (winner) {
    result = await dao.createFight({
      winner_name: winnerName,
      names: participantNames
    });
  }
  else {
    result = await dao.createFight({
      names: participantNames
    });
  }

  if (result.success) {
    res.status(200).json({
      id: result.id,
      winner: winnerName,
      participants: robots,
      round_log: roundLog
    });
  }
  else {
    res.status(500).send('Internal Error');
  }

});

// TODO
// update robot
router.put('/robot/:id', function (req, res, next) {
  res.send('ok!');
});

// TODO
// delete robot
router.delete('/robot/:id', function (req, res, next) {
  res.send('ok!');
});

// calculate fight round
calculateRound = async function(health, moves, roundLog, round) {
  let damages = {};
  let actions = [];
  for (let i in moves) {
    let move = moves[i];
    actions.push(`${move.robot1} ${move.move == 'a' ? 'attacked' : 'defended itself from'} ${move.robot2} with ${move.action.name} and ${move.power} power`);
    let damageName = move.move == 'a' ? move.robot2 : move.robot1;
    let damage = move.move == 'a' ? move.power * -1  : move.power;
    if (damages.hasOwnProperty(damageName)) {
      damages[damageName].damage += damage;
    }
    else {
      damages[damageName] = {
        damage: damage
      };
    }
  }
  for (let damageName in damages) {
    for (let i in health) {
      if (health[i].name == damageName) {
        health[i] += damages[damageName].damage < 0 ? damages[damageName].damage  : 0;
      }
    }
  }
  let winnerCount = 0;
  let winner = undefined;
  for (let i in health) {
    winnerCount += (health[i].health > 0) ? 1 : 0;
    winner = (health[i].health > 0) ? health[i].name : undefined;
  }
  roundLog.push({
    round: round,
    actions: actions
  });
  return winnerCount == 1, winnerCount == 0, winner, health;
}

module.exports = router;
