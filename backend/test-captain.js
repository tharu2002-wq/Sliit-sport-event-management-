
require('dotenv').config();
const mongoose = require('mongoose');
const TeamRequest = require('./models/TeamRequest');
require('./models/Player');
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const reqs = await TeamRequest.find({ teamName: { $in: ['bhsk', 'nvhvj'] } }).lean();
  console.log(JSON.stringify(reqs, null, 2));
  process.exit(0);
}).catch(console.error);

