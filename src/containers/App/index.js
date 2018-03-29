// Core
import React, { Component } from 'react';
import { string } from 'prop-types';

// Components
import { Scheduler } from 'components/Scheduler';

const options = {
    api: 'https://lab.lectrum.io/hw/todo/api/',
    token: ''
};

export default class App extends Component {

    static childContextTypes = {
        api:       string.isRequired,
        token:     string.isRequired
    }

    getChildContext () {
        return options;
    }

    render () {
        return (
            <section>
                <Scheduler />
            </section>
        );
    }

}
