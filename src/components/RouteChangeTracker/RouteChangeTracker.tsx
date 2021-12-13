import React from 'react'

import { RouterProps, withRouter } from 'react-router-dom';
import ReactGA from 'react-ga';

function RouteChangeTracker({ history }: RouterProps) {
    history.listen((location) => {
        ReactGA.set({ page: location.pathname });
        ReactGA.pageview(location.pathname);
    });

    return <div />;
}

export default withRouter(RouteChangeTracker);
