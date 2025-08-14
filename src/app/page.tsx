"use client";
import { useEffect, useRef, useState } from "react";
import { LANGUAGES, getLabel } from "@/lib/languages";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import toast, { Toaster } from "react-hot-toast";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Copy, 
  Globe, 
  Languages, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Heart,
  Stethoscope,
  MessageSquare
} from "lucide-react";

// Web Speech API types
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((event: Event) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export default function Page() {
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");

  const [listening, setListening] = useState(false);
  const [original, setOriginal] = useState(""); // live transcript
  const debouncedOriginal = useDebouncedValue(original, 600);

  const [translated, setTranslated] = useState("");

  // Speech recognition setup
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // We'll create fresh recognition instances in toggleMic instead
  // This useEffect is no longer needed since we create instances on-demand

  const toggleMic = () => {
    if (listening) {
      // Stop recording
      const rec = recognitionRef.current;
      if (rec) {
        try {
          rec.stop();
        } catch (e) {
          console.log("Error stopping recognition:", e);
        }
      }
      setListening(false);
    } else {
      // Start recording
      const SR = typeof window !== "undefined" &&
        ((window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition);
      
      if (!SR) {
        toast.error("Speech Recognition not supported. Use manual typing.");
        return;
      }

      // Create a fresh recognition instance
      const rec = new SR() as SpeechRecognition;
      rec.continuous = true; // Keep it continuous for better sentence completion
      rec.interimResults = true; // Enable interim results to capture complete sentences
      
      try {
        rec.lang = sourceLang;
      } catch (e) {
        console.log("Error setting language:", e);
      }

      rec.onresult = (e: SpeechRecognitionEvent) => {
        let finalText = "";
        let interimText = "";
        
        // Separate final and interim results
        for (let i = 0; i < e.results.length; i++) {
          const result = e.results[i];
          const transcript = result[0].transcript;
          
          if (result.isFinal) {
            finalText += transcript + " ";
          } else {
            interimText += transcript + " ";
          }
        }
        
        // Update with both final and interim text for better user experience
        const displayText = (finalText + interimText).trim();
        setOriginal(displayText);
      };

      rec.onerror = (e: SpeechRecognitionErrorEvent) => {
        console.log("Speech recognition error:", e.error);
        if (e.error === 'no-speech') {
          // This is normal, just ignore
          return;
        }
        if (e.error === 'speech-not-recognized') {
          toast.error("Speech not recognized clearly. Try speaking more slowly or use manual typing.");
          return;
        }
        if (e.error === 'audio-capture') {
          toast.error("No microphone detected. Please check your microphone.");
          setListening(false);
          return;
        }
        toast.error(`Microphone error: ${e.error}`);
        setListening(false);
      };

      rec.onend = () => {
        // If we're still supposed to be listening, restart after a short delay
        if (listening) {
          setTimeout(() => {
            try {
              rec.start();
            } catch (e) {
              console.log("Error restarting recognition:", e);
              setListening(false);
            }
          }, 100); // Small delay to prevent rapid restarts
        }
      };

      // Store the new instance
      recognitionRef.current = rec;
      
              // Clear previous text and start
        setOriginal("");
        setTranslated("");
      
      try {
        rec.start();
        setListening(true);
              } catch (e) {
          console.log("Error starting recognition:", e);
          toast.error("Failed to start microphone. Please try again.");
        }
    }
  };

  // Debounced translate on transcript changes
  useEffect(() => {
    const doTranslate = async () => {
      if (!debouncedOriginal) return;
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: debouncedOriginal,
            targetLang,
            sourceLang,
          }),
        });
        const data = await res.json();
        if (data.translated) setTranslated(data.translated);
      } catch {
        toast.error("Translation failed");
      }
    };
    doTranslate();
  }, [debouncedOriginal, targetLang, sourceLang]);

  // Speak translated text
  const speak = () => {
    if (!translated) return;
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(translated);
    // try to pick a voice matching target lang
    const voices = synth.getVoices();
    const v = voices.find((v) =>
      v.lang?.toLowerCase().startsWith(targetLang)
    );
    if (v) utter.voice = v;
    synth.speak(utter);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Healthcare Translation
            </h1>
          </div>
          <p className="text-base text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Professional real-time multilingual communication platform for healthcare providers and patients. 
            Seamlessly convert speech to text, translate with medical precision, and provide audio playback.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <Mic className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Voice Recognition</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <Globe className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">AI Translation</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <Volume2 className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Audio Playback</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <MessageSquare className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Mobile Optimized</span>
            </div>
          </div>
        </header>

        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 mb-8">
          <div className="grid gap-6 md:grid-cols-3 items-end">
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Languages className="w-4 h-4 text-blue-600" />
                Input Language
              </label>
              <select
                className="border border-gray-300 rounded-xl p-4 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-gray-900 font-medium"
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="text-gray-900 bg-white">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <button
                  onClick={toggleMic}
                  className={`flex-1 px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    listening 
                      ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg transform hover:scale-105" 
                      : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg transform hover:scale-105"
                  }`}
                >
                  {listening ? (
                    <>
                      <MicOff className="w-5 h-5" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      Start Recording
                    </>
                  )}
                </button>
                <button
                  onClick={speak}
                  disabled={!translated}
                  className={`px-6 py-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-2 ${
                    translated 
                      ? "border-purple-500 text-purple-600 hover:bg-purple-50 hover:border-purple-600 transform hover:scale-105" 
                      : "border-gray-300 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                  Play
                </button>
              </div>
              {listening && (
                <div className="flex items-center gap-3 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Recording in progress...</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Globe className="w-4 h-4 text-green-600" />
                Output Language
              </label>
              <select
                className="border border-gray-300 rounded-xl p-4 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm text-gray-900 font-medium"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="text-gray-900 bg-white">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>



        {/* Dual transcripts */}
        <section className="grid gap-8 md:grid-cols-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-lg">
                  Original Transcript
                </h2>
                <p className="text-sm text-gray-500">{getLabel(sourceLang)}</p>
              </div>
            </div>
            <textarea
              className="w-full h-72 border border-gray-300 rounded-xl p-6 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/90 shadow-sm text-gray-700 placeholder-gray-400"
              placeholder="Speak into your microphone or type here to begin translation..."
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
            />
            <div className="mt-4 flex items-start gap-3 text-sm text-gray-600 bg-blue-50/50 p-4 rounded-xl">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Live transcript from microphone appears here.</p>
                <p className="text-orange-600 mt-1">💡 Tip: Speak clearly and pause between sentences for better accuracy.</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-lg">
                  Translated Text
                </h2>
                <p className="text-sm text-gray-500">{getLabel(targetLang)}</p>
              </div>
            </div>
            <textarea
              className="w-full h-72 border border-gray-300 rounded-xl p-6 resize-none bg-gray-50/90 shadow-sm text-gray-700"
              value={translated || "Translation will appear here..."}
              readOnly
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => navigator.clipboard.writeText(translated)}
                disabled={!translated}
                className={`px-6 py-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-2 font-medium ${
                  translated 
                    ? "border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 transform hover:scale-105" 
                    : "border-gray-300 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              <button
                onClick={speak}
                disabled={!translated}
                className={`px-6 py-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-2 font-medium ${
                  translated 
                    ? "border-purple-500 text-purple-600 hover:bg-purple-50 hover:border-purple-600 transform hover:scale-105" 
                    : "border-gray-300 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Volume2 className="w-4 h-4" />
                Play Audio
              </button>
            </div>
          </div>
        </section>

        {/* Footer with additional info */}
        <footer className="mt-16 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 text-xl">Healthcare Translation Features</h3>
            </div>
            <div className="grid gap-6 md:grid-cols-3 text-sm text-gray-600">
              <div className="bg-blue-50/50 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Mic className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-700">Voice Recognition</h4>
                </div>
                <p className="text-gray-600">Real-time speech-to-text with medical terminology support</p>
              </div>
              <div className="bg-green-50/50 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-700">AI Translation</h4>
                </div>
                <p className="text-gray-600">Powered by OpenAI GPT-4 for accurate medical translations</p>
              </div>
              <div className="bg-purple-50/50 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-700">Privacy First</h4>
                </div>
                <p className="text-gray-600">No data storage - all processing happens in real-time</p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 font-medium">
                This tool assists communication but should not replace professional medical interpretation services for critical healthcare decisions.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Note: Speech recognition accuracy may vary. For best results, speak clearly and use manual typing for important medical terms.
              </p>
            </div>
          </div>
        </footer>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </main>
  );
}
