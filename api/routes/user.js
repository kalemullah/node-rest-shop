const express=require('express');
const router=express.Router();
const userModel=require('../model/user_model');
const mongoose=require('mongoose');
const bcrypt=require('bcrypt'); 
const jwt=require('jsonwebtoken')

router.get('/', (req, res, next) => {
    console.log('get user');
    userModel.find().exec().then(
        docs => {
            if (docs.length > 0) {
                const response = {
                    count: docs.length,
                    products: docs
                }
                res.status(200).json(response);
            } else {
                res.status(404).json({
                    message: "No user found"
                });
            }
        }
    )
});


router.post('/signup',(req,res,next)=>{
    userModel.find({ email:req.body.email }).then(user=>{
        if(user.length>=1){
            console.log('this is user exite message' + user);
            return res.status(409).json({
                message:"email already exist"
            })
        }else{
            bcrypt.hash(req.body.password,10,(err,hash)=>{
                if(err){
                    console.log('data saving to the database:' + user);
                    return res.status(500).json({
                        error:{
                            message:err
                        }
                    })
                }else{
            const user=userModel({
                _id:new mongoose.Types.ObjectId(),
                email:req.body.email,
                password:hash
            });
            console.log('data saving to the database:' + user);
            user.save().then( 
                result=>{
                    console.log('user signup to the database');
                    console.log(result);
                    res.status(200).json({
                        message:"user signup to the database",
                        userdata:{
                            email:result.email,
                            _id:result._id,
                          
                        }
                    })
                }
            ).catch(
                err=>{
                    console.log(err);
                    res.status(500).json({
                        message:"user is not signup",
                        error:err
                    })
                
                });
                }
             })
        }
    })  
   
});


///login

router.post('/login',(req,res,next)=>{
    console.log('Request body:', req.body); 
    userModel.find({email:req.body.email}).then(user=>{
        if(user.length<1){
            return res.status(401).json({
                message:"user not found"
            })}
        bcrypt.compare(req.body.password,user[0].password,(err,result)=>{
            if(err){
                return  res.status(401).json({
                    message:"auth failed"
                })
            }
            if(result){
             const token=   jwt.sign({
                    email:user[0].email,
                    userid:user[0]._id,
                },process.env.JWT_KEY,
                {
                    expiresIn:"1h"
                }
                   
                );  
               return res.status(200).json({
                    message:"auth successful",
                    token:token
                })
            }
            return res.status(401).json({
                message:"auth failed"
        });
    });
     
}).catch(err=>{
    console.log(err);
    return  res.status(500).json({
        error:err
    })
});
});

router.delete('/:userid',(req,res,next)=>{
    const id=req.params.userid;

    userModel.findByIdAndDelete(id).then(result=>{ 
        if(result){
            res.status(200).json({
                message:"user deleted",  })
        } else{
            res.status(404).json({
                message:"user not found"
            })
        }
    }).catch(
        err=>{
            console.log(err);
            res.status(500).json({
                message:"user is not deleted",
                error:err,
            })
        }
    )
});


module.exports=router;