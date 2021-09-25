const superagent = require('superagent');

const checkStatusCode = async function(status, expectedStatusCode, testName) {
  if (status && status == expectedStatusCode) {
    console.log(`----${testName} Success`);
  }
  else {
    console.error(`********${testName} Failure : received ${status} but shoudl have been ${expectedStatusCode}********`);
  }
}

const getRandomNumber = function(max) {
  return Math.floor(Math.random() * max);
}

// ---------------------------
// Get
// ---------------------------
const getRobotTests = async function() {
  console.log('------------------------------');
  console.log('--Testing get robots');
  console.log('------------------------------');

  // Test 1
  let id;
  try {
    const response = await superagent.get('http://localhost:3001/robots');
    await checkStatusCode(response.res.statusCode, 200, 'Test 1');
    const res = JSON.parse(response.res.text);
    id = res.robots[0].id;
  }
  catch (error) {
    console.error('********Test 1 Failure : received', error.status, 'but should have been 200********');
  }

  // Test 2
  try {
    const response = await superagent.get(`http://localhost:3001/robots/${id}`);
    await checkStatusCode(response.res.statusCode, 200, 'Test 2');
    const res = JSON.parse(response.res.text);
    if (res.robot.id == id) {
      console.log(`----Robot id match Success`);
    }
    else {
      console.error(`********Robot id match Failure : received ${res.robot.id} but should have been ${id}********`);
    }
  }
  catch (error) {
    console.error('********Test 2 Failure : received', error.status, 'but should have been 200********');
  }

  // Test 3
  try {
    await superagent.get('http://localhost:3001/robots/9999');
    console.error('********Test 3 Failure : received', response.res.statusCode, 'but should have been 404********');
  }
  catch (error) {
    await checkStatusCode(error.status, 404, 'Test 3');
  }
}

// ---------------------------
// Create/Update/Delete
// ---------------------------
const createUpdateDeleteRobotTests = async function(name) {
  console.log('------------------------------');
  console.log('--Testing create update delete robots');
  console.log('------------------------------');

  // Test 1
  let id;
  try {
    const response = await superagent.post('http://localhost:3001/robots')
      .send({
        name: name,
        color: 'red',
        attack_weapon: {
          name: 'hammer'
        },
        defense_weapon: {
          name: 'shield'
        }
      });
    await checkStatusCode(response.res.statusCode, 200, 'Test 1');
    const res = JSON.parse(response.res.text);
    id = res.robot.id;
  }
  catch (error) {
    console.error('********Test 1 Failure : received', error.status, 'but should have been 200********');
  }

  // Test 2
  try {
    const response = await superagent.put(`http://localhost:3001/robots/${id}`)
      .send({
        color: 'blue'
      });
    await checkStatusCode(response.res.statusCode, 200, 'Test 2');
    const res = JSON.parse(response.res.text);
    if (res.robot.color == 'blue') {
      console.log(`----Robot color update match Success`);
    }
    else {
      console.error(`********Robot color update match Failure : received ${res.robot.color} but should have been blue********`);
    }
  }
  catch (error) {
    console.error('********Test 2 Failure : received', error.status, 'but should have been 200********');
  }

  // Test 3
  try {
    const response = await superagent.delete(`http://localhost:3001/robots/${id}`);
    await checkStatusCode(response.res.statusCode, 200, 'Test 2');
    const res = JSON.parse(response.res.text);
    if (res.message == `${name} deleted`) {
      console.log(`----Robot delete Success`);
    }
    else {
      console.error(`********Robot delete Failure : received '${res.message}' but should have been '${name} deleted'********`);
    }
  }
  catch (error) {
    console.error('********Test 3 Failure : received', error.status, 'but should have been 200********');
  }

  // Test 4
  try {
    await superagent.get(`http://localhost:3001/robots/${id}`);
    console.error('********Test 4 Failure : received', response.res.statusCode, 'but should have been 404********');
  }
  catch (error) {
    await checkStatusCode(error.status, 404, 'Test 4');
  }
}

const runAll = async function() {
  console.log('Running robot API tests');
  await getRobotTests();
  const rand = getRandomNumber(999);
  await createUpdateDeleteRobotTests(`Test ${rand}`);
}

runAll();
