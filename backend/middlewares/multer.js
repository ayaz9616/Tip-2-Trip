// Tip2Trip
import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        const isImage = /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype);
        if (isImage) cb(null, true);
        else cb(new Error('Only image files (jpeg, png, webp, gif) are allowed'));
    }
});

export default upload;
