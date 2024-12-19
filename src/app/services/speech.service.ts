// import { Injectable } from '@angular/core';
// import { SpeechClient } from '@google-cloud/speech';
// import { Subject } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class SpeechService {
//   private speechClient: SpeechClient;
//   private mediaRecorder: MediaRecorder | null = null;
//   private audioChunks: Blob[] = [];
//   public transcription$ = new Subject<string>();

//   constructor() {
//     // Initialize the Speech Client with your credentials
//     this.speechClient = new SpeechClient({
//       keyFilename: 'path/to/your/google-credentials.json'
//     });
//   }

//   async startRecording(): Promise<void> {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       this.mediaRecorder = new MediaRecorder(stream);
      
//       this.mediaRecorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           this.audioChunks.push(event.data);
//         }
//       };

//       this.mediaRecorder.onstop = async () => {
//         const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
//         await this.transcribeAudio(audioBlob);
//         this.audioChunks = [];
//       };

//       this.mediaRecorder.start();
//     } catch (error) {
//       console.error('Error starting recording:', error);
//     }
//   }

//   stopRecording(): void {
//     if (this.mediaRecorder) {
//       this.mediaRecorder.stop();
//       const tracks = (this.mediaRecorder.stream as MediaStream).getTracks();
//       tracks.forEach(track => track.stop());
//     }
//   }

//   private async transcribeAudio(audioBlob: Blob): Promise<void> {
//     try {
//       const audioBuffer = await audioBlob.arrayBuffer();
//       const audioContent = Buffer.from(audioBuffer);

//       const request = {
//         audio: {
//           content: audioContent.toString('base64')
//         },
//         config: {
//           encoding: 'LINEAR16',
//           sampleRateHertz: 48000,
//           languageCode: 'en-US'
//         }
//       };

//       const [response] = await this.speechClient.recognize(request);
//       const transcription = response.results
//         ?.map(result => result.alternatives?.[0].transcript)
//         .join('\n');

//       if (transcription) {
//         this.transcription$.next(transcription);
//       }
//     } catch (error) {
//       console.error('Transcription error:', error);
//     }
//   }
// }