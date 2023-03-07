import './HomeButton.css';
import { BsArrowDownShort } from 'react-icons/bs'

export const HomeButton = ({onClick}) => {
    return (
        <button onClick={onClick} className='home-button'>
            <BsArrowDownShort size={100} className='home-button-icon' />
        </button>
    )
};