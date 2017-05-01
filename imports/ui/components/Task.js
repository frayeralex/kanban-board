import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Textarea from 'better-react-textarea-autosize';
import Select from 'react-select';
import moment from 'moment';
import classNames from 'classnames';

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

class Task extends Component {
    constructor(props){
        super(props);

        this.memberOptions =  props.members.map(member=>{
            return {
                label: member.username,
                value: member._id,
            }
        });

        this.memberStor = props.members.reduce((store,member)=>{
            store[member._id] = member;
            return store;
        },{});

        this.state = {
            editTitle: false,
            editDescription: false,
            editMembers: false,
            selectMembers: props.item.members ? this.memberOptions.filter(m=>props.item.members.find(e=>e===m.value)) : [],
            addCheckList: false,
            editCheckList: null,
        };

        this.inputs = [];
    }

    hideModal(){
        const { hideModal } = this.props;
        hideModal();
    }

    renderTitle(item){
        const { editTitle } = this.state;
        let checkListStatus = '';
        if(item.checkList && item.checkList.length > 0){
            const status = item.checkList.reduce((result,arr)=>{
                arr.items.forEach(task=>{
                    if(task.done) result.done += 1;
                    result.all +=1;
                });
                return result;
            },{done: 0, all: 0});
            checkListStatus = `${status.done}/${status.all}`
        }

        if(editTitle){
            return (
                <form onSubmit={this.updateTitle.bind(this)}
                    className="task-title-edit"
                    >
                    <input type="text"
                           defaultValue={item.name}
                           autoFocus={true}
                           onBlur={()=>this.setState({editTitle: false})}
                           ref={ref=>this.newTitle = ref}
                           className="trans-input"/>
                </form>
            )
        }
        return (
            <h2 className="task-title"
                onClick={()=>this.setState({editTitle: true})}
            >{item.name} {checkListStatus}</h2>
        )
    }

    updateTitle(event){
        event.preventDefault();

        const { item } = this.props;
        const { value: name } = this.newTitle;
        if(!name) return console.log("Name require!");
        if(name === item.name) return this.setState({editTitle: false});

        const data = {
            name,
        };

        Meteor.call('updateTask', item._id, data, err=>{
            if(err) return console.error(err);
            this.setState({editTitle: false});
        });
    }

    renderDescription(item){
        const { editDescription } = this.state;
        let content = (
            <pre onClick={()=>this.setState({editDescription: true})}>
                <span className="content">
                    {item.description || 'No description yet, click to add...'}
                </span>
            </pre>
        );
        if(editDescription){
            content = (
                <form onSubmit={this.updateDescription.bind(this)}>
                    <Textarea
                        inputRef={ref=>this.newDescription=ref}
                        defaultValue={item.description}
                        autoFocus={true}
                    />
                   <div className="controls">
                       <button type="submit" className="main-btn">Save</button>
                       <button type="button"
                               onClick={()=>this.setState({editDescription: false})}
                               className="cancel-btn">Cancel</button>
                   </div>
                </form>
            )
        }
        return (
            <div className="task-desc">
                <h6 className="section-title">Description: </h6>

                {content}
            </div>
        )
    }

    updateDescription(event){
        event.preventDefault();

        const { item } = this.props;
        const { value: description } = this.newDescription;
        if(!description) return console.log("Name require!");
        if(description === item.description) return this.setState({editDescription: false});

        const data = {
            description,
        };

        Meteor.call('updateTask', item._id, data, err=>{
            if(err) return console.error(err);
            this.setState({editDescription: false});
        });
    }

    renderMembers(item){
        const { editMembers, selectMembers } = this.state;

        const changeValue = selectMembers=>this.setState({selectMembers});

        let content;

        if(editMembers){
            content = (
                <div>
                    <Select
                        value={selectMembers}
                        multi
                        placeholder="Select members.."
                        options={this.memberOptions}
                        onChange={changeValue}
                        clearable={false}
                    />
                    <div className="controls">
                        <button onClick={this.updateMembers.bind(this)}
                                className="main-btn">Save</button>
                        <button onClick={()=>this.setState({editMembers: false})}
                                className="cancel-btn">Cancel</button>
                    </div>
                </div>
            )
        }else {
            content = this.memberOptions
                .filter(member=>item.members.find(e=>e===member.value))
                .map(member=>{
                    return (
                        <span key={`${member.label}-${member.value}`}
                              className="member-item"
                              onClick={()=>this.setState({editMembers: true})}
                        >{member.label}</span>
                    )
                });
            if(content.length === 0){
                content = <span className="text-link"
                                onClick={()=>this.setState({editMembers: true})}
                >No members yet, click to add...</span>
            }
        }

        return(
            <section className="task-members">
                <h6 className="section-title">Members: </h6>
                <div className="task-content">{content}</div>
            </section>
        )
    }

