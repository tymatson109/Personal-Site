import './SocialButton.css';
import { FaGithub } from 'react-icons/fa'


export const GitHubButton = ({link}) => {

    const handleClick = () => {
        window.location.href = link;
    }

    return (
        <button onClick={handleClick} className='social-button'>
            <div className='social-button-container'>
                <FaGithub className='social-button-icon' />
            </div>
            <div className='social-button-container'>
                <FaGithub className='social-button-icon' />
            </div>
        </button>
    )
};