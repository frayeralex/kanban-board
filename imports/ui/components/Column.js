import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TaskPreview from '/imports/ui/components/TaskPreview';

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

        //style
        event.target.style.height = '20px';
        event.target.style.border = '1px dashed #232323';
        event.target.style.margin = '10px 0';
    }

    dragLeaveTask(event){
        event.target.style.height = '20px';
        event.target.style.border = 'none';
        event.target.style.margin = '0';
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
                        style={{height: '20px'}}
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
                    style={{height: '20px'}}
                    onDragEnter={this.dragEnterTask.bind(this, {
                        order: 0,
                        columnId: this.props.item._id
                    })}
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
                {this.renderTaskList()}
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


