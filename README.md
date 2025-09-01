# DeepDetect AI: Multimodal Deepfake Detection

DeepDetect AI is a sophisticated, full-stack web application built to analyze and identify deepfakes in various media formats, including images, audio, and video. It leverages the power of Google's Gemini generative AI to provide not just a detection score, but also a detailed, human-readable justification for its assessment, making complex AI analysis accessible and understandable.

## Problem Statement

In an age of rapidly advancing AI, the line between authentic and synthetic media is becoming increasingly blurred. Deepfakes pose a significant threat, enabling the spread of misinformation, fraud, and malicious content. There is a growing need for accessible tools that can help users, from journalists to casual internet users, verify the authenticity of media they encounter. DeepDetect AI aims to address this problem by providing a user-friendly platform for on-demand deepfake analysis.

## Key Features & Highlights

*   **Multimodal Analysis:** Capable of processing images, audio files, and videos for signs of digital manipulation.
*   **AI-Powered Justification:** Instead of just providing a score, the application uses Google Gemini to generate a qualitative, creative explanation for *why* a piece of media is considered authentic or a deepfake.
*   **Advanced Video Processing:** Utilizes an FFmpeg-powered backend pipeline to demux video files into individual frames and audio tracks. Each component is analyzed separately, and the results are intelligently aggregated for a more accurate and holistic assessment.
*   **Dual-Source Input:** Users can either upload files directly from their device or analyze media from a public URL, offering flexibility and convenience.
*   **Polished & Responsive UI:** Built with Next.js, React, Tailwind CSS, and ShadCN UI, the application features a modern, clean, and fully responsive interface that includes animated results, persistent session history, and a seamless user experience.
*   **Scalable Architecture:** The backend logic is intentionally decoupled, preparing the application to be integrated with a background job queue (like BullMQ) for industry-level scalability and handling of long-running analysis tasks.

## Methodology: How It Works

The application employs a sophisticated, multi-step process to analyze media:

1.  **Media Ingestion:** The user provides media either via file upload or by pasting a URL. The Next.js backend handles both cases, fetching the media if from a URL.
2.  **Video Demuxing (for Videos):** If the media is a video, it is passed to a serverless function where **FFmpeg** is used to:
    *   Extract keyframes at a rate of one per second.
    *   Extract the complete audio track into a separate file.
3.  **Parallel AI Analysis:**
    *   **Frames:** Each extracted video frame is sent to the **Google Gemini** vision model for deepfake analysis. The AI looks for visual artifacts like inconsistent lighting, unnatural textures, and strange blurring.
    *   **Audio:** The extracted audio track (or the original audio file) is sent to Gemini to detect signs of synthesis, such as robotic artifacts, unnatural cadence, or lack of background noise.
4.  **Result Aggregation:** The confidence scores from all the individual frame analyses are averaged to produce a final `visualConfidence` score. The `audioConfidence` score comes from the audio analysis. These are then weighted and combined into an `overallConfidence` score.
5.  **Justification Generation:** The AI model also generates a textual justification for each analysis (visual, audio, and overall), explaining its findings in a creative and plausible narrative.
6.  **Results Display:** The final scores and justifications are presented to the user in a clean, interactive card, with progress bars animating to the final score to create a dynamic experience.

---

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

*   [Node.js](https://nodejs.org/) (version 18.x or later)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://your-repository-url.com/
    cd deep-detect-ai
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    *   You will need an API key from [Google AI Studio](https://aistudio.google.com/app/apikey) to use the Gemini model.
    *   Create a `.env.local` file in the root of the project by copying the example file:
        ```bash
        cp .env.example .env.local
        ```
    *   Open `.env.local` and add your Google AI API key:
        ```
        GEMINI_API_KEY="YOUR_API_KEY_HERE"
        ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running at [http://localhost:9002](http://localhost:9002).

## Technology Stack

*   **Framework:** [Next.js](https://nextjs.org/) (React)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
*   **AI:** [Google Gemini](https://deepmind.google/technologies/gemini/) via [Genkit AI Framework](https://firebase.google.com/docs/genkit)
*   **Backend Media Processing:** [FFmpeg](https://ffmpeg.org/)
*   **Icons:** [Lucide React](https://lucide.dev/)
