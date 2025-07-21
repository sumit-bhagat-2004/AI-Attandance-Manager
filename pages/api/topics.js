import clientPromise from '../../lib/mongodb';
import { subjects } from '../../lib/scheduleData';

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const topicsCollection = db.collection('class_topics');
        
        if (req.method === 'POST') {
            const { action, payload } = req.body;
            
            if (action === 'store_topic_hint') {
                const { user, classCode, date, topicHint } = payload;
                
                if (!user || !classCode || !date || !topicHint) {
                    return res.status(400).json({ message: 'Missing required fields' });
                }
                
                // Create or update the topic entry
                const topicEntry = {
                    user,
                    classCode,
                    subjectName: subjects[classCode]?.name || classCode,
                    date,
                    topicHint: topicHint.trim(),
                    timestamp: new Date(),
                };
                
                await topicsCollection.replaceOne(
                    { user, classCode, date },
                    topicEntry,
                    { upsert: true }
                );
                
                return res.status(200).json({ message: 'Topic hint stored successfully', topicEntry });
            }
            
            if (action === 'store_ai_content') {
                const { user, classCode, date, aiContent, topicHint } = payload;
                
                if (!user || !classCode || !date || !aiContent) {
                    return res.status(400).json({ message: 'Missing required fields' });
                }
                
                // Store or update the AI generated content
                const updateData = {
                    user,
                    classCode,
                    subjectName: subjects[classCode]?.name || classCode,
                    date,
                    aiContent: aiContent.trim(),
                    aiGeneratedAt: new Date(),
                };
                
                if (topicHint) {
                    updateData.topicHint = topicHint.trim();
                }
                
                await topicsCollection.updateOne(
                    { user, classCode, date },
                    { $set: updateData },
                    { upsert: true }
                );
                
                return res.status(200).json({ message: 'AI content stored successfully' });
            }
            
            if (action === 'get_collective_materials') {
                const { classCode, date } = payload;
                
                if (!classCode) {
                    return res.status(400).json({ message: 'Class code is required' });
                }
                
                // Build the query
                const query = { classCode };
                if (date) {
                    query.date = date;
                }
                
                // Get all contributions for this class/date from all users
                const allMaterials = await topicsCollection.find(query)
                    .sort({ date: -1, timestamp: -1 }).toArray();
                
                // Group by date and aggregate hints
                const groupedMaterials = {};
                
                allMaterials.forEach(material => {
                    const dateKey = material.date;
                    
                    if (!groupedMaterials[dateKey]) {
                        groupedMaterials[dateKey] = {
                            date: dateKey,
                            classCode: material.classCode,
                            subjectName: material.subjectName,
                            userHints: [],
                            aiContent: null,
                            contributors: new Set(),
                            lastUpdated: material.timestamp
                        };
                    }
                    
                    if (material.topicHint) {
                        groupedMaterials[dateKey].userHints.push({
                            hint: material.topicHint,
                            user: material.user,
                            timestamp: material.timestamp
                        });
                    }
                    
                    if (material.aiContent) {
                        groupedMaterials[dateKey].aiContent = material.aiContent;
                    }
                    
                    groupedMaterials[dateKey].contributors.add(material.user);
                    
                    if (new Date(material.timestamp) > new Date(groupedMaterials[dateKey].lastUpdated)) {
                        groupedMaterials[dateKey].lastUpdated = material.timestamp;
                    }
                });
                
                // Convert sets to arrays and format the response
                const collectiveMaterials = Object.values(groupedMaterials).map(group => ({
                    ...group,
                    contributors: Array.from(group.contributors),
                    contributorCount: group.contributors.size,
                    hintCount: group.userHints.length,
                    hasAIContent: !!group.aiContent
                }));
                
                return res.status(200).json({ 
                    materials: collectiveMaterials.sort((a, b) => new Date(b.date) - new Date(a.date))
                });
            }
            
            return res.status(400).json({ message: 'Invalid action' });
            
        } else if (req.method === 'GET') {
            const { user, date, classCode, dateRange } = req.query;
            
            if (dateRange) {
                // Handle date range queries for weekly reports
                const [startDate, endDate] = dateRange.split('_');
                const topics = await topicsCollection.find({ 
                    user,
                    date: { $gte: startDate, $lte: endDate }
                }).sort({ date: 1, timestamp: -1 }).toArray();
                
                return res.status(200).json({ topics });
            } else if (date) {
                // Get all topics for a specific date
                const topics = await topicsCollection.find({ 
                    user, 
                    date 
                }).sort({ timestamp: -1 }).toArray();
                
                return res.status(200).json({ topics });
            } else if (classCode) {
                // Get all topics for a specific class
                const topics = await topicsCollection.find({ 
                    user, 
                    classCode 
                }).sort({ date: -1 }).toArray();
                
                return res.status(200).json({ topics });
            } else {
                // Get all topics for user
                const topics = await topicsCollection.find({ user })
                    .sort({ date: -1, timestamp: -1 }).toArray();
                
                return res.status(200).json({ topics });
            }
            
        } else {
            return res.status(405).json({ message: 'Method not allowed' });
        }
        
    } catch (error) {
        console.error('Topics API Error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
