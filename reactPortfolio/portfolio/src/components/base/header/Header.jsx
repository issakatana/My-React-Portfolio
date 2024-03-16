import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Header() {
    return (
        <header>
            <NavLink to='/'>Katana.</NavLink>
            <nav>
                <NavLink to='/about'>About</NavLink>
                <NavLink to='/skills'>Skills</NavLink>
                <NavLink to='/services'>Services</NavLink>
                <NavLink to='/projects'>Projects</NavLink>
            </nav>
            <NavLink to='/contact'>Contact</NavLink>
        </header>
    );
}

  