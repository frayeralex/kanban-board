import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Header from '/imports/ui/components/Header';
import Alert from 'react-s-alert';

class App extends Component {
    render() {
        const { content } = this.props;

        return (
            <div id="app">
                <Header/>
                <div className="content">
                    {content}
                </div>
                <Alert stack={{limit: 3}} />
            </div>
        )
    }
}

App.propTypes = {
    content: PropTypes.element.isRequired,
};

export default App;

