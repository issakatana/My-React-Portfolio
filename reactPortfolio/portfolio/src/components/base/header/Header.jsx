import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import "./header.css";

export default function Header() {
    const [scrolling, setScrolling] = useState(false);

    // Function to handle scroll events
    const handleScroll = () => {
        if (window.scrollY > 0) {
            setScrolling(true);
        } else {
            setScrolling(false);
        }
    };

    useEffect(() => {
        // Attach scroll event listener when the component mounts
        window.addEventListener("scroll", handleScroll);
        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <nav className={`navbar navbar-dark fixed-top py-3 ${scrolling ? 'bg-black' : ''}`}>
            <div className="container">
                <CompanyLogo />
                <MediaScreenToggleButton />
                <BigScreenNavigationBar />
                <SmallScreenNavigationBar />
            </div>
        </nav>
    );

}


function CompanyLogo() {
    return (
        <>
            <Link to='/' style={{ textDecoration: 'none' }}>
                <span className='fc3 fw-bold fs-3'>Ka<span className='fc4'>tana</span>.</span>
            </Link>
        </>
    )
}

function MediaScreenToggleButton() {
    return (
        <>
            <button
                className="navbar-toggler d-lg-none"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasDarkNavbar"
                aria-controls="offcanvasDarkNavbar"
                aria-label="Toggle navigation"
            >
                <span className="navbar-toggler-icon"></span>
            </button>
        </>
    )
}

function BigScreenNavigationBar() {
    return (
        <nav className='d-none d-lg-block'>
            <NavLink 
                to='/about'
                end
                className={({isActive}) => isActive ? "active-link" : "fc4"}
                style={{ marginLeft: '1.875rem' }} 
            >
                About
            </NavLink>
            <NavLink
                to='/skills'
                className={({isActive}) => isActive ? "active-link" : "fc4"}
                style={{ marginLeft: '1.875rem' }}
            >
                Skills
            </NavLink>
            <NavLink
                to='/services'
                className={({isActive}) => isActive ? "active-link" : "fc4"}
                style={{ marginLeft: '1.875rem' }}
            >
                Services
            </NavLink>
            <NavLink 
                to='/projects'
                className={({isActive}) => isActive ? "active-link" : "fc4"}
                style={{ marginLeft: '1.875rem' }}
            >
                Projects
            </NavLink>
            <NavLink 
                to='/contact' 
                className={({isActive}) => isActive ? "btn btn-primary px-4" : "btn custom-danger px-4"}
                style={{ marginLeft: '10rem' }}
            >
                Contact
            </NavLink>
        </nav>
    )
}

function SmallScreenNavigationBar() {
    return (
        <div 
            className="offcanvas offcanvas-end bg-dark" 
            tabIndex="-1" id="offcanvasDarkNavbar"
            aria-labelledby="offcanvasDarkNavbarLabel"
        >
            <div className="offcanvas-header">
                <Link to='/' style={{ textDecoration: 'none' }}>
                    <span className='offcanvas-title fc3 fw-bold fs-3' id="offcanvasDarkNavbarLabel">Ka<span className='fc4'>tana</span>.</span>
                </Link>
                <button type="button" className="btn-close btn-close-dark" data-bs-dismiss="offcanvas" aria-label="Close">
                    <i className="fas fa-times text-red fs-3"></i> 
                </button>
            </div>
            <div className="offcanvas-body">
                <ul className="navbar-nav justify-content-end flex-grow-1 pe-lg-3">
                <li className="nav-item me-lg-2">
                        <a className="nav-link active text-white" aria-current="page" href="/about">About</a>
                    </li>
                    <li className="nav-item me-lg-2">
                        <a className="nav-link active text-white" aria-current="page" href="/skills">Skills</a>
                    </li>
                    <li className="nav-item me-lg-2">
                        <a className="nav-link active text-white" aria-current="page" href="/services">Services</a>
                    </li>
                    <li className="nav-item me-lg-2">
                        <a className="nav-link active text-white" aria-current="page" href="/projects">Projects</a>
                    </li>
                    <li className="nav-item me-lg-2 mt-5">
                        <a className="nav-link active text-white btn btn-primary" aria-current="page" href="/contact">Contact</a>
                    </li>
                </ul>
            </div>
        </div>
    )
}