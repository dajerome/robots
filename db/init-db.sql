-- cleanup db
drop table if exists fight_participants;
drop table if exists fights;
drop table if exists robots;
drop table if exists weapons;

-- robot weapons (defense or attack)
create table weapons (
  id serial primary key,
  name text not null,
  type text not null check (type in ('a', 'd')),
  strength text not null check (strength in ('l', 'm', 'h')),
  accuracy text not null check (strength in ('l', 'm', 'h')),
  unique(name)
);

-- robots
create table robots (
  id serial primary key,
  name text not null,
  color text,
  attack_weapon_id int not null references weapons (id),
  defense_weapon_id int not null references weapons (id),
  unique(name)
);

-- fights
create table fights (
  id serial primary key,
  winner_robot_id int references robots (id)
);

-- fight participants
create table fight_participants (
  fight_id int not null references fights (id),
  robot_id int not null references robots (id),
  unique(fight_id, robot_id)
);

-- prepopulate weapons
insert into weapons (name, type, strength, accuracy)
values
  ('torch', 'a', 'h', 'l'),
  ('hammer', 'a', 'm', 'm'),
  ('saw', 'a', 'l', 'h'),
  ('shield', 'd', 'h', 'l'),
  ('trash can lid', 'd', 'm', 'm'),
  ('pillow', 'd', 'l', 'h');

-- precreate robots
insert into robots (name, color, attack_weapon_id, defense_weapon_id)
  select 'Tiny', 'red', (select id from weapons where name = 'torch'), (select id from weapons where name = 'shield')
union all
  select 'Destroyer', 'green', (select id from weapons where name = 'hammer'), (select id from weapons where name = 'trash can lid')
union all
  select 'Grave Digger', 'blue', (select id from weapons where name = 'saw'), (select id from weapons where name = 'pillow')
;
