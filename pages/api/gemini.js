import { subjects } from '../../lib/scheduleData';

async function callGemini(prompt) {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) throw new Error("GEMINI_API_KEY is not set on the server.");
    
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 8192,  // Increased for longer responses
                candidateCount: 1
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        })
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`Gemini API Error: ${errorBody.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { type, payload } = req.body;

    try {
        let prompt;
        let result;

        if (type === 'weeklyReport') {
            const { history } = payload;
            const lastSevenDays = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(new Date().getDate() - i);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            });
            const weeklyHistory = lastSevenDays.reduce((acc, dateStr) => (history[dateStr] ? { ...acc, [dateStr]: history[dateStr] } : acc), {});
            
            let attendedClasses = [], skippedClasses = [];
            for (const date in weeklyHistory) {
                for (const classCode in weeklyHistory[date]) {
                    const subjectName = subjects[classCode]?.name || classCode;
                    if (weeklyHistory[date][classCode] === 'attended') attendedClasses.push(subjectName);
                    else skippedClasses.push(subjectName);
                }
            }
            
            // Use the provided custom prompt if available, otherwise generate comprehensive default
            if (payload.customPrompt) {
                prompt = payload.customPrompt;
            } else {
                // Generate comprehensive detailed prompt for weekly report
                const attendedList = [...new Set(attendedClasses)];
                const skippedList = [...new Set(skippedClasses)];
                const totalAttended = attendedClasses.length;
                const totalSkipped = skippedClasses.length;
                const totalClasses = totalAttended + totalSkipped;
                const attendancePercentage = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(1) : 0;
                
                prompt = `You are an expert academic advisor and motivational coach. Create an EXTREMELY DETAILED, COMPREHENSIVE, and LONG weekly academic performance analysis and study plan. This report must be substantial - minimum 2000 words with extensive detail in every section.

**WEEKLY ATTENDANCE ANALYSIS:**
• Total Classes This Week: ${totalClasses}
• Classes Attended: ${totalAttended} (${attendancePercentage}%)
• Classes Missed: ${totalSkipped}
• Attended Subjects: ${attendedList.join(', ') || 'None this week'}
• Missed Subjects: ${skippedList.join(', ') || 'None this week'}

**MANDATORY COMPREHENSIVE SECTIONS TO INCLUDE:**

**1. DETAILED PERFORMANCE OVERVIEW (Minimum 400 words):**
- Analyze the ${attendancePercentage}% attendance rate in detail
- Compare to ideal 90%+ attendance standards
- Discuss impact of ${totalSkipped} missed classes on academic progress
- Provide detailed assessment of attendance pattern and trends
- Address specific concerns about missed subjects: ${skippedList.join(', ') || 'None'}

**2. SUBJECT-BY-SUBJECT DETAILED ANALYSIS (Minimum 600 words):**
For each attended subject (${attendedList.join(', ')}):
- Praise consistent attendance and engagement
- Discuss learning benefits gained from attendance
- Suggest ways to maximize learning from these classes
- Provide subject-specific study enhancement strategies

For each missed subject (${skippedList.join(', ') || 'None'}):
- Analyze the academic impact of missing these specific classes
- Identify potential knowledge gaps created
- Provide detailed catch-up strategies for each subject
- Suggest specific resources and study materials needed

**3. COMPREHENSIVE RECOVERY PLAN FOR MISSED CLASSES (Minimum 500 words):**
- Create detailed catch-up schedule for ${totalSkipped} missed classes
- Specify exactly what topics/content likely covered in missed classes
- Provide step-by-step recovery strategies for each missed subject
- Include timeline for completing catch-up work
- Suggest peer study groups and professor office hours
- Recommend specific study materials and resources

**4. DETAILED WEEKLY STUDY SCHEDULE (Minimum 600 words):**
Create hour-by-hour study plan including:
- Daily schedule from Monday to Sunday
- Specific time slots for each subject
- Extra time allocation for missed subjects
- Break times and recreational activities
- Weekend intensive study sessions
- Review and practice test schedules

