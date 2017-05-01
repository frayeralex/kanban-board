import { Meteor } from 'meteor/meteor';
import * as collections from '/imports/api/lib/collections';


Meteor.methods({
    /* Board actions */
    createBoard(data){
        data.createdBy = this.userId;
        data.members = [this.userId];
        collections.Boards.insert(data);
    },

    updateBoard(id, data){

        collections.Boards.update(id, {$set: data});
    },

    removeBoard(id){

        collections.Boards.remove(id);
    },


    /* Column actions */
    createColumn(data){
        data.createdBy = this.userId;
        collections.Columns.insert(data);
    },

    updateColumn(id, data){

        collections.Columns.update(id, {$set: data});
    },

    /* Task actions */
    createTask(data){
        data.createdBy = this.userId;
        collections.Tasks.insert(data);
    },

    updateTask(id, data){

        collections.Tasks.update(id, {$set: data});
    },

    pushChecklistToTask(task, newCheckList){
        const { checkList, _id } = task;
        let updateData = [newCheckList];
        if(checkList && checkList.length > 0) {
            updateData = [...checkList];
            updateData.push(newCheckList);
        }

        return collections.Tasks.update(_id, {$set: {checkList: updateData}})
    },

    changeTaskOrder(task, target){
        const targetOrder = target.after ? target.order + 1 : target.order;

        if(task.order < targetOrder){
            collections.Tasks.find({
                columnId: task.columnId,
                order: {$gt: task.order, $lt: targetOrder}
            }).forEach(item=>{
                collections.Tasks.update(item._id, {$inc: {
                    order: - 1
                }});
            });
        }else if (task.order > targetOrder){
            collections.Tasks.find({
                columnId: task.columnId,
                order: {$gte: targetOrder, $lt: task.order}
            }).forEach(item=>{
                collections.Tasks.update(item._id, {$inc: {
                    order: 1
                }});
            });
        }
        collections.Tasks.update(task._id, {$set: {
            order: targetOrder,
        }});
    },

    dropTaskFromColumn(task){
        collections.Tasks.find({
            columnId: task.columnId,
            order: {$gt: task.order}
        }).forEach(item=>{
            collections.Tasks.update(item._id, {$inc: {
                order: -1
            }});
        })
    },

    pushTaskToCollection(task, target){
        const targetOrder = target.after ? target.order + 1 : target.order;

        collections.Tasks.find({
            columnId: target.columnId,
            order: {$gte: targetOrder}
        }).forEach(item=>{
            collections.Tasks.update(item._id, {$inc: {
                order: 1
            }});
        });
        collections.Tasks.update(task._id, {$set: {
            order: targetOrder,
            columnId: target.columnId
        }});
    },

    /* Comment actions *///

    createComment(data){
        data.createdBy = this.userId;
        collections.Comments.insert(data);
    },

    updateComment(id, data){

        collections.Comments.update(id, {$set: data});
    },

    removeComment(id){

        collections.Comments.remove(id);
    },
});