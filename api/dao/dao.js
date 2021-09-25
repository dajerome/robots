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
    const result = await pool.query(`
      insert into robots (name, color, attack_weapon_id, defense_weapon_id)
      select
        '${input.name}',
        '${input.color}',
        (select id from weapons where name = '${input.attack_weapon.name}'),
        (select id from weapons where name = '${input.defense_weapon.name}')
      returning id;
    `);

    return result.rows[0].id;
  }

  exports.updateRobot = async function(input) {
    let updateClause = [];
    for (let prop in input.robot) {
      if (['name', 'color'].includes(prop)) {
        updateClause.push(`${prop} = '${input.robot[prop]}'`);
      }
      else if (['attack_weapon', 'defense_weapon'].includes(prop)) {
        if (input.robot[prop].name) {
          updateClause.push(`${prop}_id = (select id from weapons where name = '${input.robot[prop].name}')`);
        }
      }
    }
    if (updateClause.length == 0) {
      return {message: 'No valid robot properties to update'};
    }

    const result = await pool.query(`
      update robots
      set ${updateClause.join(',')}
      where id = ${input.id}
      returning *
    `);

    return {
      robot: result.rows[0],
      message: result.rows[0] && result.rows[0].id == input.id ? `${result.rows[0].name} updated` : `Robot with id ${input.id} not found`
    };
  }

  exports.deleteRobot = async function(input) {
    const result = await pool.query(`
      with battles_to_delete as (
        select battle_id from battle_participants where robot_id = ${input.id}
      ),
      delete_participants as (
        delete from battle_participants p
        where exists (
          select 1 from battles_to_delete d
          where d.battle_id = p.battle_id
        )
      ),
      delete_battles as (
        delete from battles b
        where exists (
          select 1 from battles_to_delete d
          where d.battle_id = b.id
        )
      ),
      delete_robots as (
        delete from robots where id = ${input.id}
        returning *
      )
      select name, count(*) as robot_delete_count from delete_robots group by 1
    `);

    return result.rows[0] && result.rows[0].robot_delete_count == 1 ? `${result.rows[0].name} deleted` : `Robot with id ${input.id} not found`;
  }

  exports.saveBattle = async function(input) {
    let battleResult;
    if (input.winner) {
      battleResult = await pool.query(`
        insert into battles (winner_robot_id)
        select id as winner_id from robots where name = '${input.winner_name}'
        returning id
      `);
    }
    else {
      battleResult = await pool.query(`
        insert into battles (winner_robot_id) values (null)
        returning id
      `);
    }

    await pool.query(`
      insert into battle_participants (battle_id, robot_id)
      select ${battleResult.rows[0].id}, id from robots where name in ('${input.names.join("','")}')
    `);

    return battleResult.rows[0].id;
  }

  return exports;
}
