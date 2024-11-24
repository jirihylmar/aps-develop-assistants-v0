=== File: readme.md ===
=== Size: 10KB ===

# Digital Horizon API Interface

A simple React application that processes educational queries using Claude API and course data.


OPENED @hylmarj Sat Nov 23 17:25:09 CEST 2024 

STEP 2 - worker

```
questions will be passed from json files payloads. jsons will be stored in public/translate_input using python worker
it will be in sequence
document 1
question 1
answer keep 1
question 2
answer keep 2
...
question 2
...
store document 1 translated as public/translate_output
document 2
...
```

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd aps-develop-assistants-v0
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```
ANTHROPIC_API_KEY=your_api_key_here
PORT=3001
```

4. Ensure required files exist in the `public` folder:
- `digital_horizon_course_overview_simple__en.json` (course data)
- `instructions.md` (processing instructions)

## Running the Application

### Development Mode
Run both backend and frontend servers:
```bash
npm run dev
```

This starts:
- Backend server on http://localhost:3001
- Frontend React app on http://localhost:3000

### Production Mode

1. Build the React application:
```bash
npm run build
```

2. Serve the production build:
```bash
node server.mjs
```

## Usage

1. Access the application at http://localhost:3000
2. Enter your educational query
3. Specify number of employees (default: 10)
4. Submit query to get analyzed response

## Special Features

- Redirects to https://main.d11560jbgv52dn.amplifyapp.com/ for "What can you offer" queries
- Processes course data for relevant module recommendations
- Calculates costs based on employee count

## Project Structure

```
hylmarj@jirih-hp-zbook-14u-g6:~/aps-develop-assistants-v0$ tree -I "node_modules|.git"
.
├── package-lock.json
├── package.json
├── postcss.config.js
├── public
│   ├── common_questions.json
│   ├── digital_horizon_course_overview_simple__en.json
│   ├── index.html
│   ├── instructions.md
│   └── test_data
│       ├── cs_response_a.json
│       ├── cs_response_b.json
│       ├── en_response_a.json
│       └── en_response_b.json
├── readme.md
├── server.mjs
├── src
│   ├── App.jsx
│   ├── components
│   │   ├── QueryWorker copy.jsx
│   │   ├── QueryWorker.jsx
│   │   ├── debug
│   │   │   └── DebugPanel.jsx
│   │   ├── form
│   │   │   ├── ErrorDisplay.jsx
│   │   │   ├── QueryForm.jsx
│   │   │   ├── ResponseDisplay.jsx
│   │   │   └── ResponseFormatter.jsx
│   │   └── layout
│   │       ├── Footer.jsx
│   │       ├── Header.jsx
│   │       └── PageLayout.jsx
│   ├── index.js
│   ├── styles
│   │   └── index.css
│   └── utils
│       └── mockApi.js
└── tailwind.config.js

10 directories, 28 files

```

Let me help with the README.md and explain the data handling.

Regarding the data handling:

1. **Course Data Loading**:
- The `digital_horizon_course_overview_simple__en.json` is loaded ONCE when the React component mounts (via `useEffect` hook)
- It's stored in component state (`courseData`)
- This data remains in memory for all subsequent queries until page refresh
- The file itself stays in the public folder and is served statically

2. **API Call Process**:
```javascript
// When a query is made:
1. Uses courseData from state (no reload needed)
2. Sends to backend:
   - The query text
   - Employee count
   - Course data from state
3. Backend combines this with instructions format
4. Makes Claude API call
5. Returns response
```

3. **Instructions.md**:
- The format from instructions.md is embedded in the API call
- It's not actually loaded as a file in the current implementation
- Could be modified to load from file if dynamic updates are needed

Current Data Flow:
```
Initial Load:
[JSON File] -> [Component State] -> [Used for all queries]

Per Query:
[State Data + Query] -> [Backend] -> [Claude API] -> [Response]
```

To make it more dynamic:
1. Could add file reloading on each query:
```javascript
const handleSubmit = async (e) => {
  // Reload course data on each query
  const freshData = await fetch('/digital_horizon_course_overview_simple__en.json')
    .then(res => res.json());
  
  // Use fresh data for query
  // ... rest of the code
};
```

2. Could add instructions.md loading:
```javascript
// In server.mjs
import fs from 'fs/promises';

const instructions = await fs.readFile('public/instructions.md', 'utf8');
// Use in API calls
```

Current implementation prioritizes performance by:
- Loading course data once
- Keeping it in memory
- Using it for multiple queries



# Model Selection and Pricing Guide

## Task Requirements Analysis
Our application needs to:
- Parse and understand queries in multiple languages
- Analyze educational needs and map them to course offerings
- Generate structured JSON responses
- Perform accurate calculations
- Follow precise formatting instructions
- Maintain context awareness across course data

