import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Task from '/imports/api/composer/components/Task';

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

    render(){
        const { item } = this.props;
        return(
            <div>
                <div className="task-preview"
                     onClick={this.showModal.bind(this)}
                     onDragEnd={this.dragEnd.bind(this)}
                     draggable={true}>
                    <h4 className="title">{item.name}</h4>
                    <p className="description">{item.description}</p>
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


