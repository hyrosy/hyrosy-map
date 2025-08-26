import React, { useEffect } from 'react';
import styles from './StoryModal.module.css';

const StoryModal = ({ videoUrl, onClose }) => {

  useEffect(() => {
    const handleEsc = (event) => {
       if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        <video src={videoUrl} autoPlay controls muted onEnded={onClose} className={styles.storyVideo}>
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default StoryModal;