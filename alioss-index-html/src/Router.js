import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import App from './App';
import Help from './Help';

const Router = () => (
  <HashRouter>
    <Switch>
      <Route exact path="/" component={App}/>
      <Route exact path="/help" component={Help}/>
    </Switch>
  </HashRouter>
);


export default Router;
