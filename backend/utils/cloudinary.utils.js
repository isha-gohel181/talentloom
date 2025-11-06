import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { cloudinaryAvatarRefer, cloudinaryPostRefer } from "./constants.utils.js";

// Load environment variables
dotenv.config();

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("Cloudinary config:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "SET" : "NOT SET",
    api_key: process.env.CLOUDINARY_API_KEY ? "SET" : "NOT SET",
    api_secret: process.env.CLOUDINARY_API_SECRET ? "SET" : "NOT SET"
});

const uploadOnCloudinary = async (localFilePath, refer = "", user = null, originalName = "") => {
    try {
        if (!localFilePath) {
            console.log("No file path provided");
            return "No file have uploaded";
        }
        
        console.log("Uploading file:", localFilePath, "Refer:", refer);
        
        // ✅ build custom filename
        let publicId = path.parse(originalName).name; // default: original file name (without ext)
        if (user?.fullName) {
            const safeName = user.fullName.replace(/\s+/g, "-"); // sanitize spaces
            const ext = path.extname(originalName);  // .png
            publicId = refer === cloudinaryAvatarRefer
                ? `${safeName}-avatar`
                : `${safeName}-file${ext}`;
        }

        // upload file(pdf) on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            folder: refer === cloudinaryAvatarRefer ? "TalentLoom/avatars" : 
                   refer === cloudinaryPostRefer ? "TalentLoom/posts" : "TalentLoom/files",
            resource_type: refer === cloudinaryAvatarRefer || refer === cloudinaryPostRefer ? "image" : "raw",
            public_id: publicId,    // ✅ custom name
            use_filename: true,     // ✅ keep original filename if no user provided
            unique_filename: false, // ✅ don't add random hash
            overwrite: true,
        });
        
        console.log("Cloudinary upload successful:", response.secure_url);
        return response;

    } catch (error) {
        console.error("Cloudinary upload error:", error);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    } finally {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
    }
}


const destroyOnCloudinary = async (imageId, refer = "") => {
    try {
        // upload file on cloudinary
        const response = await cloudinary.uploader.destroy(imageId, {
            folder: refer === cloudinaryAvatarRefer ? "TalentLoom/avatars" : 
                   refer === cloudinaryPostRefer ? "TalentLoom/posts" : "TalentLoom/files",
            resource_type: refer === cloudinaryAvatarRefer || refer === cloudinaryPostRefer ? "image" : "raw",
        });
        return response;

    } catch (error) {
        return null;
    } finally {
        return;
    }
}
export { uploadOnCloudinary, destroyOnCloudinary };