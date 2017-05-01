import React from 'react';
import { mount } from 'react-mounter';
import { FlowRouter } from 'meteor/kadira:flow-router';

import App from '/imports/ui/App';
import SignIn from'/imports/ui/pages/SignIn';
import Boards from '/imports/api/composer/pages/Boards';
import Board from '/imports/api/composer/pages/Board';

FlowRouter.route('/', {
    name: "Boards",
    action(){
        if(!Meteor.userId()) return mount(SignIn);

        mount(App, {
            content: <Boards />
        });
    }
});

FlowRouter.route('/board/:id', {
    name: "Board",
    action(){
        if(!Meteor.userId()) return mount(SignIn);

        mount(App, {
            content: <Board />
        });
    }
});