import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import Textarea from 'better-react-textarea-autosize';



class BoardCard extends Component {
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
                <p className="board-info">{item.description}</p>
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

BoardCard.propTypes = {
    items: PropTypes.object
};

export default BoardCard;