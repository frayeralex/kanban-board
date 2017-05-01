import React from 'react';
import { compose } from 'react-komposer';
import getTrackerLoader from '../traker';
import Board from '/imports/ui/pages/Board';
import * as collections from '/imports/api/lib/collections';


const reactiveMapper = (props, onData)=> {
    const boardId = FlowRouter.getParam('id');

    if(Meteor.subscribe('userBoard', boardId).ready()){
        const tasks = collections.Tasks.find().fetch();
        const columns = collections.Columns.find().fetch();
        const board = collections.Boards.findOne();
        const members = Meteor.users.find().fetch();
        onData(null, { board, columns, tasks, members })
    }
};

export default compose(getTrackerLoader(reactiveMapper))(Board);