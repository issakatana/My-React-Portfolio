import React from 'react';
import "./contact.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope, faMapMarkerAlt, faClock } from '@fortawesome/free-solid-svg-icons';

import ParticlesBackground from '../../particles/ParticlesBackground';

export default function Contact() {
  return (
      <div className="container-fluid bg-light px-0">

          <div className="container-fluid px-0 bg-contact">
            <div className="color-overlay d-flex justify-content-center align-items-center">
              <ContactHeader />
            </div>
          </div>

          <div className="container py-5">
            <div className="row mx-auto raised-top">
              <ContactInfo />
              <ContactForm />
            </div>
          </div>

      </div>
  );
}

function ContactHeader() {
  return (
      <div className="container">
        <div className="row">
            <div className="col-md-12 text-center">
                {/* <h2 className="fs-6 fw-bold">CONTACT ME</h2> */}
                <h1 className="fs-1 fw-bold">Get In Touch With Me</h1>
                <p className="lead">I would love to hear from you, and discuss how we can make your vision a reality.</p>
            </div>
        </div>
      </div>
  );
}


function ContactInfo() {
  return (
      <div className="col-md-6 px-0 custom-mb bg-issa">
          <div className="color-overlay2 p-4">
            <h6 className='mb-2'>CONTACT ME</h6>
            <h3 className='mb-4'>My Contact Information</h3>
            <p className="mb-2"><FontAwesomeIcon icon={faPhone} /> +254 759 599 492</p>
            <p className="mb-2"><FontAwesomeIcon icon={faEnvelope} /> issakatana855@gmail.com</p>
            <p className="mb-2"><FontAwesomeIcon icon={faMapMarkerAlt} /> P.O BOX, 1213-80201, Kilifi</p>
            <p className="mb-2"><FontAwesomeIcon icon={faClock} /> Mon-Fri, 8am - 5pm</p>
          </div>
      </div>
  );
}


function ContactForm() {
  return (
      <div className="col-md-6">
          <form>
              <div className="mb-3">
                  <label htmlFor="name" className="form-label fw-bold">Name</label>
                  <input type="text" className="form-control bg-light" id="name" placeholder="Enter your name or company name" />
              </div>
              <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-bold">Email</label>
                  <input type="email" className="form-control bg-light" id="email" placeholder="Enter your email" />
              </div>
              <div className="mb-3">
                  <label htmlFor="phone" className="form-label fw-bold">Phone Number</label>
                  <input type="tel" className="form-control bg-light" id="phone" placeholder="Enter your phone number" />
              </div>
              <div className="mb-3">
                  <label htmlFor="message" className="form-label fw-bold">Message</label>
                  <textarea className="form-control bg-light" id="message" rows="5" placeholder="Enter your message"></textarea>
              </div>
              <button type="submit" className="btn btn-primary px-5 fw-bold">Submit</button>
          </form>
      </div>
  );
}

