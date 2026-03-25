import dotenv from "dotenv"
import { app } from "./app.js"
import connectDB from "./database/database_config.js"

dotenv.config()

connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`)
            // trackFares()
            // setInterval(trackFares, 30 * 60 * 1000)
        })
    })
    .catch((error) => {
        console.log("ERROR NAME : ", error)
    })
