const express = require("express")
require('dotenv').config()
const { connection } = require("./config/db")
const { userRouter } = require("./routes/User.routes")
const { productRouter } = require("./routes/Products.routes")
const { UserModel } = require("./models/User.models")
const cors = require("cors")
const bodyParser =  require('body-parser')

const app = express()
app.use(express.json())
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Home-Page of EasyShop_the shopping hub")
})
app.get("/alluserdata", (req, res) => {
     const users = UserModel.find();
    res.send(users)

});
app.use("/users",userRouter)
app.use("/products",productRouter);

app.listen(process.env.port, async () => {

    try {
        await connection
        console.log("Connected Succesfully to DataBase")

    } catch (err) {
        console.log("Not Connected to DataBase")
    }
    console.log(`Server runs at ${process.env.port}`)
})