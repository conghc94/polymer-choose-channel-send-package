import React from 'react'

export const Loading = ({ size }) => {
    return (
        <div className="fixed inset-0 flex justify-center items-center">
            <div
                style={{ width: `${size}px`, height: `${size}px` }}
                className="animate-spin">
                <div className="h-full w-full border-4 border-t-purple-500
            border-b-purple-700 rounded-full">
                </div>
            </div>
        </div>
    );
}
