import React from 'react';
import "./services.css";
import { Link } from 'react-router-dom';


export default function Services() {
  return (
    <div className="container-fluid px-0 py-5 min-vh-100 d-flex justify-content-center align-items-center bg-services">
      <div className="container py-5">
        <h3 className='fc3 fw-bold my-4'>My <span className='fc4'>Services</span></h3>
        <div className="res__divider sst"></div>
        <div className="row">
          <AIConsulting />
          <FullStackDevelopment />
          <BigDataAnalytics />
        </div>
      </div>
    </div>
  );
}


const AIConsulting = () => {
  return (
    <div className="col-lg-4 col-md-6 mb-4">
      <div className="card">
        <div className="card-body">
          <i className="fas fa-robot fw-bold fs-2 text-success"></i>
          <h2 className="card-title fs-4 my-1">AI Strategies and Consulting</h2>
          <p className="card-text">Providing strategic guidance and consulting services to help organizations harness the power of artificial intelligence. I evaluate your needs and identify opportunities for AI adoption, ensuring alignment with your business objectives.</p>
          <Link to="/services" className="btn border-0 btn-outline-primary">Learn More</Link>
        </div>
      </div>
    </div>
  );
};

const FullStackDevelopment = () => {
  return (
    <div className="col-lg-4 col-md-6 mb-4">
      <div className="card">
        <div className="card-body">
          <i className="fas fa-code fw-bold fs-2 text-primary"></i>
          <h2 className="card-title fs-4 my-1">Full-Stack Development</h2>
          <p className="card-text">Expertise in both front-end and back-end development, delivering end-to-end solutions. I create user-friendly interfaces and robust server-side logic, ensuring your applications are fully functional.</p>
          <Link to="/services" className="btn border-0 btn-outline-primary">Learn More</Link>
        </div>
      </div>
    </div>
  );
};

const BigDataAnalytics = () => {
  return (
    <div className="col-lg-4 col-md-6 mb-4">
      <div className="card">
        <div className="card-body">
          <i className="fas fa-database fw-bold fs-2 text-success"></i>
          <h2 className="card-title fs-4 my-1">Big Data Analytics</h2>
          <p className="card-text">Proficiency in handling and analyzing large datasets using tools like Python and PowerBI. I uncover valuable insights from your data, enabling data-driven decisions that drive your business forward.</p>
          <Link to="/services" className="btn border-0 btn-outline-primary">Learn More</Link>
        </div>
      </div>
    </div>
  );
};

