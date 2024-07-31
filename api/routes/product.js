const express=require('express');
const router=express.Router();
const ProductModel=require('../model/product_model');
const mongoose=require('mongoose');
const checkauth=require('../middleware/check_auth')

router.get('/',(req,res,next)=>{
    console.log('this is get request');
    ProductModel.find().select("name price _id").exec().then(
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


router.post('/',checkauth,(req,res,next)=>{
    console.log('Request body:', req.body);
    const product=ProductModel({
        _id:new mongoose.Types.ObjectId(),
        name:req.body.name,
        price:req.body.price
    });
    product.save().then( 
        result=>{
            console.log('data added to the database');
            console.log(result);
            res.status(200).json({
                message:"Product added to the database",
                createdProduct:{
                    name:result.name,
                    price:result.price,
                    _id:result._id,
                    request:{
                        type:'GET',
                        url:'http://localhost:3000/products/'+result._id
                    }
                }
            })
        }
    ).catch(err=>console.log(err));
   
});

router.get('/:productid',(req,res,next)=>{
const id=req.params.productid;
console.log(id);
ProductModel.findById(id).select("name price _id").exec().then(
    doc=>{ 
        console.log(doc );
        res.status(200).json(doc)
    }
).catch(err=>{
    console.log(err)
    res.status(500).json({
        error: err 
    });
});
});

router.patch('/:productid',(req,res,next)=>{
    const id=req.params.productid;
    const updateOps={};
    for(const ops of req.body){
        updateOps[ops.propName]=ops.value;
    }
    ProductModel.findOneAndUpdate({_id:id},{$set:updateOps},).exec().then(
        result=>{
            console.log(result);
            res.status(200).json({
                message:"product updated in the database",
                request:{
                    type:'GET',
                    url:'http://localhost:3000/products/'+id
                }
            })
        }
    ).catch(err=>console.log(err));
   
})



router.delete('/:productid',(req,res,next)=>{
    const id=req.params.productid;

    ProductModel.findByIdAndDelete(id).exec()
    .then(result => {
        if (result) {
            res.status(200).json({
                message: "Product deleted from the database",
                request:{
                    type:"Post",
                    url:"http://localhost:3000/products",
                    body:{name:"String",price:"Number"}
                }            });
        } else {
            res.status(404).json({
                message: "Product not found"
            });
        }
    })
    .catch(err => {
        if (err.kind === 'ObjectId' || err.name === 'CastError') {
            res.status(400).json({
                message: "Invalid product ID format"
            });
        } else {
            console.error(err);
            res.status(500).json({
                message: "Internal server error",
                error: err.message // Send error message in case of any other error
            });
        }
    });
})

module.exports=router;


