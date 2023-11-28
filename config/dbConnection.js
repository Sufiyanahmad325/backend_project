import mongoose from "mongoose";

mongoose.set('strictQuery' ,false)   //  'strictQuery' ,false =>  agr ham database se kuch mangte hai ki ya save krte hai joki database me exiest nhi krti hai to use ignore krdo eroor mat do  

const connectionToDB = async() =>{
    try {
        const {connection} = await mongoose.connect(process.env.MONGODB_URI || `localhost:27017`)

    if(connection){
        // console.log(connection);
        console.log(`Connected to MongoDB: ${connection.host}`);
    }
    } catch (error) {
        console.log(error);
        process.exit(1)           //yaha pe agr data base connect nhi hota to to ye exit kr jayega , kewki DB iske bina ham kuch nhi kr sakte hai 
    }
}

// connectionToDB()

export default connectionToDB;