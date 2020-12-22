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
import LogWindow from './views/MainView';


// It seems we need <{}, {}> when extending the component but then the props
// passed to View() include the location object. Not sure why.
class ViewManager extends Component<{}, {}> {
  static Views(): {[key: string]: any} {
    return {
      main: <LogWindow />,
    }
  }

  static View(props: {location: {search: string}}) {
    let name = props.location.search.slice(1); // Remove the ? at the beginning.
    let view = ViewManager.Views()[name];
    if(view == null) throw new Error(`View ${name} is undefined.`);
    return view;
  }

  render() {
    return (
      <BrowserRouter>
        <div>
          <Route path='/' component={ViewManager.View} />
        </div>
       </BrowserRouter>
    );
  }
}

export default ViewManager;
