import './SocialButton.css';
import { GrLinkedinOption } from 'react-icons/gr'


export const LinkedInButton = ({link}) => {

    const handleClick = () => {
        window.location.href = link;
    }

    return (
        <button onClick={handleClick} className='social-button'>
            <div className='social-button-container'>
                <GrLinkedinOption className='social-button-icon' />
            </div>
            <div className='social-button-container'>
                <GrLinkedinOption className='social-button-icon' />
            </div>
        </button>
    )
};