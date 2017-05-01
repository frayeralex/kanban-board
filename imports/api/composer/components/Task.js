import React from 'react';
import { compose } from 'react-komposer';
import getTrackerLoader from '../traker';
import Task from '/imports/ui/components/Task';
import * as collections from '/imports/api/lib/collections';


const reactiveMapper = (props, onData)=> {
    if(Meteor.subscribe('taskComments', props.item._id).ready()){
        const comments = collections.Comments.find({},{sort: {createdAt: -1}}).fetch();

        onData(null, { comments })
    }
};

export default compose(getTrackerLoader(reactiveMapper))(Task);