import { GitHubButton } from '../Buttons/Social/GitHubButton';
import { InstagramButton } from '../Buttons/Social/InstagramButton';
import { LinkedInButton } from '../Buttons/Social/LinkedInButton';
import './Footer.css';

export const Footer = () => {
    return (
        <div className='footer'>
            <div className='footer-name'>Connect with me!</div>
            <div className='footer-container'>
                <div className='footer-button-container'>
                    <LinkedInButton mini={true} link={'http://linkedin.com/in/tymatson'} />
                </div>
                <div className='footer-button-container'>
                    <InstagramButton mini={true} link={'http://instagram.com/tymatson5'} />
                </div>
                <div className='footer-button-container'>
                    <GitHubButton mini={true} link={'http://github.com/tymatson109'} />
                </div>
            </div>
        </div>
    )
}