import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Textarea from 'better-react-textarea-autosize';
import Select from 'react-select';
import moment from 'moment';
import classNames from 'classnames';
import DatePicker from 'react-datepicker';
import { Files } from '/imports/api/lib/collections';
import Comment from '/imports/ui/components/Comment';

class Task extends Component {
    constructor(props){
        super(props);
        const { item } = props;

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
            selectMembers: item.members ? this.memberOptions.filter(m=>item.members.find(e=>e===m.value)) : [],
            addCheckList: false,
            editCheckList: null,
            editTimeDue: false,
            timeDue: item.timeDue ? moment(item.timeDue) : null,
            addAttachment: false
        };

        this.inputs = [];
    }

    hideModal(){
        const { hideModal } = this.props;
        hideModal();
    }

    renderTitle(item){
        const { editTitle } = this.state;

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
            >{item.name}</h2>
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
            <section>
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
            </section>
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

    renderTimeDue(item){
        const { editTimeDue, timeDue } = this.state;
        let content;

        const handleChange = timeDue=>this.setState({timeDue});
        const setTimeDue = ()=>{
            if(!timeDue) return console.error("Date is empty!");

            Meteor.call('updateTask', item._id, { timeDue: timeDue.toDate() }, err=>{
                if(err) return console.error(err);

                this.setState({editTimeDue: false});
            })
        };

        if(editTimeDue){
            content = (
                <div>
                    <DatePicker
                        dateFormat="DD MMM YYYY"
                        selected={timeDue}
                        onChange={handleChange}
                        className="default"
                    />
                    <div className="controls">
                        <button className="main-btn"
                                onClick={setTimeDue}>Save</button>
                        <button className="cancel-btn"
                                onClick={()=>this.setState({editTimeDue: false, timeDue: moment(item.timeDue)})}>Cancel</button>
                    </div>
                </div>
            )
        }else{
            if(timeDue){
                content = (
                    <button className="main-btn"
                            onClick={()=>this.setState({editTimeDue: true})}
                    >{timeDue.format("DD MMM YYYY")}</button>
                )
            }else{
                content = (
                    <span className="text-link"
                          onClick={()=>this.setState({editTimeDue: true})}
                    >Add time due</span>
                )
            }
        }

        return(
            <section className="task-time-due">
                <h5 className="section-title">Time due:</h5>
                {content}
            </section>
        )
    }

    timeTraking(item){
        if(!item.timeDue) return null;
        const timeDue = moment(item.timeDue);

        const dateFormat = minutes=>{
            let lessMinutes = minutes;
            const month = lessMinutes > 60 * 24 * 30 ? Math.floor(lessMinutes / (60 * 24 * 30)) : null;
            if(month) lessMinutes = lessMinutes - (month * 60 * 24 * 30);
            const days = lessMinutes > 60 * 24 ? Math.floor(lessMinutes / (60 * 24)) : null;
            if(days) lessMinutes = lessMinutes - (days * 60 * 24);
            const hours = lessMinutes > 60 ? Math.floor(lessMinutes / 60) : null;
            if(hours) lessMinutes = lessMinutes - (hours * 60);
            let time = '';
            if(lessMinutes) time += `${lessMinutes}m `;
            if(hours) time += `${hours}h `;
            if(days) time += `${days}d `;
            if(month) time += `${month}m`;

            return time;
        };

        const timeEstimated = timeDue.diff(moment(item.createdAt), 'minutes');
        const timeRemain = timeDue.diff(moment(), 'minutes');
        const timeSpend = moment().diff(moment(item.createdAt), 'minutes');

        return (
            <section>
                <h5 className="section-title">Time tracking:</h5>
                <p>Estimated time: {dateFormat(timeEstimated)}</p>
                <p>Remain time: {dateFormat(timeRemain)}</p>
                <p>Spaned time: {dateFormat(timeSpend)}</p>
            </section>
        )
    }

    renderAttachments(item){
        const { attachments } = item;
        const { addAttachment } = this.state;

        const addAttach = ()=>{
            const file = this.fileInput.files[0] ? new FS.File(this.fileInput.files[0]) : null;
            if(file){
                Files.insert(file, (err,res)=>{
                    if(err) return console.err(err);
                    let files = [res];
                    if(attachments && attachments.length > 0){
                        files = files.concat(attachments);
                    }
                    const data = {
                        attachments: files
                    };

                    Meteor.call('updateTask', item._id, data, err=>{
                        if(err) return console.error(err);
                        this.setState({addAttachment: false});
                    })
                })
            }
        };

        let content;
        if(addAttachment){
            content = (
                <div>
                    <input type="file" ref={ref=>this.fileInput = ref}/>
                    <div className="controls">
                        <button className="main-btn"
                                onClick={addAttach}>Add file</button>
                        <button className="cancel-btn"
                                onClick={()=>this.setState({addAttachment: false})}>Cancel</button>
                    </div>
                </div>
            )
        }else {
            if(attachments && attachments.length > 0){
                content = attachments.map(item=>{
                    return (
                        <div key={item._id}>
                            <a download={item.name()}
                               href={item.url()}
                               className="text-link">{item.name()}</a>
                        </div>
                    )
                });
                content.push(
                    <div key="special-attach-key">
                        <span className="text-link"
                              onClick={()=>this.setState({addAttachment: true})}
                        >Add attachment...</span>
                    </div>
                );
            }else {
                content = (
                    <span className="text-link"
                          onClick={()=>this.setState({addAttachment: true})}
                    >No attachments, click to add...</span>
                )
            }
        }

        return(
            <section>
                <h5 className="section-title">Attachments:</h5>
                {content}
            </section>
        )
    }

    render(){
        const { item } = this.props;
        return (
            <div className="task">
                <div className="logo"></div>
                <div className="content">
                    {this.renderTitle(item)}
                    {this.renderTimeDue(item)}
                    {this.timeTraking(item)}
                    {this.renderDescription(item)}
                    {this.renderAttachments(item)}
                    {this.renderMembers(item)}
                    {this.renderCheckList(item)}
                    {this.renderCommentsForm(item)}
                    {this.renderComments()}
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