const dashboardController = require('./src/controllers/dashboardController');

// Mock req and res
const req = {
  storeId: 'cmm11o1ym0000v96sxp1iap4j',
  query: {}
};

const res = {
  json: function(data) {
    console.log('SUCCESS:', JSON.stringify(data, null, 2));
  },
  status: function(code) {
    console.log('STATUS:', code);
    return this;
  }
};

async function run() {
  console.log('Testando getStats...');
  await dashboardController.getStats(req, res);
  console.log('-----------------');
  console.log('Testando getUsage...');
  req.plan = { name: 'PRO_PLUS', limits: { maxSalesPerMonth: 9999 } };
  await dashboardController.getUsage(req, res);
}

run();
