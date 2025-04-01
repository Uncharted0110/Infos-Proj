import React, { useRef, useEffect, useState, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import './App.css';

function App() {
  const uploadSectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [language, setLanguage] = useState('eng');
  const [boxHeight, setBoxHeight] = useState('300px');

  // Infinite Scroll Progress Indicator
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setScrollProgress((scrollTop / scrollHeight) * 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Extract text from image
  const extractTextFromImage = useCallback(async (image, lang) => {
    if (!image) return;
    setIsExtracting(true);
    setExtractedText('Extracting text...');
    try {
      const { data: { text } } = await Tesseract.recognize(image, lang, {
        logger: (m) => console.log(m),
      });
      const extractedContent = text.trim() || 'No text found.';
      setExtractedText(extractedContent);
      
      // Adjust height based on content length
      if (extractedContent.length > 500) {
        setBoxHeight('500px');
      } else if (extractedContent.length > 200) {
        setBoxHeight('400px');
      } else {
        setBoxHeight('300px');
      }
      
    } catch (error) {
      setExtractedText('Failed to extract text.');
      console.error(error);
    } finally {
      setIsExtracting(false);
    }
  }, []);

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        extractTextFromImage(reader.result, language);
      };
      reader.readAsDataURL(file);
    }
  };

  // Re-extract text when language changes
  useEffect(() => {
    if (selectedImage) {
      extractTextFromImage(selectedImage, language);
    }
  }, [language, extractTextFromImage, selectedImage]);

  // Clear uploaded image
  const handleClearImage = () => {
    setSelectedImage(null);
    setExtractedText('');
    setBoxHeight('300px');
    if (uploadSectionRef.current) {
      uploadSectionRef.current.value = '';
    }
  };

  return (
    <div className="app-container">
      <div className="homepage-container">
        <div className="homepage-background fullscreen-background"></div>
      </div>

      {/* Upload & Translation Section */}
      <div className="upload-section">
        <div className="upload-container">
          {/* Upload Box */}
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

          {/* Translation Box */}
          <div 
            className="translation-box"
            style={{ height: boxHeight }}
          >
            <h2 className="section-title">Extracted Text</h2>
            <div className="translation-text-container">
              <p className="translation-text">{isExtracting ? 'Extracting...' : extractedText || 'No text yet.'}</p>
            </div>
            {selectedImage && (
              <div className="button-container">
                <button onClick={handleClearImage} className="clear-button">
                  Clear Image
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Language Selection */}
        <div className="language-selection">
          <label>Select Language: </label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="eng">English</option>
            <option value="fra">French</option>
            <option value="spa">Spanish</option>
            <option value="hin">Hindi</option>
          </select>
        </div>
      </div>

      <div className="scroll-indicator" style={{ width: `${scrollProgress}%` }}></div>
    </div>
  );
}

export default App;