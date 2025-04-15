import React, { useRef, useEffect, useState, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import './App.css';

function App() {
  const uploadSectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [boxHeight, setBoxHeight] = useState('300px');
  const [inputMethod, setInputMethod] = useState('image');
  const [directTextInput, setDirectTextInput] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setScrollProgress((scrollTop / scrollHeight) * 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const extractTextFromImage = useCallback(async (image) => {
    if (!image) return;
    setIsExtracting(true);
    setExtractedText('Extracting text...');
    setTranslatedText('');
    try {
      const { data: { text } } = await Tesseract.recognize(
        image,
        'eng+fra+spa+hin',
        {
          logger: (m) => console.log(m),
          langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        }
      );
      const extractedContent = text.trim() || 'No text found.';
      setExtractedText(extractedContent);

      if (extractedContent !== 'No text found.') {
        translateText(extractedContent);
      }
    } catch (error) {
      setExtractedText('Failed to extract text.');
      console.error(error);
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const translateText = async (text) => {
    setIsTranslating(true);
    setTranslatedText('Translating...');
  
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const translatedLines = [];
  
    try {
      for (const line of lines) {
        const response = await fetch("https://0d9a-34-86-67-187.ngrok-free.app/generate", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ text: line }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        const translation = data.translation || 'Translation failed.';
        translatedLines.push(translation);
      }
  
      setTranslatedText(translatedLines.join('\n'));
    } catch (error) {
      setTranslatedText(`Failed to translate text: ${error.message}`);
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  }; 


  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        extractTextFromImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextInputSubmit = () => {
    if (directTextInput.trim()) {
      setExtractedText(directTextInput);
      translateText(directTextInput);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setExtractedText('');
    setTranslatedText('');
    setDirectTextInput('');
    setBoxHeight('300px');
    if (uploadSectionRef.current) {
      uploadSectionRef.current.value = '';
    }
  };

  const toggleInputMethod = (method) => {
    setInputMethod(method);
    handleClear();
  };

  return (
    <div className="app-container">
      <div className="homepage-container">
        <div className="homepage-background fullscreen-background"></div>
      </div>

      <div className="extra-space"></div>

      <div className="input-method-selection">
        <button
          className={`input-method-button ${inputMethod === 'image' ? 'active' : ''}`}
          onClick={() => toggleInputMethod('image')}
        >
          Translate from Image
        </button>
        <button
          className={`input-method-button ${inputMethod === 'text' ? 'active' : ''}`}
          onClick={() => toggleInputMethod('text')}
        >
          Translate from Text
        </button>
      </div>

      <div className="upload-section">
        <div className="upload-container">
          {inputMethod === 'image' ? (
            <div
              className="upload-box"
              onClick={() => uploadSectionRef.current.click()}
              style={{ height: boxHeight }}
            >
              {!selectedImage ? (
                <>
                  <h2 className="section-title">Upload Your Image</h2>
                  <p className="section-subtitle">Get your translations!</p>
                </>
              ) : (
                <img src={selectedImage} alt="Uploaded Preview" className="image-preview" />
              )}
              <input
                ref={uploadSectionRef}
                type="file"
                className="file-input"
                onChange={handleImageUpload}
                accept="image/*"
              />
            </div>
          ) : (
            <div className="text-input-box" style={{ height: boxHeight }}>
              <h2 className="section-title">Enter Source Text</h2>
              <textarea
                value={directTextInput}
                onChange={(e) => setDirectTextInput(e.target.value)}
                placeholder="Type or paste the source text here..."
                className="text-input-area"
              />
              <button
                onClick={handleTextInputSubmit}
                className="submit-text-button"
                disabled={!directTextInput.trim()}
              >
                Translate Text
              </button>
            </div>
          )}

          {inputMethod === 'image' && (
            <div className="translation-box" style={{ height: boxHeight }}>
              <h2 className="section-title">Extracted Text</h2>
              <div className="translation-text-container">
                <p className="translation-text">{isExtracting ? 'Extracting...' : extractedText || 'No text yet.'}</p>
              </div>
            </div>
          )}

          <div className="translation-box" style={{ height: boxHeight }}>
            <h2 className="section-title">Translated Text</h2>
            <div className="translation-text-container">
              <p className="translation-text">{isTranslating ? 'Translating...' : translatedText || 'No translation yet.'}</p>
            </div>
          </div>
        </div>

        {(selectedImage || directTextInput) && (
          <div className="button-container">
            <button onClick={handleClear} className="clear-button">
              Clear {inputMethod === 'image' ? 'Image' : 'Text'}
            </button>
          </div>
        )}
      </div>

      <div className="scroll-indicator" style={{ width: `${scrollProgress}%` }}></div>
    </div>
  );
}

export default App;
