import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Column from '/imports/ui/components/Column';


class Board extends Component {
    constructor(){
        super();

        this.state = {
            addColumnFormActive: false,
            columnDropEnd: null,
            dropTarget: null
        }
    }

    addColumn(event){
        event.preventDefault();

        const { columns } = this.props;
        const { _id: boardId } = this.props.board;
        const name = this.columnName.value;
        if(!name) return console.error("Name is empty");

        const data = {
            name,
            boardId,
            order: columns.length,
        };

        Meteor.call('createColumn', data, (err,res)=>{
            if(err) return console.error(err);
            this.setState({addColumnFormActive: false})
        });
    }

    dragEnterTask(dropTarget){
        this.setState({dropTarget});
    }

    dragEnterColumn(columnDropEnd){
        this.setState({columnDropEnd: columnDropEnd.columnId});
    }

    dragEnd(dropElement){
        const { dropTarget, columnDropEnd } = this.state;

        console.log("dropElement", dropElement)
        console.log("dropTarget", dropTarget)
        console.log("columnDropEnd", columnDropEnd)

        const updateCb = (err)=> {
            if(err) return console.error(err);
            this.setState({
                columnDropEnd: null,
                dropTarget: null,
            });
        };

        if(dropElement.columnId === dropTarget.columnId){
            if(dropElement._id === dropTarget._id) return;

            Meteor.call('changeTaskOrder', dropElement, dropTarget, updateCb);
        }else{
            Meteor.call('dropTaskFromColumn', dropElement, updateCb);

            Meteor.call('pushTaskToCollection', dropElement, dropTarget, updateCb);
        }
    }

    renderColumns(){
        const { columns, tasks, board, members } = this.props;
        const columnList = columns.map(column=>{
            return (
                <li className="column-item"
                    key={column._id}>
                    <Column item={column}
                            members={members}
                            board={board}
                            dragEnterTask={this.dragEnterTask.bind(this)}
                            dragEnterColumn={this.dragEnterColumn.bind(this)}
                            dragEnd={this.dragEnd.bind(this)}
                            tasks={tasks.filter(task=>task.columnId === column._id)}/>
                </li>
            )
        });

        return(
            <ul className="column-list">
                {columnList}
                <li className="column-item">
                    {this.renderAddColumnForm()}
                </li>
            </ul>
        )
    }

    renderAddColumnForm(){
        const { addColumnFormActive } = this.state;

        if(addColumnFormActive){
            return(
                <form onSubmit={this.addColumn.bind(this)}>
                    <input type="text"
                           className="default"
                           autoFocus={true}
                           onBlur={()=>this.setState({addColumnFormActive: false})}
                           ref={(ref)=>this.columnName = ref}/>
                </form>
            )
        }
        return (
            <button onClick={()=>this.setState({addColumnFormActive: true})}
                    className="main-btn">Create new column</button>
        )
    }

    render() {
        const { board } = this.props;

        return (
            <div className="single-board">
                <h2 className="border-head">"{board.name}" board</h2>
                {this.renderColumns()}
            </div>
        )
    }
}

Board.propTypes = {
    board: PropTypes.object.isRequired,
    columns: PropTypes.arrayOf(PropTypes.object),
    tasks: PropTypes.arrayOf(PropTypes.object),
    members: PropTypes.arrayOf(PropTypes.object),
};

export default Board;


