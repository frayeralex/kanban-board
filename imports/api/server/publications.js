import { Meteor } from 'meteor/meteor';
import * as collection from '/imports/api/lib/collections';

Meteor.startup(()=>{
    //Board
    Meteor.publish("userBoards", function () {
        if(!this.userId) return this.ready();

        return collection.Boards.find({
            members: this.userId
        });
    });

    Meteor.publish("userBoard", function (_id) {
        if(!this.userId) return this.ready();
        const board = collection.Boards.findOne(_id);
        const members = board ? board.members : [0];

        return [
            collection.Boards.find({
                _id,
            }),
            collection.Columns.find({
                boardId: _id
            }),
            collection.Tasks.find({
                boardId: _id,
            }),
            Meteor.users.find({_id: {$in: members}},
                {fields: {username: 1}}),
        ]
    });

    //Task
    Meteor.publish("taskComments", function (taskId) {
        if(!this.userId) return this.ready();
        return [
            collection.Comments.find({taskId},{$sort: {createdAt: 1}}),
        ]
    });
});