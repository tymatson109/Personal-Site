import { ProjectCard } from '../Visuals/ProjectCard';
import './Portfolio.css';
import ColdCallCrushers from '../../Assets/ColdCallCrushers.png';
import Maxum from '../../Assets/Maxum.png';
import Groupify from '../../Assets/Groupify.png';
import Maxumapp from '../../Assets/Maxumapp.png';

export const Portfolio = () => {
    return (
        <div className='portfolio-container'>
            <h2 className='portfolio-title'>My Projects</h2>
            <div className='portfolio'>
                <ProjectCard 
                    image={ColdCallCrushers} 
                    title={'ColdCallCrushers'}
                    description={"ColdCallCrushers is an AI powered personalized email generator build for sales professionals, specifically SDR's, to create highly personalized emails at a very fast pace."}
                    link={'http://coldcallcrushers.com'}
                />
                <ProjectCard 
                    image={Maxum}
                    title={'Maxum'}
                    description={'Maxum is a full stack mobile app for pick up athletes. Users can share where they are playing their sports with anyone else near them and create local communities around their sport!'}
                    link={'https://apps.apple.com/us/app/maxum/id1593452715?platform=iphone'}
                />
                <ProjectCard
                    image={Maxumapp}
                    title={'Maxumapp.com'}
                    description={'Maxumapp.com is a website built to advertise the Maxum app platform. '}
                    link={'http://maxumapp.com'}
                />
                <ProjectCard   
                    image={Groupify} 
                    title={'Groupify'}
                    description={'Groupify is no longer available on the app store but was my first major project. This app was built to create an easier way for users to make plans with their friends.'}
                />
            </div>
        </div>
    )
};