import { useState } from 'react';
import './ContactCard.css';

export const ContactCard = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        
    }

    return (
        <div className='contact-card'>
            <h1>Contact</h1>
            <p>Ask a question or get in touch with me?</p>
            <form onSubmit={handleSubmit} className='contact-card-form'>
                <input 
                    className='contact-card-input' 
                    placeholder='Name...'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input 
                    className='contact-card-input' 
                    placeholder='Email...'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <textarea 
                    className='contact-card-textarea' 
                    rows={16}
                    placeholder='Message...'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button
                    type='submit'
                    className='contact-card-button'
                >
                    Submit
                </button>
            </form>
        </div>
    )
}