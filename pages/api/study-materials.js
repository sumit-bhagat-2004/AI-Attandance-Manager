import clientPromise from '../../lib/mongodb';
import { subjects } from '../../lib/scheduleData';

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const topicsCollection = db.collection('class_topics');
        
        if (req.method === 'GET') {
            const { classCode } = req.query;
            
            if (!classCode) {
                return res.status(400).json({ message: 'Class code is required' });
            }
            
            // Get all materials for this class from all users
            const materials = await topicsCollection.find({ 
                classCode 
            }).sort({ date: -1, timestamp: -1 }).toArray();
            
            // Group materials by date and aggregate from multiple users
            const aggregatedMaterials = [];
            const dateGroups = {};
            
            materials.forEach(material => {
                const date = material.date;
                if (!dateGroups[date]) {
                    dateGroups[date] = {
                        date,
                        classCode,
                        subjectName: material.subjectName,
                        hints: [],
                        aiContents: [],
                        contributors: []
                    };
                }
                
                if (material.topicHint) {
                    dateGroups[date].hints.push({
                        hint: material.topicHint,
                        user: material.user,
                        timestamp: material.timestamp
                    });
                }
                
                if (material.aiContent) {
                    dateGroups[date].aiContents.push({
                        content: material.aiContent,
                        user: material.user,
                        timestamp: material.aiGeneratedAt || material.timestamp
                    });
                }
                
                if (!dateGroups[date].contributors.includes(material.user)) {
                    dateGroups[date].contributors.push(material.user);
                }
            });
            
            // Convert to array and create combined materials
            Object.values(dateGroups).forEach(group => {
                // If there are multiple hints for the same date, combine them
                if (group.hints.length > 0) {
                    const combinedHints = group.hints
                        .map(h => `${h.hint} (by ${h.user.split('.')[0]})`)
                        .join('\n\n');
                    
                    aggregatedMaterials.push({
                        date: group.date,
                        classCode: group.classCode,
                        subjectName: group.subjectName,
                        topicHint: combinedHints,
                        user: `${group.contributors.length} student${group.contributors.length !== 1 ? 's' : ''}`,
                        timestamp: Math.max(...group.hints.map(h => new Date(h.timestamp).getTime()))
                    });
                }
                
                // Add AI content (usually one per date, but could be multiple)
                group.aiContents.forEach(ai => {
                    aggregatedMaterials.push({
                        date: group.date,
                        classCode: group.classCode,
                        subjectName: group.subjectName,
                        aiContent: ai.content,
                        user: ai.user,
                        timestamp: ai.timestamp
                    });
                });
            });
            
            return res.status(200).json({ 
                materials: aggregatedMaterials.sort((a, b) => new Date(b.date) - new Date(a.date))
            });
            
        } else {
            return res.status(405).json({ message: 'Method not allowed' });
        }
        
    } catch (error) {
        console.error('Study Materials API Error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
