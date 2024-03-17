import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../header/Header';
import Footer from '../footer/Footer';


/* 
   Layout Component:
   This component serves as the layout structure for the entire application.
   It includes the Header, Outlet (for rendering routed components), and Footer.
*/
export default function Layout() {
    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <div className="flex-grow-1">
                <Outlet />
            </div>
            <Footer />
        </div>
    );
}


// sample HCC,  component based dynamic website code. 
// More call/wha +254 759 599 492
// mail info@hamiscodecraft.co.ke