**5. ATTENDANCE IMPROVEMENT STRATEGY (Minimum 400 words):**
- Root cause analysis of why classes were missed
- Specific prevention strategies for future
- Accountability systems and tracking methods
- Motivation techniques and goal setting
- Support system recommendations
- Contingency plans for unavoidable absences

**6. MOTIVATIONAL AND PERSONAL DEVELOPMENT (Minimum 300 words):**
- Personal achievements recognition this week
- Growth mindset development strategies
- Future career vision connection
- Daily motivation techniques and affirmations
- Success visualization exercises
- Confidence building strategies

**7. RESOURCE RECOMMENDATIONS (Minimum 200 words):**
- Specific textbooks and study materials
- Online resources and educational platforms
- Study apps and productivity tools
- Peer study group formation strategies
- Faculty support and office hours utilization

**MANDATORY FORMATTING REQUIREMENTS:**
- Use proper markdown formatting with headers, bullet points, bold text
- Include emojis and visual elements for engagement
- Address the student directly throughout
- Provide specific, actionable advice with deadlines
- Include both short-term (this week) and long-term (semester) guidance
- Make it personal, encouraging, and motivational
- Total response must be minimum 2000 words

Remember: This is a comprehensive academic roadmap. Make it detailed, inspiring, and actionable with extensive study plans and recovery strategies.`;
            }
            
            result = await callGemini(prompt);

        } else if (type === 'classTopics') {
            const { classCode, hint, user, date } = payload;
            const subjectName = subjects[classCode].name;
            
            if (hint && hint.trim()) {
                // Use the provided hint to generate more targeted topics
                prompt = `As an academic instructor, generate 4-6 key topics and concepts for an undergraduate lecture on "${subjectName}".
                
                Student's hint about today's content: "${hint.trim()}"
                
                Based on this hint, provide relevant topics that would likely be covered. Format as a bulleted list with brief explanations for each topic.`;
            } else {
                // Default prompt without hint
                prompt = `List 4-6 key topics and concepts for an undergraduate lecture on "${subjectName}". Provide practical and relevant topics that students typically study in this subject. Format as a bulleted list with brief explanations for each topic.`;
            }
            
            result = await callGemini(prompt);
            
            // If user and date are provided, store the AI content and hint separately
            if (user && date) {
                // We'll handle storage in a separate API call from the client
                console.log(`📚 AI Topics generated for ${user} - ${classCode} on ${date}`);
            }
            
        } else if (type === 'validateHint') {
            const { classCode, subjectName, hint, context } = payload;
            
            prompt = `As an academic content validator, analyze this student's class hint for accuracy and appropriateness:
            
            Subject: ${subjectName}
            Student's Hint: "${hint}"
            Context: ${context}
            
            Evaluate if this hint is:
            1. Academically appropriate for ${subjectName}
            2. Likely to be accurate and helpful
            3. Free from misleading or inappropriate content
            
            Respond with either:
            - "APPROPRIATE: This hint appears accurate and helpful for ${subjectName}"
            - "INAPPROPRIATE: [Brief reason why this hint may be misleading or inaccurate]"
            
            Be strict but fair in your evaluation.`;
            
            result = await callGemini(prompt);
            
        } else if (type === 'generateStudyMaterial') {
            const { classCode, subjectName, topicHint, date, studentLevel } = payload;
            
            prompt = `As an educational content creator, generate comprehensive study materials for:
            
            Subject: ${subjectName}
            Topic/Hint: "${topicHint}"
            Student Level: ${studentLevel || 'undergraduate'}
            Date: ${date}
            
            Create detailed study materials including:
            1. **Key Concepts** - Core ideas and definitions
            2. **Important Points** - Critical information to remember
            3. **Examples** - Practical applications or cases
            4. **Study Tips** - How to effectively learn this material
            5. **Practice Questions** - Self-assessment questions
            6. **Additional Resources** - Suggested further reading or practice
            
            Format in clear, structured Markdown. Make it comprehensive but student-friendly.
            Focus on practical understanding and exam preparation.`;
            
            result = await callGemini(prompt);
        } else {
            return res.status(400).json({ message: 'Invalid request type' });
        }

        res.status(200).json({ result });

    } catch (error) {
        console.error('Gemini API Route Error:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
}
