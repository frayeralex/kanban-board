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
