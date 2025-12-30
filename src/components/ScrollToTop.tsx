import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Scrolls the window to the top whenever the route pathname changes.
 * Place this inside the <Router> but outside of <Routes>.
 */
const ScrollToTop = () => {
    const { pathname, search } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname, search]);

    return null;
};

export default ScrollToTop;
