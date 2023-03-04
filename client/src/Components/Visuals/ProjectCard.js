import './ProjectCard.css';

export const ProjectCard = ({image, title, description, link}) => {

    return (
        <div className='project-card'>
            <img className='project-card-image' src={image} alt="Project" />
            <div className='project-card-info'>
                <div className='project-card-title'>{title}</div>
                <div className='project-card-description'>{description}</div>
                {link ? (
                    <a href={link} target={'_blank'} className='project-card-button' rel="noreferrer">Learn More</a>
                ) : (
                    <div className='project-card-button'>No Longer Available</div>
                )}
            </div>
        </div>
    )
};