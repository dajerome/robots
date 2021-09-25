const dao = require('../dao/dao')();
const battleLib = require('../lib/battle-lib')();

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.send('ok!');
});

// robot battle!
router.post('/', async function (req, res, next) {
  // get participant details
  let names = [];
  for (let i in req.body) {
    names.push(req.body[i].name);
  }

  try {
    let robots = await dao.getRobots({names});
    if (robots.length <= 1) {
      res.status(404).send('Could not find enough robots to fight');
    }

    const battleResult = await battleLib.simulateBattle(robots);

    const id = await dao.saveBattle({
      winner: battleResult.winner,
      winner_name: battleResult.winner_name,
      names: battleResult.participant_names
    });

    res.status(200).json({
      id: id,
      winner: battleResult.winner_name,
      participants: robots,
      round_log: battleResult.round_log
    });
  }
  catch(e) {
    console.error(e);
    res.status(500).send('Internal Error');
  }
});

module.exports = router;
