const express=require('express');
const app=express();
const morgan=require('morgan');///log the request 
const productRoutes=require('./api/routes/product');
const userRoutes=require('./api/routes/user');
const orderRoutes=require('./api/routes/order');
const bodyparser=require('body-parser');
const mongoose=require('mongoose');

const http =require('http');

const port= process.env.PORT ||3000;

const server=http.createServer(app);


server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
//this block will handle the log
app.use(morgan('dev'))
///simple data getting
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());

//this block will handle the cors error
app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if(req.method==='OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT,POST,PATCH,DELETE,GET');
        return res.status(200).json({});
    }
    next();
})

//mongodb+srv://kaleemchd403:<password>@cluster0.2bw9cit.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
mongoose.connect("mongodb+srv://kaleemchd403:" + process.env.MONGO_ATLAS_PW +"@cluster0.2bw9cit.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(result=>{
    console.log('app connedted to the database');
});

app.use('/products',productRoutes);
app.use('/orders',orderRoutes);
app.use('/user',userRoutes);


///if the rout is not found then the error error will through
app.use((req,res,next)=>{
    const error=new Error('not found');
    error.status=404;
    next(error);
});

//this block will handle the databse error
app.use((error,req,res,next)=>{
    res.status(error.status||500);
    res.json({
        error:{
            message:error.message
        }
    });
})
module.exports=app;