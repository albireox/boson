/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2020-12-21
 *  @Filename: ViewManager.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import ConnectView from './views/connect';
import KeywordsView from './views/keywords';
import LogView from './views/log';
import MainView from './views/main';
import WeatherView from './views/weather';

// It seems we need <{}, {}> when extending the component but then the props
// passed to View() include the location object. Not sure why.
class ViewManager extends Component<{}, {}> {
  static Views(): { [key: string]: any } {
    return {
      main: <MainView />,
      connect: <ConnectView />,
      log: <LogView />,
      keywords: <KeywordsView />,
      weather: <WeatherView />
    };
  }

  static View(props: { location: { search: string } }) {
    let name = props.location.search.slice(1); // Remove the ? at the beginning.
    let view: any;
    if (name.includes('log')) {
      view = <LogView />;
    } else {
      view = ViewManager.Views()[name];
    }
    if (view == null) throw new Error(`View ${name} is undefined.`);
    return view;
  }

  render() {
    return (
      <BrowserRouter>
        <Route path='/' component={ViewManager.View} />
      </BrowserRouter>
    );
  }
}

export default ViewManager;
