import { useRef } from 'react';
import './App.css';
import { HomeButton } from './Components/Buttons/HomeButton';
import { Nav } from './Components/Nav';
import { About } from './Components/Sections/About';
import { Portfolio } from './Components/Sections/Portfolio';
import { Starscape } from './Components/Starscape';
import { Intro } from './Components/Visuals/Intro';

function App() {
  const main = useRef();
  const projects = useRef();
  const home = useRef();

  const handleClick = () => {
    main.current?.scrollIntoView({behavior: 'smooth'})
  };

  const handleNav = (e) => {
    if (e === 'home') {
      const home = document.querySelector('.app-home')
      home.current?.scrollIntoView({behavior: 'smooth'})
      const nav = document.querySelector('.nav')
      nav.classList.remove('nav-visible');
    }
    if (e === 'projects') {
      projects.current?.scrollIntoView({behavior: 'smooth'})
    }
    if (e === 'about') {
      handleClick()
    }
  }
  return (
    <div className='app'>
      <Nav onClick={handleNav} />
      <div ref={home} className="app-home">
        <Intro />
        <HomeButton onClick={handleClick} title="About Me"/>
      </div>
      <div id="main" ref={main} className='app-main'>
        <About />
      </div>
      <div id='projects' ref={projects} className='app-projects'>
        <Portfolio />
      </div>
      <Starscape />
    </div>
  );
}

export default App;
