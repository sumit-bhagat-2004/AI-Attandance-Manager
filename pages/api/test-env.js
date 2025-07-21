export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    
    try {
        const hasGeminiKey = !!process.env.GEMINI_API_KEY;
        const keyLength = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0;
        
        return res.status(200).json({
            hasGeminiKey,
            keyLength,
            keyPreview: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'N/A',
            nodeEnv: process.env.NODE_ENV,
            allEnvKeys: Object.keys(process.env).filter(key => key.includes('GEMINI')),
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
