import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TaskPreview from '/imports/ui/components/TaskPreview';
import { dateFormat } from '/imports/api/lib/helpers';
import moment from 'moment';

class Column extends Component {
    constructor(){
        super();

        this.state = {
            editName: false
        }
    }

    updateColumnName(event){
        event.preventDefault();

        const { _id: id } = this.props.item;
        const name = this.columnName.value;
        if(!name) return console.error("Name is require!");

        const data = {
            name,
        };

        Meteor.call('updateColumn', id, data, err=>{
            if(err) return console.error(err);
            this.setState({editName: false})
        })
    }

    addNewTask(event){
        event.preventDefault();

        const { tasks } = this.props;
        const { _id: boardId } = this.props.board;
        const { _id: columnId } = this.props.item;
        const name = this.newTaskName.value;
        if(!name) return console.error("Name is require!");

        const data = {
            name,
            boardId,
            columnId,
            order: tasks.length
        };

        Meteor.call('createTask', data, err=>{
            if(err) return console.log(err);
            this.resetTaskForm();
        })
    }

    resetTaskForm(){
        this.newTaskName.value = '';
    }

    dragEnterColumn(data){
        //push data to parent
        const { dragEnterColumn, item } = this.props;
        dragEnterColumn(item);
    }

    dragEnd(data){
        //push data to parent
        const { dragEnd } = this.props;
        dragEnd(data);
    }

    dragEnterTask(data, event){
        event.preventDefault();
        //push data to parent
        const { dragEnterTask } = this.props;
        dragEnterTask(data);

        event.target.classList.add('active');
    }

    dragLeaveTask(event){
        event.target.classList.remove('active');
    }

    renderTaskList(){
        const { members } = this.props;
        const tasks = _.sortBy(this.props.tasks, 'order');

        const dropAreas = tasks.reduce((newArr, item)=>{
            if(newArr.length === 0) newArr.push({mask: Object.assign({after: false}, item)});
            newArr.push(item);
            newArr.push({mask: Object.assign({after: true}, item)});
            return newArr;
        }, []);

        const taskList = dropAreas.map((task,index)=>{
            if(task.mask){
                return (
                    <li key={`${task.mask}-${index}`}
                        className="drop-area"
                        onDragEnter={this.dragEnterTask.bind(this, task.mask)}
                        onDragLeave={this.dragLeaveTask.bind(this)}
                    />
                )
            }
            return(
                <li key={task._id}
                    className="task-item">
                    <TaskPreview item={task}
                                 members={members}
                                 dragEnd={this.dragEnd.bind(this)}/>
                </li>
            )
        });

        if(taskList.length === 0){
            taskList.push((
                <li key={`first-mask-area`}
                    onDragEnter={this.dragEnterTask.bind(this, {
                        order: 0,
                        columnId: this.props.item._id
                    })}
                    className="drop-area"
                    onDragLeave={this.dragLeaveTask.bind(this)}
                />
            ))
        }

        return (
            <ul className="task-list">
                {taskList}
                <li className="task-item">
                    <p>Add new task</p>
                    <form onSubmit={this.addNewTask.bind(this)}>
                        <input type="text"
                               className="default"
                               ref={ref=>this.newTaskName = ref}/>
                    </form>
                </li>
            </ul>
        )
    }

    renderInfo(){
        const { tasks } = this.props;
        let checkListStatus = null;
        let taskNumber = null;
        let remainMinutes = null;
        let estimateTime = null;
        if(tasks && tasks.length > 0){
            remainMinutes = 0;
            estimateTime = 0;
            taskNumber = <p>Cards: {tasks.length}</p>;
            const status = tasks
                .reduce((chekclists, item)=>{
                    if(item.timeDue) {
                        remainMinutes += moment(item.timeDue).diff(moment(), 'minutes');
                        estimateTime += moment(item.timeDue).diff(moment(item.createdAt), 'minutes');
                    }
                    if(item.checkList && item.checkList.length) {
                        chekclists = chekclists.concat(item.checkList);
                    }
                    return chekclists;
                },[])
                .reduce((result,arr)=>{
                    arr.items.forEach(task=>{
                        if(task.done) result.done += 1;
                        result.all +=1;
                    });
                    return result;
                },{done: 0, all: 0});
            if(status.all) checkListStatus = <p>{`Check List progress: (${status.done}/${status.all})`}</p>;
            estimateTime = estimateTime ? <p>Tasks estimate: {dateFormat(estimateTime, 'M-d-h')}</p> : null;
            remainMinutes = remainMinutes ? <p>Task remain: {dateFormat(remainMinutes, 'M-d-h')}</p> : null;
        }

        return (
            <div className="column-info">
                {taskNumber}
                {checkListStatus}
                {estimateTime}
                {remainMinutes}
            </div>
        );
    }

    removeColumn(){
        const { item } = this.props;

        Meteor.call('removeColumn', item._id);
    }

    render(){
        const { item } = this.props;
        const { editName } = this.state;
        let nameBlock = <h3 className="title"
                            onClick={(e)=>{this.setState({editName: true})}}>{item.name}</h3>;

        if(editName){
            nameBlock = (
                <form onSubmit={this.updateColumnName.bind(this)}>
                    <input type="text"
                           onBlur={()=>this.setState({editName: false})}
                           ref={ref=>this.columnName = ref}
                           className="trans-input"
                           autoFocus={true}
                           defaultValue={item.name}/>
                </form>
            )
        }

        return(
            <div className="column-container"
                 onDragEnter={this.dragEnterColumn.bind(this)}
            >
                {nameBlock}
                {this.renderInfo()}
                {this.renderTaskList()}
                <span className="remove-icon"
                      onClick={this.removeColumn.bind(this)}/>
            </div>
        )
    }
}

Column.propTypes = {
    item: PropTypes.object.isRequired,
    tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
    members: PropTypes.arrayOf(PropTypes.object).isRequired,
    board: PropTypes.object.isRequired,
    dragEnterTask: PropTypes.func.isRequired,
    dragEnterColumn: PropTypes.func.isRequired,
    dragEnd: PropTypes.func.isRequired,
};

export default Column;