## Model Options and Suitability

### Claude-3-Opus (Current Implementation)
- **Pricing**: 
  - Input: $0.015/1K tokens
  - Output: $0.075/1K tokens
- **Strengths**:
  - Superior multilingual understanding (requirement #1)
  - Excellent JSON structure adherence (requirements #4-10)
  - High accuracy in calculations
  - Best context preservation for course mapping
  - Strong ability to follow complex instructions
- **Cost Example** (based on average query):
  - Input (~300 tokens): $0.0045
  - Output (~300 tokens): $0.0225
  - Total per query: ~$0.027
- **Recommended for**: Production use where accuracy and multilingual support are critical

### Claude-3-Sonnet (Alternative Option)
- **Pricing**:
  - Input: $0.003/1K tokens
  - Output: $0.015/1K tokens
- **Strengths**:
  - Good multilingual capabilities
  - Reliable JSON formatting
  - Accurate calculations
  - 80% cheaper than Opus
- **Cost Example** (based on average query):
  - Input (~300 tokens): $0.0009
  - Output (~300 tokens): $0.0045
  - Total per query: ~$0.0054
- **Recommended for**: Development/testing or production with budget constraints

### Claude-3-Haiku (Not Recommended)
- **Pricing**:
  - Input: $0.00025/1K tokens
  - Output: $0.00125/1K tokens
- **Limitations**:
  - Less reliable with complex JSON structures
  - May struggle with multilingual queries
  - Lower context preservation
- **Not recommended** for this application due to task complexity

## Recommendations

1. **Development Environment**
   - Use Claude-3-Sonnet for development and testing
   - Estimated monthly cost (1000 queries): ~$5.40

2. **Production Environment**
   - Use Claude-3-Opus for critical business operations
   - Estimated monthly cost (1000 queries): ~$27.00
   - Benefits justify 5x cost increase due to:
     - Higher accuracy in course recommendations
     - Better multilingual support
     - More reliable JSON formatting
     - Superior context understanding

3. **Cost Optimization**
   - Implement client-side query validation
   - Cache common responses
   - Use structured prompts to minimize token usage
   - Consider batch processing for bulk queries

4. **Monitoring Recommendations**
   - Track token usage per query type
   - Monitor translation frequency
   - Watch for JSON formatting errors
   - Calculate cost per successful recommendation

## Updates and Maintenance
Keep this guide updated as:
- Anthropic releases new models
- Pricing changes occur
- New requirements are added
- Usage patterns evolve

Key aspects addressed:
- Multilingual parsing (requirement #1)
- JSON response formatting (requirements #4-10)
- Calculation accuracy (requirement #6)
- Professional tone (requirement #8)

## API Cost

### Simple test

```
Last Query Stats:
Processing Time: 14910.40ms
Model: claude-3-opus-20240229
Prompt Tokens: 864
Completion Tokens: 343
Total Tokens: 1207
Estimated Cost: $0.0387
Timestamp: 2024-11-20T11:58:10.323Z
```

### Without translation complexity

```
Last Query Stats:
Processing Time: 19482.40ms
Model: claude-3-opus-20240229
Prompt Tokens: 3962
Completion Tokens: 422
Total Tokens: 4384
Estimated Cost: $0.0911
Timestamp: 2024-11-20T11:55:48.911Z
Last Updated: 2024-11-20T11:55:48.911Z
```

### Final result

```
Last Query Stats:
Processing Time: 37557.70ms
Model: claude-3-opus-20240229
Prompt Tokens: 4527
Completion Tokens: 923
Total Tokens: 5450
Estimated Cost: $0.1371
Timestamp: 2024-11-20T16:05:25.981Z
Last Updated: 2024-11-20T16:05:25.981Z
```

## Mock API

1. Mock API System:
- Uses real test responses from your provided JSON files
- Supports both English and Czech languages
- Handles different response types (standard and website link)
- Simulates various error scenarios

2. QueryWorker Component Updates:
- Added language toggle (English/Czech)
- Enhanced debug controls with response type selection
- Shows current mock API configuration in debug panel
- Maintains all existing functionality while adding mock support

3. Debug Features:
- Language selection (EN/CS)
- Response type selection (Standard/Website Link)
- Error simulation (API Error, Timeout, Network Error)
- Debug panel shows current mock configuration

You can test different scenarios:
- Switch between English and Czech responses
- Toggle between standard and website link responses
- Test error handling
- Simulate network issues

The debug controls allow you to:
- Switch languages
- Change response types
- Trigger different error scenarios
- See the current mock configuration

