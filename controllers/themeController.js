import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// get all themes
export const getThemes = async (req, res) => {
    try {
        const themes = await prisma.theme.findMany();
        res.status(200).json(themes);
    } catch (error) {
        console.error("Error fetching theme:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
};

// add theme
export const addTheme = async (req, res) => {
    const { name } = req.body;
    try {
        const theme = await prisma.theme.create({
            data: {
                name,
            },
        });
        res.status(201).json(theme);
    } catch (error) {
        console.error("Error adding theme:", error);
        res.status(500).json({ error: "Failed to add theme" });
    }
};