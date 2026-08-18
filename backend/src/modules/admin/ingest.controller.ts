import { Request, Response } from 'express';
import { IngestionWorker, CandidateVideoPayload } from '../../workers/ingestionWorker.js';

export async function triggerIngestionBatch(req: Request, res: Response): Promise<void> {
  try {
    const candidates: CandidateVideoPayload[] = req.body.candidates || [
      {
        youtube_video_id: '3WLaDHYuOEU',
        title: 'Fractions Are Parts of a Whole',
        channel_name: 'MathAntics',
        channel_id: 'UC4a-Gbdw7vOaccHmFo40b9g',
        duration_seconds: 180,
        thumbnail_url: 'https://img.youtube.com/vi/3WLaDHYuOEU/hqdefault.jpg',
        description: 'Learn what fractions mean, numerators, denominators, and parts of a whole in this fun math video.',
        raw_transcript: 'Welcome to MathAntics! Today we are learning about fractions. A fraction shows a part of a whole thing. The top number is called the numerator and the bottom number is called the denominator.'
      },
      {
        youtube_video_id: 'KnP02qV4p1Q',
        title: 'Numerator and Denominator Explained',
        channel_name: 'SciShow Kids',
        channel_id: 'UCib8Z5b7B8-zKLtda05tH1w',
        duration_seconds: 210,
        thumbnail_url: 'https://img.youtube.com/vi/KnP02qV4p1Q/hqdefault.jpg',
        description: 'Jessi and Squeaks explain numerators and denominators using pizza slices.',
        raw_transcript: 'Hi everyone! In this lesson we explore how numerators count slices of pizza and denominators tell us how many total equal slices there are in a full pizza pie.'
      },
      {
        youtube_video_id: 'Qd6nLM2A8EY',
        title: 'Solar System 101 for Kids',
        channel_name: 'National Geographic Kids',
        channel_id: 'UCXVCgPdnv6H5zup-Z1nNnpA',
        duration_seconds: 240,
        thumbnail_url: 'https://img.youtube.com/vi/Qd6nLM2A8EY/hqdefault.jpg',
        description: 'Discover the planets orbiting our Sun in our solar system.',
        raw_transcript: 'Our solar system consists of our central star, the Sun, and everything bound to it by gravity. The eight planets are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune.'
      }
    ];

    const result = await IngestionWorker.processVideoBatch(candidates);
    res.json({
      status: 'success',
      message: 'Ingestion batch processed successfully',
      result
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process ingestion batch', details: err.message });
  }
}
