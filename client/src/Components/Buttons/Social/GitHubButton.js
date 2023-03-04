import './SocialButton.css';
import { FaGithub } from 'react-icons/fa'


export const GitHubButton = ({link, mini}) => {

    const handleClick = () => {
        window.location.href = link;
    }

    return (
        <button onClick={handleClick} className={!mini ? 'social-button' : 'social-button-mini'}>
            <div className={!mini ? 'social-button-container' : 'social-button-container-mini'}>
                <FaGithub className={!mini ? 'social-button-icon' : 'social-button-icon-mini'} />
            </div>
            <div className={!mini ? 'social-button-container' : 'social-button-container-mini'}>
                <FaGithub className={!mini ? 'social-button-icon' : 'social-button-icon-mini'} />
            </div>
        </button>
    )
};