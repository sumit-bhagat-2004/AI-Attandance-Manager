import React from 'react';

export default function ColorTest() {
    return (
        <div className="p-4 space-y-4">
            <h2 className="text-white text-xl font-bold">Color Test Component</h2>
            
            {/* Blue Mandatory */}
            <div 
                className="p-4 rounded-lg border-2"
                style={{
                    background: 'linear-gradient(135deg, rgb(37 99 235 / 0.9), rgb(6 182 212 / 0.7))',
                    borderColor: 'rgb(37, 99, 235)',
                    color: 'white'
                }}
            >
                <strong>Blue - Mandatory Class</strong>
                <p>This should be blue/cyan gradient</p>
            </div>
            
            {/* Gray Optional */}
            <div 
                className="p-4 rounded-lg border-2"
                style={{
                    background: 'linear-gradient(135deg, rgb(100 116 139 / 0.8), rgb(71 85 105 / 0.6))',
                    borderColor: 'rgb(100, 116, 139)',
                    color: 'white'
                }}
            >
                <strong>Gray - Optional Class</strong>
                <p>This should be slate/gray gradient</p>
            </div>
            
            {/* Green Makeup */}
            <div 
                className="p-4 rounded-lg border-2"
                style={{
                    background: 'linear-gradient(135deg, rgb(16 185 129 / 0.9), rgb(5 150 105 / 0.7))',
                    borderColor: 'rgb(16, 185, 129)',
                    color: 'white'
                }}
            >
                <strong>Green - Makeup Class</strong>
                <p>This should be emerald/green gradient</p>
            </div>
        </div>
    );
}
