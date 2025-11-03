import { useState, useEffect } from 'react';

export const useTypingAnimation = (text: string, speed: number = 10) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (!text) {
            setDisplayedText('');
            setIsTyping(false);
            return;
        }

        setDisplayedText('');
        setIsTyping(true);
        let index = 0;
        const intervalId = setInterval(() => {
            if (index < text.length) {
                setDisplayedText(prev => prev + text.charAt(index));
                index++;
            } else {
                clearInterval(intervalId);
                setIsTyping(false);
            }
        }, speed);

        return () => clearInterval(intervalId);
    }, [text, speed]);

    return { displayedText, isTyping };
};