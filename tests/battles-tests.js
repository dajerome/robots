const superagent = require('superagent');

const checkStatusCode = async function(status, expectedStatusCode, testName) {
  if (status && status == expectedStatusCode) {
    console.log(`----${testName} Success`);
  }
  else {
    console.error(`********${testName} Failure : received ${status} but shoudl have been ${expectedStatusCode}********`);
  }
}

// ---------------------------
// Battle
// ---------------------------
const battleTests = async function() {
  console.log('------------------------------');
  console.log('--Testing battles');
  console.log('------------------------------');

  // Test 1
  let id;
  try {
    const response = await superagent.post('http://localhost:3001/battle')
      .send([
        {
          name: 'Tiny'
        },
        {
          name: 'Destroyer'
        }
      ]);
    await checkStatusCode(response.res.statusCode, 200, 'Test 1');
    const res = JSON.parse(response.res.text);
    if (res.winner && ['Tiny', 'Destroyer'].includes(res.winner)) {
      console.log(`----Battle winner check Success`);
    }
    else {
      console.error(`********Battle winner check Failure : received ${res.winner} but should have been either Tiny or Destroyer********`);
    }
  }
  catch (error) {
    console.error('********Test 1 Failure : received', error.status, 'but should have been 200********');
  }
}

const runAll = async function() {
  console.log('Running battle API tests');
  await battleTests();
}

runAll();
