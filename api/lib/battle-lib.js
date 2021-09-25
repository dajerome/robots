module.exports = function() {

  exports.simulateBattle = async function(robots) {
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
      l: 10,
      m: 20,
      h: 30
    };
    const accuracies = {
      l: 1,
      m: 2,
      h: 3
    };
    const actions = ['a', 'a', 'a', 'd'];

    while (!winner && !tie && round <= 10) {

      let roundMoves = [];
      for (let i in robots) {
        let robot = robots[i];

        // select whether to defend or attack randomly
        const action = actions[getRandomNumber(4)];
        const weapon = action == 'a' ? robot.attack_weapon : robot.defense_weapon;
        // select random strength based on weapon level
        const strength = strengths[weapon.strength];
        // select random accuracy based on weapon level
        const accuracy = accuracies[weapon.accuracy];

        const power = strength * accuracy;

        // select random robot to attack or defend from (could be own robot!)
        const opponent = health[getRandomNumber(robots.length)];

        roundMoves.push({
          robot1: robot.name,
          robot2: opponent.name,
          action: action,
          weapon: weapon,
          power: power
        });
      }

      const result = await calculateRound(health, roundMoves, roundLog, round);
      winner = result.winner;
      tie = result.tie;
      winnerName = result.winnerName;

      round++;
    }

    return {
      winner: winner,
      winner_name: winnerName,
      participant_names: participantNames,
      round_log: roundLog
    };
  }

  return exports;
}

const calculateRound = async function(health, moves, roundLog, round) {
  let damageMap = {};
  let roundDescriptions = [];

  // iterate thru round moves and calculate damages
  for (let i in moves) {
    let move = moves[i];
    roundDescriptions.push(`${move.robot1} ${move.action == 'a' ? 'attacked' : 'defended itself from'} ${move.robot2} with ${move.weapon.name} and ${move.power} power`);
    let damageName = move.action == 'a' ? move.robot2 : move.robot1;
    let damage = move.action == 'a' ? move.power * -1  : move.power;
    if (damageMap.hasOwnProperty(damageName)) {
      damageMap[damageName].damage += damage;
    }
    else {
      damageMap[damageName] = {
        damage: damage
      };
    }
  }

  // iterate thru damages and apply to healths
  for (let damageName in damageMap) {
    for (let i in health) {
      if (health[i].name == damageName) {
        health[i].health += damageMap[damageName].damage < 0 ? damageMap[damageName].damage : 0;
      }
    }
  }

  // iterate thru healths to see if there is a winner or tie after this round
  let winnerCount = 0;
  let winnerName = undefined;
  for (let i in health) {
    winnerCount += (health[i].health > 0) ? 1 : 0;
    if (health[i].health > 0) {
      winnerName = health[i].name;
    }
  }

  roundLog.push({
    round: round,
    roundDescriptions: roundDescriptions
  });

  return {
    winner: winnerCount == 1,
    tie: winnerCount == 0,
    winnerName: winnerName
  };
}

// get random number
const getRandomNumber = function(max) {
  return Math.floor(Math.random() * max);
}
