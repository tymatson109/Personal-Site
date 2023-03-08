import { useState, useRef } from 'react';
import './ContactCard.css';
import emailjs from '@emailjs/browser';
import { delay } from '../Functions/Misc';
import LoadingIcon from '../../Assets/LoadingIcon.svg';

export const ContactCard = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const form = useRef();
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name) {
            setError('Please enter your name!');
            return;
        }
        if (!email) {
            setError('Please enter your email!');
            return;
        }
        if (!message) {
            setError('Please enter a message!');
            return;
        }
        setLoading(true);
        emailjs.sendForm('service_32pwjhl', 'template_3fzno9d', form.current, 'cRqQ9TqCxKatFK9te')
            .then(() => {
                setSuccess(true);
                setLoading(false);
                delay(1000).then(() => {
                    setSuccess(false);
                })
            }, () => {
                setError("Could not send message");
                setLoading(false);
                return;
            });
        setName('')
        setEmail('')
        setMessage('');
        setError('');
    }

    return (
        <div className='contact-card'>
            <h1>Contact</h1>
            <p>Ask a question or get in touch with me?</p>
            <form ref={form} onSubmit={handleSubmit} className='contact-card-form'>
                <input 
                    name={'user_name'}
                    className='contact-card-input' 
                    placeholder='Name...'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input 
                    name={'user_email'}
                    className='contact-card-input' 
                    placeholder='Email...'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <textarea 
                    name={'message'}
                    className='contact-card-textarea' 
                    rows={10}
                    placeholder='Message...'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <div className='contact-card-error'>{error}</div>
                {!success ? (
                    !loading ? (
                        <button
                            type='submit'
                            className='contact-card-button'
                        >
                            Submit
                        </button>
                    ) : (
                        <div className='contact-card-button contact-card-loading'>
                            <img src={LoadingIcon} alt="Loading..." />
                        </div>
                    )
                ) : (
                    <div className='contact-card-button contact-card-success'>Success!</div>
                )}
            </form>
        </div>
    )
}