import prisma from "../config/db.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import cloudinary from "../utils/cloudinary.js";

// Get customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({ where: { id } });

    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update customer by ID
export const updateCustomerById = async (req, res) => {
  const { id } = req.params;
  const file = req.file;

  try {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    const updateData = { ...req.body };
    if (file) {
      const imageData = await uploadToCloudinary(file, "customer_profiles");
      console.log(imageData);
      if (customer.image_public_id) {
        await cloudinary.uploader.destroy(customer.image_public_id);
      }

      updateData.profile_imge = imageData.url;
      updateData.image_public_id = imageData.public_id;
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete customer by ID
export const deleteCustomerById = async (req, res) => {
  const { id } = req.params;

  try {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    await prisma.customer.delete({ where: { id } });

    if (customer.image_public_id) {
      await cloudinary.uploader.destroy(customer.image_public_id);
    }

    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
