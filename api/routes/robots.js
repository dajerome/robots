const dao = require('../dao/dao')();

var express = require('express');
var router = express.Router();

// robots api

// get all robots and their overall records
router.get('/', async function (req, res, next) {
  try {
    const robots = await dao.getRobots({});
    res.status(200).json({robots: robots});
  }
  catch(e) {
    console.error(e);
    res.status(500).send('Internal Error');
  }
});

// get specific robot
router.get('/:id', async function (req, res, next) {
  try {
    const robot = await dao.getRobots({id: req.params.id});
    if (robot.length == 1) {
      res.status(200).json({robot: robot[0]});
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
router.post('/', async function (req, res, next) {
  const {name, attack_weapon, defense_weapon} = req.body;
  if (!name || !attack_weapon || !defense_weapon) {
    res.status(422).send('Robot name & weapon details are required to create a new robot');
  }
  else if (name && attack_weapon && defense_weapon && (!attack_weapon.name || !defense_weapon.name)) {
    res.status(422).send('Attack & defense weapon details are required to create a new robot');
  }

  try {
    const id = await dao.createRobot(req.body);
    res.status(200).json({robot: {id}});
  }
  catch(e) {
    console.error(e);
    res.status(500).send('Internal Error');
  }
});

// update robot
router.put('/:id', async function (req, res, next) {
  const {name, color, attack_weapon, defense_weapon} = req.body;
  if (!name && !color && !attack_weapon && !defense_weapon) {
    res.status(422).send('Must provide a robot property to update');
  }

  try {
    const result = await dao.updateRobot({id: req.params.id, robot: req.body});
    res.status(200).json({robot: result.robot, message: result.message});
  }
  catch(e) {
    console.error(e);
    res.status(500).send('Internal Error');
  }
});
  
// delete robot
router.delete('/:id', async function (req, res, next) {
  try {
    const message = await dao.deleteRobot({id: req.params.id});
    res.status(200).json({message});
  }
  catch(e) {
    console.error(e);
    res.status(500).send('Internal Error');
  }
});

module.exports = router;
