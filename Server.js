const express=require("express")
const mongoose=require('mongoose')
const app =express()
const authRouter=require('./Router/Auth')


mongoose.connect('mongodb://127.0.0.1:27017/Nodemailer',{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
.then(()=>{console.log("DB connected")})
.catch((err)=>{console.log(err)})

app.use(express.json())
app.use('/auth',authRouter)

app.listen(3300,()=>{
    console.log("Server is running in 3300")
})

