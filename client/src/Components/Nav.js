import { useEffect, useState } from 'react';
import { nameScramble } from './Functions/CssFunctions';
import { respondToVisibility } from './Functions/Misc';
import './Nav.css';

export const Nav = ({onClick}) => {
    const [active, setActive] = useState();
    const [width, setWidth] = useState();

    useEffect(() => {
        const about = document.querySelector('.app-about')
        const home = document.querySelector('.app-home')
        const projects = document.querySelector('.app-projects')
        const contact = document.querySelector('.app-contact')
        respondToVisibility(home, handleFocus)
        respondToVisibility(about, handleFocus)
        respondToVisibility(projects, handleFocus)
        respondToVisibility(contact, handleFocus)

        window.addEventListener('resize',   getWidth)

        return () => {
            window.removeEventListener('resize', getWidth)
        }

    }, [])

    useEffect(() => {
        document.querySelector('.nav-mini-menu-item-one').onmouseover = e => {
            nameScramble(e);
        }
        document.querySelector('.nav-mini-menu-item-two').onmouseover = e => {
            nameScramble(e);
        }
        document.querySelector('.nav-mini-menu-item-three').onmouseover = e => {
            nameScramble(e);
        }
        document.querySelector('.nav-mini-menu-item-four').onmouseover = e => {
            nameScramble(e);
        }
    }, [])

    const getWidth = () => {
        const windowWidth = window.innerWidth
        setWidth(windowWidth);
    }
  
    const handleFocus = (bool, element) => {
        if (bool === true) {
            setActive(element.id)
        }
    }

    const handleOpenMiniMenu = () => {
        const menu = document.querySelector('.nav-menu-mini-overlay')
        menu.classList.add('nav-menu-mini-overlay-visible')
        document.addEventListener("keydown", escFunction, false)
    }


    const handleCloseMiniMenu = (item) => {
        const menu = document.querySelector('.nav-menu-mini-overlay')
        menu.classList.remove('nav-menu-mini-overlay-visible')
        document.removeEventListener("keydown", escFunction, false)
        if (item) {
            onClick(item)
        }
    }

    const escFunction = (event) => {
        if (event.key  === 'Escape') {
            handleCloseMiniMenu()
        }
    };

    return (
        <div className='nav'>
            {width < 800 ? (
                <button onClick={handleOpenMiniMenu} className='nav-menu-button'>
                    <div className='nav-menu-button-container'>
                        <div className='nav-menu-button-text'>{active}</div>
                    </div>
                    <div className='nav-menu-button-container'>
                        <div className='nav-menu-button-text'>Menu</div>
                    </div>            
                </button>
            ) : !active ? (
                <div>
                </div>
            ) : (
                <div className='nav-container'>
                    <div onClick={() => handleCloseMiniMenu('home')} className='nav-container-logo'>TM</div>
                    <div className='nav-container-list'>
                        <button onClick={() => handleCloseMiniMenu('about')} style={{ color: active === 'about' ? '#ff3366' : 'black' }} className='nav-container-item'>About</button>
                        <button onClick={() => handleCloseMiniMenu('projects')} style={{ color: active === 'projects' ? '#ff3366' : 'black' }} className='nav-container-item'>Projects</button>
                        <button onClick={() => handleCloseMiniMenu('contact')} style={{ color: active === 'contact' ? '#ff3366' : 'black' }} className='nav-container-item'>Contact</button>
                    </div>
                </div>
            )}
            <div className='nav-menu-mini-overlay'>
                <button onClick={handleCloseMiniMenu} className='nav-menu-button'>
                    <div className='nav-menu-button-container'>
                        <div className='nav-menu-button-text'>Exit</div>
                    </div>
                    <div className='nav-menu-button-container'>
                        <div className='nav-menu-button-text'>Exit</div>
                    </div>                   
                </button>
                <div className='nav-mini-menu'>
                <button data-value="Home" onClick={() => handleCloseMiniMenu('home')} className='nav-mini-menu-item nav-mini-menu-item-one'>
                    Home
                </button>
                <button data-value="About" onClick={() => handleCloseMiniMenu('about')} className='nav-mini-menu-item nav-mini-menu-item-two'>
                    About
                </button>
                <button data-value="Portfolio" onClick={() => handleCloseMiniMenu('projects')} className='nav-mini-menu-item nav-mini-menu-item-three'>
                    Portfolio
                </button>
                <button data-value="Contact" onClick={() => handleCloseMiniMenu('contact')} className='nav-mini-menu-item nav-mini-menu-item-four'>
                    Contact
                </button>
            </div>
            </div>
        </div>
    )
};