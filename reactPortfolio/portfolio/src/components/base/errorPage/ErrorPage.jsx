import React from "react";
import { Link } from "react-router-dom";


export default function ErrorPage() {
    return (
        <section className="ErrorPage">
            <h1>404</h1>
            <p>Page Not Found</p>
            <Link to='/'>Back Home</Link>
        </section>
    )
}