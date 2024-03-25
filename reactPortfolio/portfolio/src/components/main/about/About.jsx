import React from 'react';
import { AboutImages } from './AboutImages';
import "./about.css";
import { NavLink, Outlet } from 'react-router-dom';


const About = ({ includeAdditionalContent }) => {

  // Additional content for DetailedProfile
  const additionalContent = includeAdditionalContent
    ? <>
        <p>One of the pivotal moments during my academic journey was when I embarked on a project to develop a graduation class predictor. This project not only solidified my understanding of programming concepts but also ignited my curiosity to explore further in the field of software engineering. Since then, I have been dedicated to honing my skills and expanding my knowledge in this dynamic and ever-evolving field.</p>
        
        <p>My goal is to build my career in a growth-oriented company, a company that encourages teamwork and 
        commitment to its goals where I can enjoy solving problems and making a solution.</p>
      </>
    : null;

  return (
    <div className="container-fluid px-0 py-5 min-vh-100 d-flex justify-content-center align-items-center bgc-about-custom"> 
      <div className="container py-5"> 
        <div className="row d-flex justify-content-center align-items-center">
          <div className="col-12 col-md-5 px-3"> 
            <CarImage />
          </div>
          <div className="col-12 col-md-7 px-3"> 
            <DetailedProfile additionalContent={additionalContent} />
            {!includeAdditionalContent && <LandingPageAboutSharedNav />}
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
export default About;


const CarImage = () => {
  return (
    <div className="card border-0">
      <img 
        src={AboutImages.graduationPic} 
        className="card-img-top img-fluid" 
        alt="Car"
        style={{ maxHeight: '500px' }} 
      />
    </div>
  );
};


const DetailedProfile = ({ additionalContent }) => {
  return (
    <article className="profile detailed-profile mt-3">
      <h3 className='fc3 fw-bold'>About <span className='fc4'>Me</span></h3>
      {/* <h4 className='fc4'>Software Engineer</h4> */}
      <p className='fc4'>
        My journey in Software Engineering has been both challenging and rewarding. It all started during my undergraduate years when I pursued a BSc. in Statistics. While in my 3rd year, I encountered a unit called Programming Methodology, where I was introduced to the world of programming through languages like C++. It was during this time that my interest and passion for software engineering began to flourish.
      </p>
      {additionalContent && <p className="fc4">{additionalContent}</p>}
    </article>
  );
};


const LandingPageAboutSharedNav = () => {
  return (
    <nav>
      <NavLink 
        to="."
        end
        className={({isActive}) => isActive ? "active-link" : "fc4"}
        style={{ marginLeft: '1.875rem' }} 
      >
        Skills
      </NavLink>
      <NavLink 
        to="experience"
        className={({isActive}) => isActive ? "active-link" : "fc4"}
        style={{ marginLeft: '1.875rem' }} 
      >
        Experience
      </NavLink>
      <NavLink 
        to="education"
        className={({isActive}) => isActive ? "active-link" : "fc4"}
        style={{ marginLeft: '1.875rem' }} 
      >
        Education
      </NavLink>
    </nav>
  );
};


