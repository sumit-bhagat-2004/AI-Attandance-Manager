import clientPromise from '../../lib/mongodb';
import { getInitialState } from '../../lib/scheduleData';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    
    const { username, password, isLogin } = req.body;

    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ username });

        if (isLogin) {
            if (user && user.password === password) {
                res.status(200).json({ message: 'Login successful' });
            } else {
                res.status(401).json({ message: 'Invalid username or password' });
            }
        } else { // Registration
            if (user) {
                res.status(409).json({ message: 'Username already exists' });
            } else {
                await usersCollection.insertOne({ username, password });
                const attendanceCollection = db.collection('attendance');
                await attendanceCollection.insertOne(getInitialState(username));
                res.status(201).json({ message: 'User created successfully' });
            }
        }
    } catch (error) {
        console.error("Auth API Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
