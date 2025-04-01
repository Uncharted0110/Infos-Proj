import React, { useRef, useEffect, useState } from 'react';
import './App.css';

function App() {
  const uploadSectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [translation, setTranslation] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setScrollProgress((scrollTop / scrollHeight) * 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setTranslation('Translation will appear here...'); // Placeholder for translation logic
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setTranslation('');
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
          <div className="translation-box">
            <h2 className="section-title">Translation</h2>
            <p className="translation-text">{translation || 'No image uploaded yet.'}</p>
            {selectedImage && (
              <button onClick={handleClearImage} className="clear-button">
                Clear Image
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="scroll-indicator" style={{ width: `${scrollProgress}%` }}></div>
    </div>
  );
}

export default App;
