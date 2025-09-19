import { useEffect } from 'react'
import './Modal.css'

const Modal = ({ isOpen, onClose, imageUrl, altText }) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.keyCode === 27) onClose()
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'auto'
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <span className="modal-close" onClick={onClose}>&times</span>
                <img src={imageUrl} alt={altText} className="modal-image" />
            </div>
        </div>
    )
}

export default Modal