import React from 'react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-dark text-light d-flex justify-content-center align-items-center py-3">
            <div>
                <small>
                    <p className="text-center m-0">Developed with love by <span className='fc3 fw-bold'>Issa Katana</span> &copy; {currentYear}</p>
                </small>
            </div>
        </footer>  
    );

}
