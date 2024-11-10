import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.CLOUDINARY_CLOUD_NAME) {
  throw new Error(
    'The CLOUDINARY_CLOUD_NAME environment variable is not defined'
  );
}
if (!process.env.CLOUDINARY_API_KEY) {
  throw new Error('The CLOUDINARY_API_KEY environment variable is not defined');
}
if (!process.env.CLOUDINARY_API_SECRET) {
  throw new Error(
    'The CLOUDINARY_API_SECRET environment variable is not defined'
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
