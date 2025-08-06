import { NavLink } from "react-router-dom";

const NavBar = () => {
    return(
         <nav>
        <NavLink to="/">
        Ouvidoria <span> Jussara</span>
        </NavLink>
        <ul>
            <li>
                <NavLink to="/">Home</NavLink>
            </li>
            <li>
                <NavLink to="/">Home</NavLink>
            </li>
        </ul>



    </nav>
);
};