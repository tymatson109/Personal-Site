import './SocialButton.css';
import { GrLinkedinOption } from 'react-icons/gr'


export const LinkedInButton = ({link, mini}) => {

    const handleClick = () => {
        window.location.href = link;
    }

    return (
        <button onClick={handleClick} className={!mini ? 'social-button' : 'social-button-mini'}>
            <div className={!mini ? 'social-button-container' : 'social-button-container-mini'}>
                <GrLinkedinOption className={!mini ? 'social-button-icon' : 'social-button-icon-mini'} />
            </div>
            <div className={!mini ? 'social-button-container' : 'social-button-container-mini'}>
                <GrLinkedinOption className={!mini ? 'social-button-icon' : 'social-button-icon-mini'} />
            </div>
        </button>
    )
};