import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import Textarea from 'better-react-textarea-autosize';

class Board extends Component {
    constructor(){
        super();
        this.state = {
            editState: false,
        }
    }

    updateBoard(event){
        event.preventDefault();

        const { _id: id } = this.props.item;
        const name = this.name.value;
        const description = this.description.value;

        if(!name) return console.error("Name require!");

        const data = {
            name,
        };

        if(description) data.description = description;

        Meteor.call('updateBoard', id, data, (err,res)=>{
            if(err) return console.error(err);
            this.setState({editState: false});
        });
    }

    removeBoard(){
        const { _id: id } = this.props.item;

        Meteor.call('removeBoard', id, err=>{
            if(err) return console.error(err);
        });
    }

    render(){
        const { item } = this.props;
        const { editState } = this.state;

        if(editState){
            return(
                <div className="board-preview">
                    <form onSubmit={this.updateBoard.bind(this)}>
                        <input type="text"
                               autoFocus={true}
                               className="default"
                               ref={ref=>this.name = ref}
                               defaultValue={item.name}
                        />
                        <Textarea
                            inputRef={ref=>this.description = ref}
                            defaultValue={item.description}/>
                    </form>
                    <div className="controls">
                        <button className="main-btn"
                                onClick={this.updateBoard.bind(this)}
                                >Save</button>
                        <button className="cancel-btn"
                                onClick={()=>this.setState({editState: false})}
                                >Back</button>
                    </div>
                </div>
            )
        }

        return (
            <div className="board-preview">
                <h3 className="board-title">{item.name}</h3>
                <p>{item.description}</p>
                <div className="controls">
                    <button className="main-btn"
                            onClick={()=>this.setState({editState: true})}
                            >Edit</button>
                    <button className="cancel-btn"
                            onClick={this.removeBoard.bind(this)}
                            >Remove</button>
                </div>
            </div>
        )
    }
}

Board.propTypes = {
    items: PropTypes.object
};

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
                    className="board-item">
                    <Board item={item}/>
                </li>
            )
        });

        return (
            <ul className="boards-container">
                {itemList}
                <li className="board-item">
                    <div className="body">
                        {this.renderAddBoardForm()}
                    </div>
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


