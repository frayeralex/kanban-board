import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Task from '/imports/api/composer/components/Task';
import { dateFormat } from '/imports/api/lib/helpers';
import moment from 'moment';
import classNames from 'classnames';

class TaskPreview extends Component{
    constructor(){
        super();
        this.state = {
            activeModal: false
        }
    }

    dragEnd(event){
        //push data to parent
        event.dataTransfer.setData('height', event.target);
        const { dragEnd, item } = this.props;
        dragEnd(item);
    }

    showModal(){
        this.setState({activeModal: true})
    }

    hideModal(){
        this.modal.classList.add('hide');
        const cb = (event)=>{
            if(event.target.classList.contains('task-modal')){
                this.setState({activeModal: false});
                event.target.removeEventListener('animationend', cb);
            }
        };

        this.modal.addEventListener('animationend', cb);
    }
    hideModalArea(event){
        if(!event.target.classList.contains('task-modal')) return;
        this.hideModal();
    }

    renderTaskModal(){
        const { members } = this.props;
        const { activeModal } = this.state;
        if(!activeModal) return;
        const { item } = this.props;

        return (
            <div className="task-modal"
                 onClick={this.hideModalArea.bind(this)}
                 ref={ref=>this.modal = ref}>
                <Task item={item}
                      members={members}
                      hideModal={this.hideModal.bind(this)}/>
            </div>
        )
    }

    removeTask(event){
        event.stopPropagation();
        const { item } = this.props;

        Meteor.call('removeTask', item._id);
    }

    render(){
        const { item } = this.props;
        const timeDue = moment(item.timeDue);

        const checkListStatus = item.checkList.reduce((result,arr)=>{
            arr.items.forEach(task=>{
                if(task.done) result.done += 1;
                result.all +=1;
            });
            return result;
        },{done: 0, all: 0});
        const status = checkListStatus.all ? `${checkListStatus.done}/${checkListStatus.all}`: '';

        let time = null;
        let remainTime = null;

        if(item.timeDue){
            time = <span className="time">{moment(timeDue).format("DD MMM YYYY")}</span>;
            remainTime = <span className={classNames("time",{
                "norm": timeDue.diff(moment(), 'days') >= 4,
                "warn": timeDue.diff(moment(), 'days') < 4,
                "danger": timeDue.diff(moment(), 'days') < 1,
            })}>Remain: {dateFormat(timeDue.diff(moment(), 'minutes'))}</span>;
        }

        return(
            <div>
                <div className="task-preview"
                     onClick={this.showModal.bind(this)}
                     onDragEnd={this.dragEnd.bind(this)}
                     draggable={true}>
                    <h4 className="title">{item.name} {status}</h4>
                    {time}
                    {remainTime}
                    <span className="remove-icon"
                          onClick={this.removeTask.bind(this)}/>
                </div>
                {this.renderTaskModal()}
            </div>

        )
    }
}

TaskPreview.PropTypes = {
    item: PropTypes.object.isRequired,
    members: PropTypes.arrayOf(PropTypes.object).isRequired,
    dragEnd: PropTypes.func.isRequired,
};

export default TaskPreview;


