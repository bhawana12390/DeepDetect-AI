## DeepDetect AI
DeepDetect AI is a powerful multi-modal tool for identifying deepfakes in images, audio, and videos. It delivers analysis with confidence scores and detailed, LLM-generated explanations for video assessments.

## Table of Contents
1. Core Features
2. Getting Started
3. Prerequisites
4. Installation
5. Usage
6. Running the Development Server
7. Building for Production
8. Contributing
9. License

## Core Features:
 Image Analysis: Upload an image to determine if it's a deepfake, complete with a confidence score and a clear explanation.

 Audio Analysis: Analyze audio files for signs of deepfake manipulation, receiving a confidence score and a summary.

 Video Analysis: Get a comprehensive deepfake assessment for videos, including:

An overall confidence score.

An LLM-generated textual justification of the assessment.

A summary of findings from keyframe analysis.

Details from the audio transcript.

Thumbnails of analyzed keyframes.

## Getting Started
Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

## Prerequisites
You need to have Node.js and npm installed on your machine.
```
npm

npm install npm@latest -g
```
## Installation
Clone the repository to your local machine:
```
git clone https://github.com/bhawana12390/DeepDetect-AI.git
```
Navigate into the project directory:
```
cd DeepDetect-AI
```

Create a ```.env``` file and add:
```GEMINI_API_KEY=AI...```

Install the required dependencies:
```
npm install
```
## Usage
Once the dependencies are installed, you can run the application in various modes.

## Running the Development Server
To start the application in a development environment with hot-reloading enabled, run the following command:
```
npm run dev
```
Open http://localhost:9002 (or the port specified in your console) to view it in your browser.

## Building for Production
To create a production-ready build of the application, run:
```
npm run build
```
This command will compile and optimize the application for the best performance. The build artifacts will be stored in the build/ or dist/ directory.

## Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

## License
Distributed under the MIT License. See LICENSE for more information.
