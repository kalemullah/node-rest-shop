const express=require('express');
const router=express.Router();
const mongoose=require('mongoose');
const orderModel=require('../model/order_model')
const productmodel=require('../model/product_model');

router.get('/',(req,res,next)=>{
    console.log('order get');
    orderModel.find().select("productId quantity _id").exec().then(
        docs=>{
            if(docs.length>0){
                const response={
                    count:docs.length,
                    products:docs
                }
                res.status(200).json(response);
        }else{
            res.status(404).json({
                message:"No data found"
            });
        }
    }
    )
});
router.post('/',(req,res,next)=>{
     productmodel.findById(req.body.productId).then(
        product=>{
            const ordermodel=new orderModel({
                _id:new mongoose.Types.ObjectId(),
                productId:req.body.productId,
                quantity:req.body.quantity
            });
            return ordermodel.save();
        }
     ).then(
        result=>{
            console.log(result);
            res.status(200).json({
                message:"order created",
                order:{
                    productId:result.productId,
                    quantity:result.quantity,
                    _id:result._id,
                    request:{
                        type:'GET',
                        url:'http://localhost:3000/orders/'+result._id
                    } 
                }
            })
        }
         
    ).catch(err=>{
        console.log(err);
        res.status(500).json({
            message:"product is not pound",
            error:err
        })
    });   
   
});



router.get('/:orderid',(req,res,next)=>{
    const id=req.params.orderid;
    orderModel.findById(id)
    .select("productId quantity _id")
    .exec().then(
        doc=>{ 
            console.log(doc );
            res.status(200).json(doc)
        } 
    ).catch(err=>{
        console.log(err);
        res.status(500).json({
            error: err.message 
        });
    })
    });

router.delete('/:orderid',(req,res,next)=>{
    const id=req.params.orderid ;
    orderModel.findByIdAndDelete(id).exec()
    .then(result => {
        if (result) {
            res.status(200).json({
                message: "order deleted from the database",
                request:{
                    type:"Post",
                    url:"http://localhost:3000/order",
                    body:{name:"String",price:"Number"}
                }
                // deletedProduct: result // Optional: Send deleted product details in the response
            });
        } else {
            res.status(404).json({
                message: "Product not found"
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err.message // Send error message in case of any error
        });
    });
})

module.exports=router;


