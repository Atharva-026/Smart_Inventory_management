import express from "express";
import QRCode from "qrcode";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Generate QR code for printing (Admin only)
router.post("/generate", protect, adminOnly, async (req, res) => {
  try {
    const { itemCode, itemName } = req.body;
    
    if (!itemCode) {
      return res.status(400).json({ message: "Item code is required" });
    }

    // Generate QR code as base64 image with high error correction
    const qrImageBase64 = await QRCode.toDataURL(itemCode, {
      errorCorrectionLevel: 'H', // High error correction
      type: 'image/png',
      width: 300,
      margin: 2
    });

    res.json({
      message: "QR Code generated successfully",
      itemCode: itemCode,
      itemName: itemName || "Unnamed Item",
      qrImage: qrImageBase64,
      instructions: "Save or print this QR code and stick it on the physical item"
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating QR code", error: error.message });
  }
});

// Generate multiple QR codes at once (Admin only)
router.post("/generate-bulk", protect, adminOnly, async (req, res) => {
  try {
    const { items } = req.body; // Array of {itemCode, itemName}
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items array is required" });
    }

    const qrCodes = await Promise.all(
      items.map(async (item) => {
        const qrImage = await QRCode.toDataURL(item.itemCode, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 300,
          margin: 2
        });
        
        return {
          itemCode: item.itemCode,
          itemName: item.itemName || "Unnamed Item",
          qrImage
        };
      })
    );

    res.json({
      message: `${qrCodes.length} QR Codes generated successfully`,
      qrCodes
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating QR codes", error: error.message });
  }
});

export default router;