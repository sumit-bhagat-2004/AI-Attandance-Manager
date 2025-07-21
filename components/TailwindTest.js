import React from 'react';

export default function TailwindTest() {
    return (
        <div className="p-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl">
            <h1 className="text-4xl font-bold text-white mb-4">Tailwind CSS Test</h1>
            <div className="space-y-4">
                <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200">
                    Green Button
                </button>
                <button className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200">
                    Red Button
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200">
                    Gradient Button
                </button>
            </div>
        </div>
    );
}
