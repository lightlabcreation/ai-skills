import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: 'de1s1o9xc',
    api_key: '787335565981221',
    api_secret: 'NwuREaqQyJp06D4sQMiCzz7DSCM',
});

export const uploadCourseMedia = async (req, res, next) => {
    try {
        if (req.files?.course_image?.[0]) {
            const imageFile = req.files.course_image[0];
            const imageData = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString('base64')}`;
            const result = await cloudinary.uploader.upload(imageData, {
                resource_type: 'image',
            });
            req.uploadedImageUrl = result.secure_url;
        }

        if (req.files?.test_video?.[0]) {
            const videoFile = req.files.test_video[0];
            const videoData = `data:${videoFile.mimetype};base64,${videoFile.buffer.toString('base64')}`;
            const result = await cloudinary.uploader.upload(videoData, {
                resource_type: 'video',
            });
            req.uploadedVideoUrl = result.secure_url;
        }

        next();
    } catch (error) {
        return res.status(500).json({
            message: 'Image or Video upload failed',
            error: error.message,
        });
    }
};

export const validateCourseMediaSize = (req, res, next) => {
    const courseImage = req.files?.course_image?.[0];
    const testVideo = req.files?.test_video?.[0];

    const imageSize = courseImage ? courseImage.size : 0;
    const videoSize = testVideo ? testVideo.size : 0;

    const totalSize = imageSize + videoSize;
    const maxTotalSize = 10 * 1024 * 1024; // 10 MB

    if (totalSize > maxTotalSize) {
        return res.status(400).json({
            message: 'Total file size too large. Image + Video must be under 10MB.',
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2) + ' MB',
            maxAllowedMB: (maxTotalSize / (1024 * 1024)).toFixed(2) + ' MB'
        });
    }

    next();
};

