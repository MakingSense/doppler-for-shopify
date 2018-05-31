import React from "react";
import {
    Route,
    IndexRoute,
    Redirect
} from "react-router";
import initialState from './reducers/initialState';

import App from "./components/App";
import Welcome from "./components/welcome/Welcome";
import ConnectToDoppler from "./components/connect_to_doppler/ConnectToDoppler";
import SetupDopplerList from "./components/setup_doppler_list/SetupDopplerList";
import FieldsMapping from "./components/fields_mapping/FieldsMapping";
import AboutPage from "./components/about/AboutPage";
import NotFound from "./components/not_found/NotFound";

const getIndexRouteComponent = function() {
    if (initialState.appSetup.dopplerListId)
        return FieldsMapping;
    if (initialState.appSetup.dopplerAccountName != '')
        return SetupDopplerList;
    return Welcome;
}

export default (
    <Route path="/app" component={App}>
      <Redirect from="/" to="/app"/>
      <IndexRoute component={getIndexRouteComponent()} />
      <Route path="/app/welcome" component={Welcome}/>
      <Route path="/app/connect-to-doppler" component={ConnectToDoppler}/>
      <Route path="/app/setup-doppler-list" component={SetupDopplerList}/>
      <Route path="/app/fields-mapping" component={FieldsMapping}/>
      <Route path="/app/about" component={AboutPage}/>
      <Route path="*" component={NotFound}/>
    </Route>
);

