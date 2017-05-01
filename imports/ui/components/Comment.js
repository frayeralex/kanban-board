import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Textarea from 'better-react-textarea-autosize';
import moment from 'moment';

class Comment extends Component {
    constructor(props){
        super(props);

        this.state = {
            editMode: false
        }
    }

    componentDidMount(){
        this.updateTimer();
    }

    componentWillUnmount(){
        clearTimeout(this.updaterId);
    }

    updateTimer(){
        const { item } = this.props;

        this.minutesAgo = moment().diff(moment(item.createdAt), 'minutes');
        if (this.minutesAgo === 0){
            this.updaterId = setTimeout(()=>{
                this.forceUpdate();
                this.updateTimer();
            },1000 * 10);
        }else if(this.minutesAgo < 60){
            this.updaterId = setTimeout(()=>{
                this.forceUpdate();
                this.updateTimer();
            },1000 * 60);
        }else {
            this.updaterId = setTimeout(()=>{
                this.forceUpdate();
                this.updateTimer();
            },1000 * 60 * 60);
        }
    }


    renderControls(){
        const { item } = this.props;

        const removeComment = ()=>{
            Meteor.call('removeComment', item._id)
        };

        if(Meteor.userId() === item.createdBy){
            return(
                <div className="controls">
                    <button className="main-btn"
                            onClick={()=>this.setState({editMode: true})}>Edit</button>
                    <button className="cancel-btn"
                            onClick={removeComment}>Remove</button>
                </div>
            )
        }else{
            return(
                <div className="controls">
                    <button className="main-btn">Replay</button>
                </div>
            )
        }
    }

    updateComment(event){
        event.preventDefault();

        const { _id } = this.props.item;
        const text = this.comment.value;

        if(!text) return console.error("Comment must be not empty!");

        const data = {
            text,
        };

        Meteor.call('updateComment', _id, data, err=>{
            if(err) return console.error(err);
            this.setState({editMode: false});
        })
    }

    render(){
        const { item, memberStore } = this.props;
        const { editMode } = this.state;
        const author = memberStore[item.createdBy].username;
        const dateTime = this.minutesAgo > 60 * 24 ? moment(item.createdAt).format("dddd, MMMM Do YYYY, h:mm:ss a") : moment(item.createdAt).fromNow();

        if(editMode){
            return(
                <form onSubmit={this.updateComment.bind(this)}
                      className="comment-form" >
                        <Textarea
                            style={{boxSizing: 'border-box'}}
                            minRows={3}
                            maxRows={6}
                            defaultValue={item.text}
                            inputRef={ref=>this.comment=ref}
                        />
                    <div className="controls">
                        <button type="submit"
                                className="main-btn">Update comment</button>
                        <button type="button"
                                onClick={()=>this.setState({editMode: false})}
                                className="cancel-btn">Cancel</button>
                    </div>
                </form>
            )
        }

        return(
            <div className="comment-item">
                <div className="meta-data">
                    <div className="info">
                        <span className="author">Author: {author}</span>
                        <span className="time"> Posted: {dateTime}</span>
                    </div>
                    {this.renderControls()}
                </div>
                <pre className="comment-text">
                    <span>{item.text}</span>
                </pre>
            </div>
        )
    }
}

Comment.PropTypes = {
    item: PropTypes.object.isRequired,
    memberStore: PropTypes.object.isRequired,
};

export default Comment;