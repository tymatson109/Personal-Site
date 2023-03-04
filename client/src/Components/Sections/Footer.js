import { GitHubButton } from '../Buttons/Social/GitHubButton';
import { InstagramButton } from '../Buttons/Social/InstagramButton';
import { LinkedInButton } from '../Buttons/Social/LinkedInButton';
import './Footer.css';

export const Footer = () => {
    return (
        <div className='footer'>
            <div className='footer-name'>Ty Matson</div>
            <div className='footer-container'>
                <div className='footer-button-container'>
                    <LinkedInButton mini={true} />
                </div>
                <div className='footer-button-container'>
                    <InstagramButton mini={true} />
                </div>
                <div className='footer-button-container'>
                    <GitHubButton mini={true} />
                </div>
            </div>
        </div>
    )
}