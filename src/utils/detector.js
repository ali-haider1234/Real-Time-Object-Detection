import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

/**
 * Load the COCO-SSD model
 * @returns {Promise<cocoSsd.ObjectDetection>}
 */
export async function loadModel() {
    try {
        const model = await cocoSsd.load({
            base: 'mobilenet_v2' // Using MobileNet V2 as specified
        });
        console.log('COCO-SSD Model loaded successfully');
        return model;
    } catch (error) {
        console.error('Error loading model:', error);
        throw error;
    }
}

/**
 * Run object detection on a video frame
 * @param {cocoSsd.ObjectDetection} model - The loaded model
 * @param {HTMLVideoElement} video - Video element
 * @returns {Promise<Array>} Array of predictions
 */
export async function detectFrame(model, video) {
    if (!model || !video) return [];

    try {
        // The model internally resizes to 300x300 for MobileNet
        const predictions = await model.detect(video);
        return predictions;
    } catch (error) {
        console.error('Error during detection:', error);
        return [];
    }
}

/**
 * Draw bounding boxes and labels on canvas
 * @param {Array} predictions - Array of detection results
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} videoWidth - Video width
 * @param {number} videoHeight - Video height
 */
export function drawDetections(predictions, ctx, videoWidth, videoHeight) {
    // Clear previous drawings
    ctx.clearRect(0, 0, videoWidth, videoHeight);

    // Set text and box styles
    ctx.font = '16px Arial';
    ctx.textBaseline = 'top';

    predictions.forEach(prediction => {
        const [x, y, width, height] = prediction.bbox;
        const label = prediction.class;
        const score = (prediction.score * 100).toFixed(1);

        // Draw bounding box
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);

        // Draw label background
        const text = `${label} ${score}%`;
        const textWidth = ctx.measureText(text).width;
        const textHeight = 20;

        ctx.fillStyle = '#00FF00';
        ctx.fillRect(x, y - textHeight, textWidth + 10, textHeight);

        // Draw label text
        ctx.fillStyle = '#000000';
        ctx.fillText(text, x + 5, y - textHeight + 2);
    });
}

/**
 * Calculate FPS
 * @param {Array} frameTimes - Array of recent frame timestamps
 * @returns {number} Current FPS
 */
export function calculateFPS(frameTimes) {
    if (frameTimes.length < 2) return 0;

    const recentFrames = frameTimes.slice(-30); // Use last 30 frames
    const totalTime = recentFrames[recentFrames.length - 1] - recentFrames[0];
    const fps = (recentFrames.length - 1) / (totalTime / 1000);

    return Math.round(fps);
}
