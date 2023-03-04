import './HomeButton.scss';

export const HomeButton = ({onClick, title}) => {
    return (
        <button onClick={onClick} className='button bounce'>
            <span>{title}</span>
        </button>
    )
};