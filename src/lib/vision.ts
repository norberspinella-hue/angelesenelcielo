import { ImageAnnotatorClient } from '@google-cloud/vision'

export const visionClient = new ImageAnnotatorClient({
  apiKey: process.env.GOOGLE_VISION_API_KEY,
})
