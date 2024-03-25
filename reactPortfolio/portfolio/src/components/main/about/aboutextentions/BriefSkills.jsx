import React from 'react';
import { Link } from 'react-router-dom';


const BriefSkills = () => {
  return (
    <div className='container mx-3'>
      <div className='row mt-2'>
        <FrontendSkillsComponent />
        <BackendSkillsComponent />
      </div>
      <div className='row'>
        <SoftwareEngineeringComponent />
      </div>
      <div className='row'>
        <MoreSkillsButtonComponent />
      </div>
    </div>
  );
};

export default BriefSkills;


const FrontendSkillsComponent = () => {
  return (
    <div className='col-12 col-md-6'>
      <h1 className='fs-5 mt-1'>Frontend</h1>
      <div className='d-flex flex-wrap'>
        <div className='col-4'>
          <p className='mb-2'>HTML</p>
        </div>
        <div className='col-4'>
          <p className='mb-2'>CSS</p>
        </div>
        <div className='col-4'>
          <p className='mb-2'>JavaScript</p>
        </div>
        <div className='col-4'>
          <p className='mb-2'>GIT & Github</p>
        </div>
        <div className='col-4'>
          <p className='mb-2'>Tailwind</p>
        </div>
        <div className='col-4'>
          <p className='mb-2'>React</p>
        </div>
      </div>
    </div>
  );
};


const BackendSkillsComponent = () => {
  return (
    <div className='col-12 col-md-6'>
      <h1 className='fs-5 mt-1'>Backend</h1>
      <div className='d-flex flex-wrap'>
        <div className='col-4'>
          <p className='mb-2'>Python</p>
        </div>
        <div className='col-4'>
          <p className='mb-2'>Django</p>
        </div>
        <div className='col-4'>
          <p className='mb-2'>SQL</p>
        </div>
        <div className='col-4'>
          <p className='mb-2'>Hosting</p>
        </div>
        <div className='col-4'>
          <p className='mb-2'>API</p>
        </div>
        <div className='col-4'>
          <p className='mb-2'>GraphQL</p>
        </div>
        <div className='col-4'>
          <p className='mb-2'>Testing</p>
        </div>
        <div className='col-4'>
          <p className='mb-2'>Web Servers</p>
        </div>
      </div>
    </div>
  );
};


const SoftwareEngineeringComponent = () => {
  return (
    <div className='col-12 col-md-6'>
      <h1 className='fs-5'>Software Engineering</h1>
      <div className='d-flex flex-wrap'>
        <div className='col-12'>
          <p className='mb-2'>Software Design, Architecture & Development</p>
        </div>
        <div className='col-12'>
          <p className='mb-2'>Web Application Development</p>
        </div>
        <div className='col-12'>
          <p className='mb-2'>Dynamic and Interactive Websites</p>
        </div>
      </div>
    </div>
  );
};


const MoreSkillsButtonComponent = () => {
  return (
    <div className='col-12'>
      <Link to='skills' className='btn btn-outline-primary px-4 mt-3'>
        More <i className='fas fa-arrow-right mx-1'></i>
      </Link>
    </div>
  );
};

