import './SocialButton.css';
import { RxInstagramLogo } from 'react-icons/rx'


export const InstagramButton = ({link}) => {

    const handleClick = () => {
        window.location.href = link;
    }


    return (
        <button onClick={handleClick} className='social-button'>
            <div className='social-button-container'>
                <RxInstagramLogo className='social-button-icon' />
            </div>
            <div className='social-button-container'>
                <RxInstagramLogo className='social-button-icon' />
            </div>
        </button>
    )
};