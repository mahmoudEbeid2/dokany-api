import cloudinary from "./cloudinary.js";
import fs from "fs";

export const uploadToCloudinary = async (files, folder = "uploads") => {
  const fileArray = Array.isArray(files) ? files : [files];
  const uploaded = [];

  for (const file of fileArray) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
    });

    fs.unlinkSync(file.path);

    uploaded.push({
      url: result.secure_url,
      public_id: result.public_id,
    });
  }

  return uploaded;
};
