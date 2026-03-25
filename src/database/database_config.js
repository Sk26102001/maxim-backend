import mongoose from 'mongoose'
const DB_NAME = 'maximTrip'

const connectDatabase = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        console.log(`\n mongodb connected !! DB HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log('Mongodb connection FAILED ', error)
        process.exit(1)
    }
}

export default connectDatabase
