const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../backend/.env') });

const Team = require('../../backend/models/Team');

const checkTeams = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const teams = await Team.find();
        console.log(`Found ${teams.length} teams.`);
        console.log(JSON.stringify(teams, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkTeams();
