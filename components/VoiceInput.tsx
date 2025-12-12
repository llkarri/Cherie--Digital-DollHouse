import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
  placeholder?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, className, placeholder = "Describe your request..." }) => {
  const [isListening, setIsListening] = useState(false);
  const [supportError, setSupportError] = useState(false);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupportError(true);
    }
  }, []);

  const toggleListening = () => {
    if (supportError) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <button
      onClick={toggleListening}
      className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${
        isListening 
          ? 'bg-red-50 text-red-600 ring-2 ring-red-100 animate-pulse' 
          : 'bg-white text-noir-800 hover:bg-noir-50 border border-noir-300'
      } ${className}`}
      title="Speak request"
      type="button"
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  );
};

export default VoiceInput;
