import React from "react";
import {
    Route,
    IndexRoute,
    Redirect
} from "react-router";
import App from "./components/App";
import Welcome from "./components/welcome/Welcome";
import ConnectToDoppler from "./components/connect_to_doppler/ConnectToDoppler";
import AboutPage from "./components/about/AboutPage";
import NotFound from "./components/not_found/NotFound";

export default (
    <Route path="/app" component={App}>
      <Redirect from="/" to="/app"/>
      <IndexRoute component={Welcome}/>
      <Route path="/app/connect-to-doppler" component={ConnectToDoppler}/>
      <Route path="/app/about" component={AboutPage}/>
      <Route path="*" component={NotFound}/>
    </Route>
);