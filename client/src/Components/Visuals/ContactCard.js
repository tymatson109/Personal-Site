import './ContactCard.css';

export const ContactCard = () => {

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
                />
                <input 
                    className='contact-card-input' 
                    placeholder='Email...'
                />
                <textarea 
                    className='contact-card-textarea' 
                    rows={16}
                    placeholder='Message...'
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