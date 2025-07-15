import prisma from "../config/db.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import cloudinary from "../utils/cloudinary.js";

// Get Customer by Token
export async function getCustomerByToken(req, res) {
  const role = req.user.role;
  if (!role === "customer")
    return res.status(403).json({ message: "Access denied. Customers only." });
  try {
    console.log("Decoded Token:", req.user);

    const id = req.user.id;

    const customer = await prisma.customer.findUnique({ where: { id } });

    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update Customer by Token
export const updateCustomerByToken = async (req, res) => {
  const id = req.user.id;
  const file = req.file;

  const role = req.user.role;
  if (!role === "customer")
    return res.status(403).json({ message: "Access denied. Customers only." });
  try {
    const customer = await prisma.customer.findUnique({ where: { id } });

    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    const updateData = { ...req.body };

    if (file) {
      const imageData = await uploadToCloudinary(file, "customer_profiles");
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

// Delete Customer by Token
export const deleteCustomerByToken = async (req, res) => {
  const id = req.user.id;

  const role = req.user.role;
  if (!role === "customer")
    return res.status(403).json({ message: "Access denied. Customers only." });

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
