const m = require('mongoose');
module.exports = m.model('Fertilizer', new m.Schema({name:{type:String,required:true,unique:true},
  nutrient:{type:String,enum:['Nitrogen','Phosphorus','Potassium','Organic Carbon'],required:true},
  composition:String,purpose:String,applicationMethod:String,quantity:String,description:String,precautions:String}));
