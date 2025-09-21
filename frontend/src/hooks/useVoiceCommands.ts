import { useState, useEffect, useCallback } from 'react';

interface VoiceCommandState {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
}

interface VoiceCommandOptions {
  onCommand?: (command: string) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export function useVoiceCommands(options: VoiceCommandOptions = {}) {
  const [state, setState] = useState<VoiceCommandState>({
    isListening: false,
    transcript: '',
    isSupported: false,
    error: null
  });

  const {
    onCommand,
    onError,
    continuous = true,
    interimResults = true,
    maxAlternatives = 1
  } = options;

  // Check if speech recognition is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    setState(prev => ({
      ...prev,
      isSupported: !!SpeechRecognition
    }));
  }, []);

  const startListening = useCallback(() => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Speech recognition not supported in this browser'
      }));
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = maxAlternatives;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setState(prev => ({
        ...prev,
        isListening: true,
        error: null
      }));
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setState(prev => ({
        ...prev,
        transcript: currentTranscript
      }));

      if (finalTranscript && onCommand) {
        onCommand(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      const error = `Speech recognition error: ${event.error}`;
      setState(prev => ({
        ...prev,
        isListening: false,
        error
      }));
      
      if (onError) {
        onError(error);
      }
    };

    recognition.onend = () => {
      setState(prev => ({
        ...prev,
        isListening: false
      }));
    };

    try {
      recognition.start();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to start speech recognition'
      }));
    }
  }, [state.isSupported, continuous, interimResults, maxAlternatives, onCommand, onError]);

  const stopListening = useCallback(() => {
    setState(prev => ({
      ...prev,
      isListening: false
    }));
  }, []);

  const clearTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: ''
    }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    clearTranscript
  };
}

