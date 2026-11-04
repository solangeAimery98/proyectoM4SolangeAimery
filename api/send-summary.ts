/**
 * Serverless function / API endpoint example for sending task summaries.
 * (e.g., Vercel Serverless Function or Node.js backend handler)
 */

export interface SummaryRequest {
  userId: string;
  email: string;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId, email }: SummaryRequest = req.body;

  if (!userId || !email) {
    return res.status(400).json({ message: 'Missing userId or email' });
  }

  try {
    // Logic to fetch user tasks and send email summary
    console.log(`Sending summary for user ${userId} to ${email}`);

    return res.status(200).json({
      success: true,
      message: `Summary sent successfully to ${email}`,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || 'Failed to send summary',
    });
  }
}

