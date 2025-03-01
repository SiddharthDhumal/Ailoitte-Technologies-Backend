import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../configs/cloudinary.js";

const storage = new CloudinaryStorage({
	cloudinary,
	params: {
		folder: "products", // Cloudinary folder name
		allowed_formats: ["jpg", "png", "jpeg"],
	},
});

const upload = multer({ storage });

export default upload;
