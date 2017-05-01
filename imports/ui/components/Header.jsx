import React, { Component } from 'react';

class Header extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <header className="page-header-wrap">
                <h1 className="logo" onClick={()=>FlowRouter.go('Boards')}
                >Kanban Board</h1>
            </header>
        )
    }
}

export default Header;
