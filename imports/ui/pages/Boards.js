import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import BoardCard from '/imports/ui/components/BoardCard';



class Boards extends Component {
    constructor(){
        super();
        this.state = {
            activeFormMode: false
        }
    }

    submitNewBoard(event){
        event.preventDefault();

        const { items } = this.props;
        const data = {
            name: this.boardName.value,
            order: items.length
        };

        Meteor.call('createBoard', data, (err,res)=>{
            if(err) return console.error(err);
            this.resetForm();
        });
    }

    resetForm(){
        this.boardName.value = '';
        this.setState({activeFormMode: false})
    }

    goToBoard(id, event){
        const { nodeName } = event.target;
        if(nodeName === 'BUTTON' || nodeName === 'INPUT' || nodeName === 'TEXTAREA') return;

        FlowRouter.go('Board', { id });
    }

    renderBoards(){
        const { items } = this.props;
        const itemList = items.map(item=>{
            return (
                <li key={item._id}
                    onClick={this.goToBoard.bind(this, item._id)}
                    className="board-item ">
                    <BoardCard item={item}/>
                </li>
            )
        });

        return (
            <ul className="boards-container">
                {itemList}
                <li className="add-board">
                    {this.renderAddBoardForm()}
                </li>
            </ul>
        )
    }

    renderAddBoardForm(){
        const { activeFormMode } = this.state;

        if(activeFormMode){
            return(
                <form onSubmit={this.submitNewBoard.bind(this)}>
                    <input type="text"
                           className="default"
                           autoFocus={true}
                           onBlur={()=>this.setState({activeFormMode: false})}
                           ref={(ref)=>this.boardName = ref}/>
                </form>
            )
        }
        return (
            <button onClick={()=>this.setState({activeFormMode: true})}
                    className="main-btn">Create new board</button>
        )
    }

    render() {
        return(
            <div className="boards-page">
                {this.renderBoards()}
            </div>
        )
    }
}

Boards.propTypes = {
    items: PropTypes.arrayOf(PropTypes.object)
};

export default Boards;


