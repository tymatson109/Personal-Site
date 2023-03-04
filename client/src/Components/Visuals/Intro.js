import { useEffect } from 'react';
import { write } from '../Functions/CssFunctions';
import './Intro.css';

export const Intro = () => {
    useEffect(() => {
        const e = document.querySelector('.intro-text')
        write(e);
      }, [])

    return (
        <h1 className='intro-text' data-value="Hello I'm Ty">Hello I'm Ty</h1>
    )
};