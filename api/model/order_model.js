const mongoose=require('mongoose')


const orderSchema=mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    productId:{
        type:mongoose.Schema.Types.ObjectId,ref:'ProductModel',required:true},
    quantity:{type:Number,required:true},
});

module.exports=mongoose.model('orderModel',orderSchema)