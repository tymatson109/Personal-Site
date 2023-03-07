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
      <div ref={home} className="app-home section">
        <Intro />
        <HomeButton onClick={() => handleNav('about')}/>
      </div>
      <div id="about" ref={main} className='app-about section'>
        <About />
      </div>
      <div id='projects' ref={projects} className='app-projects section'>
        <Portfolio />
      </div>
      <div id='contact' ref={contact} className='app-contact section'>
        <Contact />
      </div>
      <div id='footer' className='section'>
        <Footer />
      </div>
      <Starscape />
    </div>
  );
}

export default App;
