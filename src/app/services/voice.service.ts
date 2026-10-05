import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class VoiceService {
  private recognition: any;

  isListening = false;
  transcript = "";
  onCommand: ((text: string) => void) | null = null;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();

      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = "en-IN";

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.onresult = (event: any) => {
        const result = event.results[0][0].transcript;

        this.transcript = result;

        console.log("Voice command:", result);
        if (this.onCommand) {
          this.onCommand(result);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);

        this.isListening = false;
      };
    } else {
      console.error("Speech recognition is not supported in this browser.");
    }
  }

  startListening(): void {
    if (!this.recognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    this.transcript = "";

    this.recognition.start();
  }

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}
