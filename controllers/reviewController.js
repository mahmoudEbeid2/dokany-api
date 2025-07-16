import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// add review
export const addReview = async (req, res) => {

    const {productId} = req.params;
    const {  rating, comment } = req.body;
    const user= req.user;
    
    if(user.role!=="customer")
    return res.status(403).json({ error: "only customers can add review" });
    
    try {
      const review = await prisma.review.create({
        data: { 
            product_id: productId,
            customer_id: user.id,
            rating: parseInt(rating),
            comment 
        },
      });
      res.status(201).json({ message: "Review added successfully", review });
    } catch (error) {
      console.error("Error adding review:", error);
      res.status(500).json({ error: "Failed to add review" });
    }
  };

//   get  product reviews 
export const getProductReviews = async (req, res) => {
    const { productId } = req.params;
    try {
      const reviews = await prisma.review.findMany({
        where: { product_id: productId },
        include: { customer: {
            select:{
                f_name: true,
                l_name: true,
                profile_imge: true
            }
        } },
      });
      res.status(200).json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  };

//   delete review
export const deleteReview = async (req, res) => {
    const { reviewId } = req.params;
    const user = req.user;

    try {
      const review = await prisma.review.findUnique({ where: { id: reviewId } });
      if(!review) return res.status(404).json({ error: "Review not found" });

        // seller and customer can delete their own review
      if(review.customer_id !==user.id && user.role!=="seller")
      return res.status(403).json({ error: "Not authorized to delete this review" });
      await prisma.review.delete({ where: { id: reviewId } });

      res.status(200).json({ message: "Review deleted successfully", review });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ error: "Failed to delete review" });
    }
  };