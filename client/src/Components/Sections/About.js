import { useEffect } from 'react';
import { GitHubButton } from '../Buttons/Social/GitHubButton';
import { InstagramButton } from '../Buttons/Social/InstagramButton';
import { LinkedInButton } from '../Buttons/Social/LinkedInButton';
import './About.css';

export const About = () => {

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            // Loop over the entries
            entries.forEach(entry => {
              // If the element is visible
              if (entry.isIntersecting) {
                // Add the animation class
                entry.target.classList.add('about-social-button-active');
                return
              }
              entry.target.classList.remove('about-social-button-active')
            });
          });
          
        let target = '.about-social-button';
        document.querySelectorAll(target).forEach((i) => {
        if (i) {
            observer.observe(i);
        }
});
    }, [])

    return (
        <div className='about'>
            <div className='about-container'>
                <div className='about-info-card'>
                    <h2>Meet Ty Matson</h2>
                    <div>
                        I am a self taught software developer. Digging into my new passion, I focused on learning the basics of HTML, CSS, and JavaScript before putting it all together by learning React.<br /><br />
                        At my first start up, <p>MunchkinLabs</p> I was hired to join a small team of developers, responsible for a majority of the front end code and quickly learned what I needed to contribute to a fast growing environment. <br /><br />
                        After seeing the <p>"Groupify"</p> app built by my team and I at MunchkinLabs, I made the decision with a business partner to leave and start my own company.<br /><br />
                        I have since built and launched my greatest product yet, <p>Maxum</p>. The best showcase of everything I had learned until that point condensed into a full stack mobile app, available on the app store!<br /><br />
                        Since then I have worked on various other projects including <p>"coldcallcrushers.com"</p>, which is an AI personalized email generator specific to the sales industry.<br /><br />
                        When I am not working on my latest projects, I can be found at various pick up basketball locations around San Diego, hanging at the beach, or playing chess!
                    </div>
                </div>
                <div className='about-social'>
                    <div className='about-social-button' style={{"--i": 0, "--t": '20%'}}>
                        <LinkedInButton link="http://linkedin.com/in/tymatson" />
                    </div>
                    <div className='about-social-button' style={{"--i": 1, "--t": '-20%'}}>
                        <InstagramButton link="http://instagram.com/tymatson5" />
                    </div>
                    <div className='about-social-button' style={{"--i": 2, "--t": '15%'}}>
                        <GitHubButton link="http://github.com/tymatson109" />
                    </div>
                </div>
            </div>
        </div>
    )
};