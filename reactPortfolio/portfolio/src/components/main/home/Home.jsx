import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Typed from 'typed.js';
import "./home.css";
import About from '../about/About';
import Contact from '../contact/Contact';
import Services from '../services/Services';


const Home = () => {
  return (
    <main className="container-fluid px-0 mx-0">

      <section className="container-fluid bg-home px-0 py-5 min-vh-100 d-flex justify-content-center align-items-center">

        <article className="container px-0 mt-5 d-flex justify-content-center align-items-center">
          <div className="col-md-6 px-5">
            <GreetingText />
            <IntroductionParagraph />
            <SocialLinks />
            <MoreAboutMeButton />
          </div>
          <div className="col-md-6 text-center">
          
          </div>
        </article>

      </section>  

      <section>
        <About includeAdditionalContent={false} />
      </section>

      {/* <section>
        <h1>Skills Here</h1>
      </section> */}

      <section>
        <Services />
      </section>

      {/* <section>
        <h1>Projetcs Here</h1>
      </section> */}
    
      <section>
        <Contact />
      </section>

    </main>
  );
}

export default Home;


const GreetingText = () => {
  useEffect(() => {
    const typed = new Typed('.auto-input', {
      strings: [
        'Software Engineer',
        'Frontend Developer',
        'Backend Architect',
      ],
      typeSpeed: 40,
      backSpeed: 10,
      backDelay: 2500,
      loop: true,
    });

    return () => {
      typed.destroy();
    };
  }, []);

  return (
    <article className="profile greeting">
      <p className="fw-bold fs-3 mb-0">Hi, I'm <span className='fc3'>Issa</span></p>
      <p className="fw-bold fs-4">Katana From Kenya</p>
      <p className="fw-bold">And I'm a <span className="auto-input fc3 fw-bold"></span></p>
    </article>
  );
};


const IntroductionParagraph = () => {
  return (
    <article className="profile message">
      <p>
        I'm a Software Engineer with over 3 years of experience. I specialize in creating user-friendly web and mobile apps. My goal is to build strong, interactive, and custom-made apps that meet your needs and make your users happy.
      </p>
    </article>
  );
};


const SocialLinks = () => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="profile social-icons">
          <ul className="social-icons-list list-inline d-flex justify-content-between align-items-center">
              <li className="list-inline-item ">
                <a href="#" className="btn btn-primary rounded-circle">
                  <i className="bx bxl-facebook"></i>
                </a>
              </li>
              <li className="list-inline-item">
                <a href="#" className="btn btn-danger rounded-circle">
                  <i className="bx bxl-instagram"></i> 
                </a>
              </li>
              <li className="list-inline-item">
                <a href="#" className="btn btn-info rounded-circle">
                  <i className="bx bxl-linkedin"></i>
                </a>
              </li>
              <li className="list-inline-item">
                <a href="#" className="btn btn-success rounded-circle">
                  <i className="bx bxl-whatsapp"></i> 
                </a>
              </li>
              <li className="list-inline-item">
                <a href="#" className="btn btn-warning rounded-circle">
                  <i className="bx bxl-tiktok"></i> 
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};


// const MoreAboutMeButton = () => {
//   return (
//     <article className="profile more-about-me mt-3">
//       <div className="d-flex justify-content-around">
//         <Link to='/contact' className="btn btn-primary">Contact Me</Link>
//         <Link to='/hire' className="btn btn-success">Hire Me</Link>
//       </div>
//     </article>
//   );
// };


const MoreAboutMeButton = () => {
  return (
    <article className="profile more-about-me mt-4">
      <div className="btn-group" role="group" aria-label="Contact and Hire buttons">
        <button type="button" className="btn btn-primary">
          <Link to='/contact' className="btn-link text-white text-decoration-none">Contact Me</Link>
        </button>
        <button type="button" className="btn btn-success">
          <Link to='/hire' className="btn-link text-white text-decoration-none">Hire Me</Link>
        </button>
      </div>
    </article>
  );
};

