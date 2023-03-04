import { useRef } from 'react';
import './App.css';
import { HomeButton } from './Components/Buttons/HomeButton';
import { Nav } from './Components/Nav';
import { About } from './Components/Sections/About';
import { Contact } from './Components/Sections/Contact';
import { Footer } from './Components/Sections/Footer';
import { Portfolio } from './Components/Sections/Portfolio';
import { Starscape } from './Components/Starscape';
import { Intro } from './Components/Visuals/Intro';

function App() {
  const main = useRef();
  const projects = useRef();
  const home = useRef();
  const contact = useRef();


  const handleNav = (e) => {
    if (e === 'home') {
      home.current?.scrollIntoView({behavior: 'smooth'})
    }
    if (e === 'projects') {
      projects.current?.scrollIntoView({behavior: 'smooth'})
    }
    if (e === 'about') {
      main.current?.scrollIntoView({behavior: 'smooth'})
    }
    if (e === 'contact') {
      contact.current?.scrollIntoView({behavior: 'smooth'})
    }
  }
  return (
    <div className='app'>
      <Nav onClick={handleNav} />
      <div ref={home} className="app-home">
        <Intro />
        <HomeButton onClick={() => handleNav('about')} title="About Me"/>
      </div>
      <div id="main" ref={main} className='app-main'>
        <About />
      </div>
      <div id='projects' ref={projects} className='app-projects'>
        <Portfolio />
      </div>
      <div id='contact' ref={contact} className='app-contact'>
        <Contact />
      </div>
      <Footer />
      <Starscape />
    </div>
  );
}

export default App;
