import mongoose from "mongoose";

// Database Connection Function
const connectDB = async () => {
    try {
        const connectionString = process.env.CONNECTIONSTRING;
        const dbName = process.env.DBNAME;
        
        // Handle both cases: connection string with or without database name
        const finalConnectionString = dbName && !connectionString.includes('/' + dbName) 
            ? `${connectionString}/${dbName}`
            : connectionString;
            
        console.log("Connecting to database...");
        const connectionInstance = await mongoose.connect(finalConnectionString);
        console.log(`\n✅ Connected to database -- DB HOST: ${connectionInstance.connection.host}`);
    }

    catch (error) {
        console.log("❌ Unable to connect to database--\nConnection Error: ", error.message);
        process.exit(1);
    }
}

export default connectDB;