    updateMembers(){
        const { item } = this.props;
        const { selectMembers } = this.state;

        const data = {
            members: selectMembers.map(member=>member.value),
        };

        Meteor.call('updateTask', item._id, data, err=>{
            if(err) return console.error(err);
            this.setState({editMembers: false});
        });
    }

    renderCheckList(item){
        const { addCheckList, editCheckList } = this.state;

        let content;

        const addTask = ()=>{
            this.inputs.push({
                index: this.inputs.length,
                value: `Task #${this.inputs.length + 1}`,
                done: false,
            });
            this.forceUpdate();
        };

        const removeTask = index=>{
            this.inputs = this.inputs.filter(i=>i.index !== index);
            this.forceUpdate();
        };

        const updateStatus = (listIndex, taskIndex, done)=>{
            const { item } = this.props;

            const checkList = item.checkList.map((list,i)=>{
                if(i !== listIndex) return list;
                list.items = list.items.map((task,index)=>{
                    if(index !== taskIndex) return task;
                    task.done = done;
                    return task;
                });
                return list;
            });

            Meteor.call('updateTask', item._id, { checkList }, err=>{
                if(err) return console.error(err);
            });
        };

        const removeChecklist = (listIndex) =>{
            const { item } = this.props;
            const checkList = item.checkList.filter((list,index)=>index!==listIndex);
            Meteor.call('updateTask', item._id, { checkList }, err=>{
                if(err) return console.error(err);
            });
        };

        const triggerEdit = (i)=>{
            this.inputs = item.checkList[i].items.map((task, index)=>{
                return{
                    index,
                    value: task.title,
                    done: task.done,
                }
            });
            this.setState({editCheckList: i});
        };
        
        const editChecklist = (i, event) => {
            event.preventDefault();

            const { item } = this.props;
            const titleInput = event.target.querySelector('[data-role="checklist-title"]');
            const inputs = event.target.querySelectorAll('[data-role="checklist-item"]');
            const items = [];
            const title = titleInput ? titleInput.value : null;
            for(let i = 0; i < inputs.length; i++){
                items.push({title: inputs[i].value, done: inputs[i].dataset.done === 'true'})
            }
            if(!title) return console.error("Title is require!");

            const data = {
                title,
                items,
            };

            const checkList = item.checkList.map((list,index)=>{
                if(index !== i) return list;
                return data;
            });

            Meteor.call('updateTask', item._id, { checkList }, err=>{
                if(err) return console.error(err);
                this.inputs = [];
                this.setState({editCheckList: false});
            });
        };

        const generateInputs = ()=>{
            return this.inputs.map(input=>{
                if(!input) return;
                return(
                    <li key={`${Math.random()}`}
                        className="flex-wrap">
                        <input id={`dynamic-input-${input.index}`}
                               data-role="checklist-item"
                               className="default"
                               data-done={input.done || "false"}
                               defaultValue={input.value || ''}
                               type="text"/>
                        <span className="cancel-btn"
                              onClick={removeTask.bind(this, input.index)}
                        >Remove</span>
                    </li>
                )
            });
        };

        if(addCheckList){
            content  = (
                <div className="ckecklist-form">
                    <form onSubmit={this.addCheckList.bind(this)}>
                        <input type="text"
                               autoFocus={true}
                               className="default"
                               placeholder="Enter check list title"
                               data-role="checklist-title"/>
                        <span className="text-link"
                              onClick={addTask}>Add checkbox...</span>
                        <ul>{generateInputs()}</ul>
                        <div className="controls">
                            <button className="main-btn">Add check list</button>
                            <button type="button"
                                    onClick={()=>this.setState({addCheckList: false})}
                                    className="cancel-btn">Cancel</button>
                        </div>
                    </form>
                </div>
            )
        }else if (typeof editCheckList === 'number'){
            content = (
                <div className="ckecklist-form">
                    <form onSubmit={editChecklist.bind(this, editCheckList)}>
                        <input type="text"
                               autoFocus={true}
                               className="default"
                               defaultValue={item.checkList[editCheckList].title}
                               data-role="checklist-title"/>
                        <p>Items:</p>
                        <ul>{generateInputs()}</ul>
                        <span className="text-link"
                              onClick={addTask}>Add checkbox...</span>
                        <div className="controls">
                            <button className="main-btn">Save</button>
                            <button type="button"
                                    onClick={()=>this.setState({editCheckList: false})}
                                    className="cancel-btn">Cancel</button>
                        </div>
                    </form>
                </div>
            )
        } else {
            content = item.checkList.map((list,i)=>{
                return(
                    <div key={`${list.title}-${i}`}
                         className="checklist-item">
                        <h5 className="checklist-title">{list.title}  ({list.items.filter(i=>i.done).length}/{list.items.length})</h5>
                        <span className="ck-remove"
                              onClick={removeChecklist.bind(this, i)}/>
                        <span className="ck-edit"
                              onClick={triggerEdit.bind(this, i)}/>
                        <ul className="ch-list">
                            {list.items.map((task,index)=>{
                                return(
                                    <li className="ch-item" key={`${list.title}-${task.title}-${index}`}>
                                        <span className={classNames("status", {
                                            "done": task.done
                                        })} onClick={updateStatus.bind(this, i, index, !task.done)}/>
                                        <span className="title">{task.title}</span>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                )
            });
            if(content.length === 0) {
                content = (
                    <span className="text-link"
                          onClick={()=>this.setState({addCheckList: true})}
                    >Add check list...</span>
                )
            }else{
                content.push(
                    <span className="text-link"
                          key="add-checkbox-label"
                          onClick={()=>this.setState({addCheckList: true})}
                    >Add another list...</span>
                )
            }

        }

        return(
            <section className="task-checklist">
                <h6 className="section-title">Check list: </h6>
                <div className="task-content">{content}</div>
            </section>
        )
    }

    addCheckList(event){
        event.preventDefault();

        const { item } = this.props;
        const titleInput = event.target.querySelector('[data-role="checklist-title"]');
        const inputs = event.target.querySelectorAll('[data-role="checklist-item"]');
        const items = [];
        const title = titleInput ? titleInput.value : null;
        for(let i = 0; i < inputs.length; i++){
            items.push({title: inputs[i].value, done: false})
        }
        if(!title) return console.error("Title is require!");

        const data = {
            title,
            items,
        };
        Meteor.call('pushChecklistToTask', item, data, err=>{
            if(err) return console.error(err);
            this.inputs = [];
            this.setState({addCheckList: false});
        });
    }

    renderCommentsForm(item){
        const addComment = event=>{
            event.preventDefault();

            const { _id: taskId } = this.props.item;
            const text = this.comment.value;
            if(!text) return console.error("Comment must be not empty!");

            const data = {
                text,
                taskId,
            };

            Meteor.call('createComment', data, err=>{
                if(err) return console.error(err);
                this.comment.value = '';
            })
        };
        return(
            <div>
                <h5 className="section-title">Comments :</h5>
                <form onSubmit={addComment} className="comment-form" >
                        <Textarea
                            style={{boxSizing: 'border-box'}}
                            minRows={3}
                            maxRows={6}
                            inputRef={ref=>this.comment=ref}
                        />
                    <div className="controls">
                        <button type="submit"
                                className="main-btn">Add comment</button>
                    </div>
                </form>
            </div>
        )
    }

    renderComments(){
        const { comments, members } = this.props;
        const list = comments.map(item=>{
            return(
                <li key={item._id}>
                    <Comment item={item} memberStore={this.memberStor}/>
                </li>
            )
        });

        return (
            <ul className="comment-list">
                {list}
            </ul>
        )

    }

    render(){
        const { item } = this.props;
        return (
            <div className="task">
                <div className="logo"></div>
                <div className="content">
                    {this.renderTitle(item)}
                    {this.renderDescription(item)}
                    {this.renderMembers(item)}
                    {this.renderCheckList(item)}
                    {this.renderCommentsForm(item)}
                    {this.renderComments()}
                    <p>Attachments: </p>

                    <p>time due: </p>
                    <p>time left: </p>
                </div>
            </div>
        )
    }
}

Task.PropTypes = {
    item: PropTypes.object.isRequired,
    members: PropTypes.arrayOf(PropTypes.object).isRequired,
    hideModal: PropTypes.func,
};

export default Task;