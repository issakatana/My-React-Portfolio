import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/base/layout/Layout';

import BriefSkills from './components/main/about/aboutextentions/BriefSkills';
import Education from './components/main/about/aboutextentions/Education';
import Experience from './components/main/about/aboutextentions/Experience';

import Home from './components/main/home/Home';
import About from './components/main/about/About';
import Skills from './components/main/skills/Skills';
import Services from './components/main/services/Services';
import Projects from './components/main/projects/Projects';
import Contact from './components/main/contact/Contact';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />}>

          <Route path='/' element={<Home includeAdditionalContent={true} />} >
            <Route index element={<BriefSkills />} />
            <Route path='experience' element={<Experience />} /> 
            <Route path='education' element={<Education />} />
          </Route>
    
          <Route path='about' element={<About includeAdditionalContent={true} />} />
          
          <Route path='skills' element={<Skills />} />
          <Route path='services' element={<Services />} />
          <Route path='projects' element={<Projects />} />
          <Route path='contact' element={<Contact />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
