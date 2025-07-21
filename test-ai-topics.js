// This is a temporary test file to debug the AI Topics feature
import { subjects } from '../lib/scheduleData';

const testGeminiAPI = async () => {
    try {
        console.log('🧪 Testing AI Topics Generator...');
        
        const payload = {
            classCode: 'CS-EC401',
            hint: 'We covered pipelining today'
        };
        
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'classTopics', payload }),
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
            console.log('✅ AI Topics working!');
            console.log('Generated content:', data.result);
        } else {
            console.log('❌ AI Topics failed:', data.message);
        }
        
    } catch (error) {
        console.error('🚨 Test error:', error);
    }
};

// Auto-run test when this script is loaded
if (typeof window !== 'undefined') {
    console.log('🔧 AI Topics Test Script Loaded');
    // Make the test function available globally
    window.testAITopics = testGeminiAPI;
    
    // Show instructions
    console.log('Run "testAITopics()" in the browser console to test AI Topics generation');
}
