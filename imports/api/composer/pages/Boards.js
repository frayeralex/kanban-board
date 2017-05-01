import React from 'react';
import { compose } from 'react-komposer';
import getTrackerLoader from '../traker';
import Boards from '/imports/ui/pages/Boards';
import * as collections from '/imports/api/lib/collections';


const reactiveMapper = (props, onData)=> {

    if(Meteor.subscribe('userBoards').ready()){
        const items = collections.Boards.find().fetch();
        onData(null, { items })
    }
};

export default compose(getTrackerLoader(reactiveMapper))(Boards);