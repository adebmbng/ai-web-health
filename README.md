# AI Food Detection - Helping Families Avoid UPF Foods

> *Created by [Ade Bambang Kurnia](https://www.linkedin.com/in/adebmbng/) to help his daughter Alula manage H. Pylori bacteria by avoiding chocolate and minimizing Ultra-Processed Foods (UPF).*

An AI-powered web application that uses camera detection to identify food products and categorize them by processing level using the NOVA classification system. Built with React, TypeScript, and AI to help families make informed dietary choices.

## 🎯 Why This App Exists

When my daughter Alula was diagnosed with H. Pylori bacteria, our doctor advised us to:
- Avoid chocolate completely
- Minimize Ultra-Processed Foods (UPF)
- Control food intake carefully

As a developer and concerned parent, I realized many families face similar challenges. This app was born from the need to quickly and accurately assess whether foods are safe for dietary restrictions like H. Pylori management.

## ✨ Features

- **Real-time Camera Detection** - Point and analyze food instantly
- **NOVA Classification** - Categorizes foods as Unprocessed, Minimally Processed, Processed, or Ultra-Processed
- **Health Scoring** - Visual health score (1-10) based on processing level
- **Confidence Levels** - AI confidence scoring for analysis accuracy
- **Family-Friendly** - Designed with dietary restrictions in mind
- **Share Results** - Share analysis with family members or healthcare providers
- **Mobile-First** - Optimized for smartphone use

## 🏥 Health Categories

### 🥬 Unprocessed (Health Score: 10/10)
Fresh fruits, vegetables, raw nuts, fresh herbs
*Generally safe for H. Pylori management*

### 🥫 Minimally Processed (Health Score: 7-8/10)
Frozen vegetables, plain yogurt, canned beans, dried fruits
*Usually acceptable with medical guidance*

### 🧀 Processed (Health Score: 4-6/10)
Cheese, bread, canned vegetables, smoked meats
*Requires careful consideration*

### 🍟 Ultra-Processed (Health Score: 1-3/10)
Packaged snacks, soft drinks, ready meals, processed meats
*Should be avoided with H. Pylori and similar conditions*

## 🚀 Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **AI/ML**: OpenRouter API with GPT-4 Vision
- **Camera**: Web Camera API (getUserMedia)
- **Deployment**: Vercel

## 🛠️ Installation & Setup

```bash
# Clone the repository
git clone https://github.com/adebmbng/ai-web-health.git
cd ai-web-health

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your OpenRouter API key to .env

# Start development server
npm run dev
```

## 📱 Usage

1. **Open the app** in a modern browser (requires camera access)
2. **Point your camera** at the food item you want to analyze
3. **Tap the capture button** to take a photo
4. **Wait for analysis** (typically 2-3 seconds)
5. **Review results** including category, health score, and recommendations
6. **Share results** with family or healthcare providers if needed

## 🌟 For Families Managing H. Pylori

This app is specifically designed to help families like mine who need to:
- Quickly identify UPF foods to avoid
- Make informed choices when grocery shopping
- Educate children about healthy food choices
- Support medical treatment with proper nutrition

## 👨‍💻 About the Creator

**Ade Bambang Kurnia** is a Full Stack Developer from Indonesia, passionate about using technology to solve real-world health challenges. This project represents the intersection of parental care, medical necessity, and technical innovation.

- **LinkedIn**: [linkedin.com/in/adebmbng](https://www.linkedin.com/in/adebmbng/)
- **Twitter**: [@dbmkrn](https://twitter.com/dbmkrn)
- **Built for**: Alula and all families managing dietary restrictions

## 🤝 Contributing

This project was created to help families dealing with similar health challenges. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

Areas where help is welcomed:
- Additional language support
- Nutritionist-reviewed food recommendations
- Accessibility improvements
- Mobile app versions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Alula** - for being the inspiration behind this project
- **Medical community** - for guidance on H. Pylori management
- **OpenRouter** - for providing AI capabilities
- **Open source community** - for the amazing tools and libraries

---

*Made with ❤️ by Ade Bambang Kurnia for Alula and families managing dietary restrictions*

**Helping families make informed food choices, one scan at a time.**
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
