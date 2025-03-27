import React, { useRef, useEffect, useState } from 'react';
import './App.css';

function App() {
  const uploadSectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  // Track scroll progress for smooth transition
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setScrollProgress((scrollTop / scrollHeight) * 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle image upload and preview
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear the selected image
  const handleClearImage = () => {
    setSelectedImage(null);
    if (uploadSectionRef.current) {
      uploadSectionRef.current.value = '';
    }
  };

  return (
    <div className="app-container">
      {/* Homepage Section */}
      <div className="homepage-container">
        <div className="homepage-background fullscreen-background"></div>
      </div>

      {/* Upload Section */}
      <div className="upload-section upload-background">
        {/* Dotted Upload Box with background */}
        {!selectedImage && (
          <div
            className="upload-box"
            onClick={() => uploadSectionRef.current.click()}
          >
            <h2 className="section-title">Upload Your Image</h2>
            <p className="section-subtitle">Get your translations!</p>
            <input
              ref={uploadSectionRef}
              type="file"
              className="file-input"
              onChange={handleImageUpload}
              accept="image/*"
            />
          </div>
        )}

        {/* Show image preview if available */}
        {selectedImage && (
          <div className="image-preview-container">
            <img src={selectedImage} alt="Uploaded Preview" className="image-preview" />
            <div className="button-group">
              <button onClick={handleClearImage} className="clear-button">
                Clear Image
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scroll Progress Indicator */}
      <div className="scroll-indicator" style={{ width: `${scrollProgress}%` }}></div>
    </div>
  );
}

export default App;
