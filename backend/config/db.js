const mongoose = require('mongoose')

const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        
        if(conn.connection.readyState === 1) console.log("Connected");
        else 
            console.log('Connecting');
    } catch (error) {
        console.log('Db connection error');
        throw new Error(error);
    }
}

module.exports = dbConnect;