import mongoose from "mongoose";
import cloudinary from "../../../utils/helper/cloudinary.js";

const pastWorkPicSchema = new mongoose.Schema(
  {
    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artisan',
      required: true
    },
    cloudinaryPublicId: {
        type: String,
        required: true
      },
    image: {
      type: String,
      required: true,
      default:
          '',
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

pastWorkPicSchema.pre('remove', function (next) {
    const pic = this;
    cloudinary.uploader.destroy(pic.cloudinaryPublicId, function (error, result) {
      if (error) {
        console.error('Error deleting image from Cloudinary:', error);
      } else {
        console.log('Image deleted from Cloudinary:', result);
      }
      next(); // Call next to continue with the remove operation
    });
  });

const PastWorkPic= mongoose.model("PastWorkPic", pastWorkPicSchema);

export default PastWorkPic;
