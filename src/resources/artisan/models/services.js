import mongoose from 'mongoose';


const servicesSchema = new mongoose.Schema({
    artisanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artisan',
      },
    serviceName:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    }
},
{
    timestamps: true,
    versionKey: false,
  })

const Service = mongoose.model('Service', servicesSchema);

export default Service;
