const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'robots',
  port: 5432,
});

module.exports = function() {

  exports.getRobots = async function(input) {
    let filter = '';
    if (input.id) {
      filter = `where robots.id = ${input.id}`;
    }
    else if (input.names) {
      filter = `where robots.name in ('${input.names.join("','")}')`
    }

    const result = await pool.query(`
      select
        robots.id,
        robots.name,
        robots.color,
        attack_weapons.name as attack_name,
        attack_weapons.strength as attack_strength,
        attack_weapons.accuracy as attack_accuracy,
        defense_weapons.name as defense_name,
        defense_weapons.strength as defense_strength,
        defense_weapons.accuracy as defense_accuracy,
        0 as wins,
        0 as losses
      from robots robots inner join weapons attack_weapons
        on attack_weapons.type = 'a'
        and robots.attack_weapon_id = attack_weapons.id
      inner join weapons defense_weapons
        on defense_weapons.type = 'd'
        and robots.defense_weapon_id = defense_weapons.id
      ${filter}
    `);

    let robots = [];
    for (let i in result.rows) {
      const robot = result.rows[i];
      robots.push({
        id: robot.id,
        name: robot.name,
        color: robot.color,
        attack_weapon: {
          name: robot.attack_name,
          strength: robot.attack_strength,
          accuracy: robot.attack_accuracy
        },
        defense_weapon: {
          name: robot.defense_name,
          strength: robot.defense_strength,
          accuracy: robot.defense_accuracy
        },
        wins: robot.wins,
        losses: robot.losses
      });
    }

    return robots;
  }

  exports.createRobot = async function(input) {
    try {
      const result = await pool.query(`
        insert into robots (name, color, attack_weapon_id, defense_weapon_id)
        select
          '${input.name}',
          '${input.color}',
          (select id from weapons where name = '${input.attack_weapon.name}'),
          (select id from weapons where name = '${input.defense_weapon.name}')
        returning id;
      `);
      return {success: true, id: result.rows[0].id};
    }
    catch(e) {
      console.error(e);
      return {success: false, reason: e.message};
    }
  }

  exports.createFight = async function(input) {
    try {
      let fightResult;
      if (input.winner_name) {
        fightResult = await pool.query(`
          insert into fights (winner_robot_id)
          select id from robots where name = '${input.winner_name}'
          returning id
        `);
      }
      else {
        fightResult = await pool.query(`
          insert into fights (winner_robot_id) values (null)
          returning id
        `);
      }

      await pool.query(`
        insert into fight_participants (fight_id, robot_id)
        select ${fightResult.rows[0].id}, id from robots where name in ('${input.names.join("','")}')
      `);
      return {success: true, id: fightResult.rows[0].id};
    }
    catch(e) {
      console.error(e);
      return {success: false, reason: e.message};
    }
  }

  return exports;
}
