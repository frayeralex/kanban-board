import { Mongo } from  'meteor/mongo';
import BoardSchema from '/imports/api/models/Board'
import ColumnSchema from '/imports/api/models/Column'
import TaskSchema from '/imports/api/models/Task'
import CommentsSchema from '/imports/api/models/Comments';

export const Boards = new Mongo.Collection('Boards');
Boards.attachSchema(BoardSchema);

export const Columns = new Mongo.Collection('Columns');
Columns.attachSchema(ColumnSchema);

export const Tasks = new Mongo.Collection('Tasks');
Tasks.attachSchema(TaskSchema);

export const Comments = new Mongo.Collection('Comments');
Comments.attachSchema(CommentsSchema);

const fileStore = new FS.Store.FileSystem("files");

export const Files = new FS.Collection("files", {
    stores: [fileStore]
});

//edit if need custom rules for Files collection
Files.allow({
    insert: function(){
        return true;
    },
    update: function(){
        return true;
    },
    remove: function(){
        return true;
    },
    download: function(){
        return true;
    }
});

