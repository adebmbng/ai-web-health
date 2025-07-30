# AI Food Detection Camera - Copilot Instructions

## Project Overview
**Purpose**: A React TSX web application that uses camera detection to identify food products/ingredients and categorize them by processing level (UPF, Minimally Processed, etc.)

**MVP Goals**:
- Camera access and image capture
- Food/ingredient detection using AI
- Classification into processing categories (UPF, Processed, Minimally Processed, Unprocessed)
- Simple, mobile-first interface

**Target Audience**: Health-conscious consumers wanting to quickly assess food processing levels

## Tech Stack

### Core Technologies
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite (fast development and builds)
- **Deployment**: Vercel
- **Styling**: Tailwind CSS (mobile-first, utility classes)
- **Camera**: Web Camera API (getUserMedia)

### AI/ML Integration
- **Food Analysis**: LLM-based image analysis (OpenAI GPT-4 Vision, Claude, or similar)
- **Image Processing**: Capture image → encode to base64 → send to LLM API
- **Processing**: Server-side LLM analysis with structured response

## Project Structure
```
src/
├── components/
│   ├── Camera/
│   │   ├── CameraCapture.tsx
│   │   ├── CameraPreview.tsx
│   │   └── CameraControls.tsx
│   ├── Detection/
│   │   ├── FoodDetector.tsx
│   │   ├── CategoryDisplay.tsx
│   │   └── ConfidenceIndicator.tsx
│   ├── UI/
│   │   ├── Header.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorMessage.tsx
│   └── Layout/
│       └── AppLayout.tsx
├── hooks/
│   ├── useCamera.ts
│   ├── useFoodDetection.ts
│   └── useLocalStorage.ts
├── services/
│   ├── llmAnalysisService.ts
│   ├── imageUploadService.ts
│   └── categoryService.ts
├── types/
│   ├── food.ts
│   ├── camera.ts
│   └── detection.ts
├── utils/
│   ├── imageProcessing.ts
│   ├── categoryMapping.ts
│   └── constants.ts
└── assets/
    └── icons/
```

## Core Features (MVP)

### 1. Camera Interface
- Access device camera
- Real-time preview
- Capture/shutter button
- Switch between front/back camera (mobile)

### 2. Food Detection
- Capture image when shutter button pressed
- Encode image to base64
- Send to LLM API for analysis
- Parse structured response

### 3. Category Classification
- **Unprocessed**: Fresh fruits, vegetables, raw ingredients
- **Minimally Processed**: Frozen vegetables, plain yogurt, nuts
- **Processed**: Canned vegetables, cheese, bread
- **Ultra-Processed (UPF)**: Packaged snacks, soft drinks, ready meals

### 4. Results Display
- Show detected food item
- Display category with color coding
- Show confidence percentage
- Brief explanation of category

## Development Standards

### TypeScript Configuration
- Strict mode enabled
- Proper typing for camera API
- Interface definitions for detection results
- Type-safe props and state management

### Component Patterns
- Functional components with hooks
- Custom hooks for camera and detection logic
- Error boundaries for camera/ML errors
- Loading states for async operations

### Styling Guidelines
- Mobile-first responsive design
- Tailwind utility classes
- Color coding for food categories:
  - Green: Unprocessed
  - Light Green: Minimally Processed
  - Orange: Processed
  - Red: Ultra-Processed (UPF)

## Environment Setup

### Required Environment Variables
```bash
# Development
VITE_API_URL=http://localhost:3000
VITE_LLM_API_KEY=your_llm_api_key
VITE_LLM_API_URL=https://api.openai.com/v1/chat/completions

# Production (Vercel)
VITE_API_URL=https://your-api.vercel.app
VITE_LLM_API_KEY=your_production_llm_api_key
VITE_LLM_API_URL=https://api.openai.com/v1/chat/completions
```

### Camera Permissions
- HTTPS required for camera access
- Proper error handling for permission denied
- Fallback for devices without camera

## Vercel Deployment

### Build Configuration
- Automatic builds from main branch
- Environment variables configured in Vercel dashboard
- Static asset optimization
- Progressive Web App (PWA) support

### Domain Setup
- Custom domain: `food-detector.vercel.app` (or custom)
- HTTPS enforced for camera API

## Performance Considerations

### LLM API Optimization
- Optimize image size before sending to LLM
- Implement request caching for identical images
- Show loading indicators during API calls
- Handle API rate limiting gracefully

### Image Processing
- Resize images to optimal size for LLM analysis
- Compress images to reduce API costs
- Validate image quality before sending

## Error Handling

### Camera Errors
- Permission denied
- No camera available
- Camera access blocked

### Detection Errors
- LLM API failures
- Image quality too poor for analysis
- No food detected in image
- Low confidence results
- API rate limiting

## Privacy & Security
- All processing done client-side when possible
- No image storage on servers
- Camera access only when needed
- Clear privacy policy

## Testing Strategy (Future)
- Unit tests for utility functions
- Component testing for camera interface
- E2E testing for complete detection flow
- Performance testing for ML inference

## Development Commands
```bash
# Setup
npm install

# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## Coding Guidelines

### Naming Conventions
- Components: PascalCase (`CameraCapture.tsx`)
- Hooks: camelCase with 'use' prefix (`useCamera.ts`)
- Types: PascalCase (`FoodCategory`, `DetectionResult`)
- Constants: UPPER_SNAKE_CASE (`FOOD_CATEGORIES`)

### Import Organization
```typescript
// External libraries
import React from 'react'
import { useState, useEffect } from 'react'

// Internal components
import CameraCapture from './components/Camera/CameraCapture'

// Types
import type { FoodDetectionResult } from './types/food'

// Utilities
import { processImage } from './utils/imageProcessing'
```

### Error Boundaries
- Wrap camera components
- Wrap ML inference components
- Provide user-friendly error messages
- Log errors for debugging

## Future Enhancements (Post-MVP)
- Nutrition information lookup
- History of scanned items
- Barcode scanning
- Offline mode
- User accounts and preferences
- API integration for more accurate detection
